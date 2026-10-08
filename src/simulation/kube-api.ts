import {
  applyResource,
  deleteResource,
  getResources,
  resourceTypes,
} from "./cluster-api.js";
import type { Resource } from "./cluster-model.js";
import type { ResourceType } from "./resource-types.js";
import { S } from "./state.js";

export interface ApiRequest {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: Resource;
  contentType?: string;
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
  try {
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
                singularName: definition.aliases[0],
                namespaced: definition.namespaced,
                kind: definition.kind,
                verbs: ["get", "list", "create", "patch", "delete"],
              })),
          },
        };
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
        (key) => key !== "labelSelector",
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
      if (label)
        selected = selected.filter((item) =>
          label.split(",").every((pair) => {
            const [key, value] = pair.split("=");
            return value !== undefined && item.metadata.labels?.[key] === value;
          }),
        );
      return {
        code: 200,
        body: structuredClone(
          objectName
            ? selected[0]
            : {
                apiVersion: definition.apiVersion,
                kind: definition.kind + "List",
                metadata: {},
                items: selected,
              },
        ),
      };
    }
    if (definition.namespaced && !ns)
      return status(
        400,
        "BadRequest",
        "a namespace is required for this write",
      );
    if (request.method === "DELETE") {
      if (!objectName)
        return status(
          501,
          "NotImplemented",
          "simulation: delete collection is not implemented",
        );
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
    const object = request.body;
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
    if (
      request.method === "PATCH" &&
      (!objectName || request.contentType !== "application/apply-patch+yaml")
    )
      return status(
        501,
        "NotImplemented",
        "simulation: REST PATCH supports named apply objects only",
      );
    const message = applyResource(
      object,
      ns ?? "default",
      request.method === "POST",
    );
    const stored = (
      type === "securitycontextconstraints"
        ? S.cluster.sccs
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
): Resource[] {
  const body = apiBody(
    kubeRequest({
      method: "GET",
      path: apiResourcePath(type, namespace, name),
    }),
  );
  return name ? [body as Resource] : (body as { items: Resource[] }).items;
}
export function applyApiResource(
  object: Resource,
  namespace: string,
  createOnly = false,
) {
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
