import {
  applyResource,
  deleteResource,
  getResources,
  resourceTypes,
  clusterTime,
  synchronizeClusterMetadata,
} from "./cluster-api.js";
import type { Resource } from "./cluster-model.js";
import { refreshResourceTypes, type ResourceType } from "./resource-types.js";
import { S, replaceState } from "./state.js";
import { bufferEvents, publish } from "./events.js";
import { resourceKey } from "./api-storage.js";
import { jsonPatch, mergePatch } from "./api-patch.js";
import { strategicPatch } from "./strategic-patch.js";
import { strategicSchemas } from "./strategic-schemas.js";
import { executePodFixture, type PodExecOptions } from "./pod-exec.js";
import { authorized, forbidden } from "../security/rbac.js";
import { auditRequest } from "./cluster-api.js";
import { assertCanImpersonate } from "../security/rbac.js";
import { resourceTable, type ResourceTable } from "./resource-table.js";
import { crdPrinters } from "./crd-printers.js";
import { labelPredicate, fieldPredicate } from "./selectors.js";

export interface ApiRequest {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  contentType?: string;
  accept?: string;
  impersonateUser?: string;
}
export interface ApiResponse {
  code: number;
  body: unknown;
  message?: string;
}
export function apiResourcePath(
  type: ResourceType,
  namespace?: string,
  name?: string,
) {
  const definition = resourceTypes[type];
  return (
    (definition.apiVersion === "v1"
      ? "/api/v1"
      : "/apis/" + definition.apiVersion) +
    (definition.namespaced && namespace
      ? "/namespaces/" + encodeURIComponent(namespace)
      : "") +
    "/" +
    type +
    (name ? "/" + encodeURIComponent(name) : "")
  );
}
function status(code: number, reason: string, message: string): ApiResponse {
  return {
    code,
    body: {
      apiVersion: "v1",
      kind: "Status",
      status: "Failure",
      reason,
      message,
      code,
    },
  };
}

/** Offline REST boundary. The CLI is a client; RBAC, SCC/controllers and audit remain server-owned. */
export function kubeRequest(request: ApiRequest): ApiResponse {
  if (request.impersonateUser) return bufferEvents(() => handleRequest(request), true);
  if (request.method === "GET") return handleRequest(request);
  const live = S;
  const descriptors = Object.getOwnPropertyDescriptors(live);
  for (const descriptor of Object.values(descriptors))
    if ("value" in descriptor) descriptor.value = structuredClone(descriptor.value);
  const isolated = Object.defineProperties({}, descriptors) as typeof S;
  const auditStart = live.audit.length;
  let versions: typeof live.cluster.apiStorage.objects;
  let response: ApiResponse;
  try {
    response = bufferEvents(() => {
      replaceState(isolated);
      synchronizeClusterMetadata();
      versions = structuredClone(isolated.cluster.apiStorage.objects);
      return handleRequest(request);
    }, false);
  } catch (error) {
    replaceState(live);
    throw error;
  }
  const url = new URL(request.path, "https://prod-east.invalid");
  if (response.code < 400 && url.searchParams.has("dryRun")) {
    const object = response.body as Resource;
    if (object.metadata?.name) {
      const stored = versions![resourceKey(object)];
      if (stored) object.metadata.resourceVersion = stored.resourceVersion;
      else delete object.metadata.resourceVersion;
    }
  }
  if (response.code >= 400 || url.searchParams.has("dryRun")) {
    replaceState(live);
    const match = url.pathname.match(/^\/(?:api\/v1|apis\/[^/]+\/[^/]+)\/(?:namespaces\/([^/]+)\/)?([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (match) {
      auditRequest(request.method === "POST" ? "create" : request.method === "PUT" ? "update" : request.method.toLowerCase(), match[2], match[1], match[3], response.code, (response.body as any)?.message ?? "");
      const event = S.cluster.audit.at(-1)!;
      event.requestURI = request.path;
      if (match[4]) event.objectRef.subresource = match[4];
    }
  } else {
    // A transaction commits into the existing incident object. Command queues
    // use its identity to discard results only after an actual game reset/import.
    replaceState(live);
    Object.defineProperties(live, Object.getOwnPropertyDescriptors(isolated));
    for (const event of isolated.audit.slice(auditStart)) publish(event);
  }
  return response;
}

function handleRequest(request: ApiRequest): ApiResponse {
  try {
    if (request.impersonateUser) {
      assertCanImpersonate(request.impersonateUser);
      const authenticated = S.cluster.user;
      const auditStart = S.cluster.audit.length;
      S.cluster.user = request.impersonateUser;
      try {
        return kubeRequest({ ...request, impersonateUser: undefined });
      } finally {
        S.cluster.user = authenticated;
        for (const event of S.cluster.audit.slice(auditStart)) {
          event.impersonatedUser = { username: event.user.username };
          event.user = { username: authenticated };
        }
      }
    }
    refreshResourceTypes();
    const url = new URL(request.path, "https://prod-east.invalid");
    if (url.origin !== "https://prod-east.invalid")
      return status(
        400,
        "BadRequest",
        "simulation: only the local prod-east API is available",
      );
    const versions = [
      ...new Set(Object.values(resourceTypes).map((type) => type.apiVersion)),
    ];
    if (request.method === "GET" && url.pathname === "/api")
      return { code: 200, body: { kind: "APIVersions", versions: ["v1"] } };
    if (request.method === "GET" && url.pathname === "/apis")
      return {
        code: 200,
        body: {
          kind: "APIGroupList",
          apiVersion: "v1",
          groups: [
            ...new Set(
              versions
                .filter((version) => version !== "v1")
                .map((version) => version.split("/")[0]),
            ),
          ].map((name) => {
            const groupVersions = versions
              .filter((version) => version.startsWith(name + "/"))
              .map((groupVersion) => ({
                groupVersion,
                version: groupVersion.split("/")[1],
              }));
            return {
              name,
              versions: groupVersions,
              preferredVersion: groupVersions[0],
            };
          }),
        },
      };
    for (const version of versions) {
      const base = version === "v1" ? "/api/v1" : "/apis/" + version;
      if (request.method === "GET" && url.pathname === base)
        return {
          code: 200,
          body: {
            kind: "APIResourceList",
            apiVersion: "v1",
            groupVersion: version,
            resources: Object.entries(resourceTypes)
              .filter(([, definition]) => definition.apiVersion === version)
              .map(([name, definition]) => ({
                name,
                singularName: definition.kind.toLowerCase(),
                shortNames: definition.aliases.filter(
                  (name) =>
                    name.length <= 4 && name !== definition.kind.toLowerCase(),
                ),
                namespaced: definition.namespaced,
                kind: definition.kind,
                verbs:
                  name === "projects"
                    ? ["get", "list"]
                    : ["get", "list", "create", "update", "patch", "delete"],
              })),
          },
        };
    }
    const exec = url.pathname.match(
      /^\/api\/v1\/namespaces\/([^/]+)\/pods\/([^/]+)\/exec$/,
    );
    if (exec) {
      const namespace = decodeURIComponent(exec[1]),
        name = decodeURIComponent(exec[2]);
      const record = (code: number, message = "") => {
        auditRequest("create", "pods", namespace, name, code, message);
        const event = S.cluster.audit.at(-1)!;
        event.objectRef.subresource = "exec";
        event.requestURI = url.pathname;
      };
      if (request.method !== "POST")
        return status(
          405,
          "MethodNotAllowed",
          "this fixture exec endpoint accepts POST",
        );
      if (!authorized("create", "pods/exec", namespace, name)) {
        const message = forbidden("create", "pods/exec", namespace);
        record(403, message);
        return status(
          403,
          "Forbidden",
          message.replace(/^Error from server \(Forbidden\): /, ""),
        );
      }
      const pod = getResources("pods", namespace, name)[0];
      if (!pod) {
        record(404);
        return status(404, "NotFound", `pods "${name}" not found`);
      }
      const options = request.body as PodExecOptions;
      if (
        !options ||
        !Array.isArray(options.command) ||
        !options.command.length ||
        !options.command.every((c) => typeof c === "string")
      )
        return status(400, "BadRequest", "exec requires a command array");
      const body = executePodFixture(pod, options);
      record(101);
      return { code: 101, body };
    }
    const match = url.pathname.match(
      /^\/(?:api\/(v1)|apis\/([^/]+\/[^/]+))\/(?:namespaces\/([^/]+)\/)?([^/]+)(?:\/([^/]+))?$/,
    );
    if (!match)
      return status(
        501,
        "NotImplemented",
        "simulation: API endpoint is not implemented: " + url.pathname,
      );
    const [, core, grouped, namespace, resource, name] = match;
    if (!Object.hasOwn(resourceTypes, resource))
      return status(
        501,
        "NotImplemented",
        "simulation: API resource is not implemented: " + resource,
      );
    const type = resource as ResourceType,
      definition = resourceTypes[type];
    if (
      definition.apiVersion !== (core ?? grouped) ||
      (namespace && !definition.namespaced)
    )
      return status(
        404,
        "NotFound",
        "the server could not find the requested resource",
      );
    const ns = namespace ? decodeURIComponent(namespace) : undefined,
      objectName = name ? decodeURIComponent(name) : undefined;
    if (request.method === "GET") {
      const unknownQuery = [...url.searchParams.keys()].find(
        (key) =>
          ![
            "labelSelector",
            "fieldSelector",
            "includeObject",
            "limit",
            "continue",
            "timeout",
          ].includes(key),
      );
      if (unknownQuery)
        return status(
          501,
          "NotImplemented",
          "simulation: API query is not implemented: " + unknownQuery,
        );
      const items = getResources(type, ns, objectName);
      let selected = items;
      const label = url.searchParams.get("labelSelector");
      if (label) selected = selected.filter(labelPredicate(label));
      const fields = url.searchParams.get("fieldSelector");
      if (fields)
        selected = selected.filter(fieldPredicate(fields, definition.kind));
      const limitText = url.searchParams.get("limit"),
        limit = limitText === null ? 0 : Number(limitText);
      if (!Number.isSafeInteger(limit) || limit < 0)
        return status(400, "BadRequest", "limit must be a nonnegative integer");
      const resourceVersion = String(S.cluster.apiStorage.revision);
      let offset = 0;
      if (url.searchParams.get("continue")) {
        let cursor;
        try {
          cursor = JSON.parse(atob(url.searchParams.get("continue")!));
        } catch {
          return status(400, "BadRequest", "invalid continue token");
        }
        if (
          cursor.resourceVersion !== resourceVersion ||
          cursor.path !== url.pathname
        )
          return status(
            410,
            "Expired",
            "continue token expired after the resource collection changed",
          );
        if (
          !Number.isSafeInteger(cursor.offset) ||
          cursor.offset < 0 ||
          cursor.offset > selected.length
        )
          return status(400, "BadRequest", "invalid continue token");
        offset = cursor.offset;
      }
      const end = limit
        ? Math.min(offset + limit, selected.length)
        : selected.length;
      const metadata = {
        resourceVersion,
        continue:
          end < selected.length
            ? btoa(
                JSON.stringify({
                  resourceVersion,
                  offset: end,
                  path: url.pathname,
                }),
              )
            : "",
        ...(limit ? { remainingItemCount: selected.length - end } : {}),
      };
      selected = selected.slice(offset, end);
      if (request.accept?.split(",").some((value) => /as=Table/.test(value))) {
        const customDefinition = S.cluster.resources.find(
          (r) =>
            r.kind === "CustomResourceDefinition" &&
            r.spec?.names?.plural === type,
        );
        const customColumns = customDefinition?.spec?.versions?.find(
          (v: any) => v.served && definition.apiVersion.endsWith("/" + v.name),
        )?.additionalPrinterColumns;
        const table = resourceTable(
          selected,
          definition.kind,
          clusterTime(),
          customDefinition
            ? (customColumns ?? [])
            : crdPrinters[definition.kind]?.columns,
        );
        table.metadata = metadata;
        return { code: 200, body: table };
      }
      return {
        code: 200,
        body: structuredClone(
          objectName
            ? selected[0]
            : {
                apiVersion: definition.apiVersion,
                kind: definition.kind + "List",
                metadata,
                items: selected,
              },
        ),
      };
    }
    if (type === "projects")
      return status(
        501,
        "NotImplemented",
        "simulation: Project writes are not implemented; use namespace operations or oc new-project",
      );
    if (definition.namespaced && !ns)
      return status(
        400,
        "BadRequest",
        "a namespace is required for this write",
      );
    const unknownWriteQuery = [...url.searchParams.keys()].find(key => !["dryRun", "fieldManager", "fieldValidation", "timeout"].includes(key));
    if (unknownWriteQuery) return status(501, "NotImplemented", "simulation: API write query is not implemented: " + unknownWriteQuery);
    if (url.searchParams.has("dryRun") && url.searchParams.get("dryRun") !== "All")
      return status(400, "BadRequest", 'Invalid dryRun value: only "All" is supported');
    if (request.method === "DELETE") {
      if (!objectName)
        return status(
          501,
          "NotImplemented",
          "simulation: delete collection is not implemented",
        );
      if (!authorized("delete", type, ns, objectName))
        return status(403, "Forbidden", forbidden("delete", type, ns, objectName).replace(/^Error from server \(Forbidden\): /, ""));
      const core = synchronizeClusterMetadata();
      const target = [...S.cluster.resources, ...S.cluster.sccs, ...S.cluster.events, ...core].find(item => item.kind === definition.kind && item.metadata.name === objectName && item.metadata.namespace === (definition.namespaced ? ns : undefined));
      const options = request.body as {preconditions?: {uid?: string; resourceVersion?: string}} | undefined;
      if (target && options?.preconditions && ((options.preconditions.uid && options.preconditions.uid !== target.metadata.uid) || (options.preconditions.resourceVersion && options.preconditions.resourceVersion !== target.metadata.resourceVersion)))
        return status(409, "Conflict", `${type} "${objectName}" delete precondition failed`);
      const message = deleteResource(type, objectName, ns ?? "default");
      return {
        code: 200,
        body: {
          apiVersion: "v1",
          kind: "Status",
          status: "Success",
          code: 200,
        },
        message,
      };
    }
    const pool = type === "securitycontextconstraints" ? S.cluster.sccs : type === "events" ? S.cluster.events : S.cluster.resources;
    synchronizeClusterMetadata();
    const existing = pool.find(item => item.kind === definition.kind && item.metadata.name === objectName && item.metadata.namespace === (definition.namespaced ? ns : undefined));
    let object = request.body as Resource | undefined;
    if (request.method === "PUT" || request.method === "PATCH") {
      const verb = request.method === "PUT" ? "update" : (!existing && request.contentType === "application/apply-patch+yaml") ? "create" : "patch";
      if (!authorized(verb, type, ns, objectName)) {
        const message = forbidden(verb, type, ns, objectName);
        return status(403, "Forbidden", message.replace(/^Error from server \(Forbidden\): /, ""));
      }
      if (!objectName) return status(405, "MethodNotAllowed", "a named resource is required for this operation");
      if (!existing && (request.method === "PUT" || request.contentType !== "application/apply-patch+yaml"))
        return status(404, "NotFound", `${type} "${objectName}" not found`);
      if (request.method === "PATCH") {
        switch (request.contentType) {
          case "application/merge-patch+json": object = mergePatch(existing, request.body); break;
          case "application/json-patch+json": object = jsonPatch(existing, request.body); break;
          case "application/strategic-merge-patch+json":
            object = strategicPatch(definition.kind, existing, request.body); break;
          case "application/apply-patch+yaml":
            if (existing) object = strategicSchemas[definition.kind] ? strategicPatch(definition.kind, existing, request.body) : mergePatch(existing, request.body);
            break;
          default: return status(415, "UnsupportedMediaType", "unsupported patch content type");
        }
      }
    }
    if (
      !object ||
      object.kind !== definition.kind ||
      object.apiVersion !== definition.apiVersion ||
      !object.metadata?.name ||
      (objectName && objectName !== object.metadata.name) ||
      (object.metadata.namespace && object.metadata.namespace !== ns)
    )
      return status(
        400,
        "BadRequest",
        "API object does not match the requested resource, name or namespace",
      );
    if (request.method === "POST" && objectName)
      return status(
        405,
        "MethodNotAllowed",
        "POST creates objects at the collection endpoint",
      );
    const message = applyResource(
      object,
      ns ?? "default",
      request.method === "POST",
      request.method === "POST" || !existing ? "create" : request.method === "PUT" ? "update" : "patch",
      !url.searchParams.has("dryRun"),
    );
    const stored = (
      type === "securitycontextconstraints"
        ? S.cluster.sccs
        : type === "events"
          ? S.cluster.events
          : S.cluster.resources
    ).find(
      (item) =>
        item.kind === object.kind &&
        item.metadata.name === object.metadata.name &&
        item.metadata.namespace === (definition.namespaced ? ns : undefined),
    );
    return {
      code: message.endsWith(" created") ? 201 : 200,
      body: structuredClone(stored ?? object),
      message,
    };
  } catch (error) {
    const original = (error as Error).message;
    const reason = original.match(/^Error from server \(([^)]+)\):/)?.[1];
    const codes: Record<string, number> = {
      Forbidden: 403,
      NotFound: 404,
      AlreadyExists: 409,
      Conflict: 409,
      UnsupportedMediaType: 415,
      Invalid: 422,
      BadRequest: 400,
    };
    return status(
      reason
        ? (codes[reason] ?? 400)
        : original.startsWith("simulation:")
          ? 501
          : 400,
      reason ??
        (original.startsWith("simulation:") ? "NotImplemented" : "BadRequest"),
      original.replace(/^Error from server \([^)]+\):\s*/, ""),
    );
  }
}
export function apiBody(response: ApiResponse) {
  if (response.code >= 400) {
    const body = response.body as { reason: string; message: string };
    throw new Error(
      body.reason === "NotImplemented"
        ? body.message
        : `Error from server (${body.reason}): ${body.message}`,
    );
  }
  return response.body;
}
export function readApiResources(
  type: ResourceType,
  namespace?: string,
  name?: string,
  selectors?: { label?: string; field?: string },
  impersonateUser?: string,
): Resource[] {
  const body = apiBody(
    kubeRequest({
      method: "GET",
      path: apiResourcePath(type, namespace, name) + selectorQuery(selectors),
      impersonateUser,
    }),
  );
  return name ? [body as Resource] : (body as { items: Resource[] }).items;
}
function selectorQuery(selectors?: { label?: string; field?: string }) {
  const query = new URLSearchParams();
  if (selectors?.label) query.set("labelSelector", selectors.label);
  if (selectors?.field) query.set("fieldSelector", selectors.field);
  return query.size ? "?" + query : "";
}
export function readApiTable(
  type: ResourceType,
  namespace?: string,
  name?: string,
  selectors?: { label?: string; field?: string },
  impersonateUser?: string,
): ResourceTable {
  return apiBody(
    kubeRequest({
      method: "GET",
      path: apiResourcePath(type, namespace, name) + selectorQuery(selectors),
      impersonateUser,
      accept: "application/json;as=Table;g=meta.k8s.io;v=v1,application/json",
    }),
  ) as ResourceTable;
}
export function applyApiResource(
  object: Resource,
  namespace: string,
  createOnly = false,
) {
  refreshResourceTypes();
  const entry = Object.entries(resourceTypes).find(
    ([, definition]) =>
      definition.kind === object?.kind &&
      definition.apiVersion === object?.apiVersion,
  );
  if (!entry)
    throw new Error("simulation: manifest API kind/version is not implemented");
  const type = entry[0] as ResourceType;
  const response = kubeRequest({
    method: createOnly ? "POST" : "PATCH",
    path: apiResourcePath(
      type,
      object.metadata?.namespace ?? namespace,
      createOnly ? undefined : object.metadata?.name,
    ),
    body: object,
    contentType: "application/apply-patch+yaml",
  });
  apiBody(response);
  return response.message!;
}
export function deleteApiResource(
  type: ResourceType,
  name: string,
  namespace: string,
) {
  const response = kubeRequest({
    method: "DELETE",
    path: apiResourcePath(type, namespace, name),
  });
  apiBody(response);
  return response.message!;
}
