import {S} from "./state.js";
import type {Resource} from "./cluster-model.js";
/** Authored kubelet range allocator. Ranges remain stable for a sandbox and persist in offline checkpoints. */
export function userNamespaceRange(pod:Resource) {
  const state=S.cluster.userNamespaces;
  const key=pod.metadata.namespace+"/"+pod.metadata.name+"@"+pod.metadata.creationTimestamp;
  if(state.allocations[key]===undefined)state.allocations[key]=65536*(++state.sequence);
  return state.allocations[key];
}
