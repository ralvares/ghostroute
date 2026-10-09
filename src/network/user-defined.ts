import { S } from "../simulation/state.js";
import type { Resource } from "../simulation/cluster-model.js";
import { matchesLabels } from "../security/network-policy.js";
export const primaryLabel = "k8s.ovn.org/primary-user-defined-network";
const protection = "k8s.ovn.org/user-defined-network-protection";
export function networkSpec(network:Resource) {return network.kind==="ClusterUserDefinedNetwork"?network.spec?.network:network.spec;}
export function networkConfig(network:Resource) {const spec=networkSpec(network);return spec?.topology==="Layer3"?spec.layer3:spec?.layer2;}
export function selectedNamespaces(network:Resource,resources:Resource[]=S.cluster.resources) {
  return resources.filter(r=>r.kind==="Namespace"&&(network.kind==="UserDefinedNetwork"?r.metadata.name===network.metadata.namespace:matchesLabels(r.metadata.labels,network.spec?.namespaceSelector)));
}
export function networkDomain(network:Resource,namespace:string) {return network.kind==="ClusterUserDefinedNetwork"?"cluster_udn_"+network.metadata.name:namespace+"_"+network.metadata.name;}
export function validateNetwork(network:Resource) {
  if(!["UserDefinedNetwork","ClusterUserDefinedNetwork"].includes(network.kind))return;
  const spec=networkSpec(network), config=networkConfig(network);
  if(!spec||!["Layer2","Layer3"].includes(spec.topology)) throw new Error("simulation: UDN Layer2 and Layer3 are implemented; Localnet/EVPN dataplanes are not implemented");
  if(!config||!["Primary","Secondary"].includes(config.role)) throw new Error(`Error from server (Invalid): ${network.kind} requires a topology configuration and role`);
  if(config.role!=="Primary")throw new Error("simulation: secondary UDN attachment is not implemented; use the authored NetworkAttachmentDefinition workflow");
  if(!Array.isArray(config.subnets)||config.subnets.length!==1)throw new Error("simulation: UDN address allocation currently supports one IPv4 subnet; dual-stack/IPv6 are not implemented");
  ipv4Range(spec.topology==="Layer3"?config.subnets[0].cidr:config.subnets[0]);
  if(spec.topology==="Layer3") {
    const subnet=config.subnets[0], prefix=Number(subnet.cidr.split("/")[1]);
    if(subnet.hostSubnet!==undefined&&(!Number.isInteger(subnet.hostSubnet)||subnet.hostSubnet<prefix||subnet.hostSubnet>30)) throw new Error("Error from server (Invalid): Layer3 hostSubnet must fit inside its CIDR");
  }
  if(config.ipam?.mode&&config.ipam.mode!=="Enabled")throw new Error("simulation: disabled/DHCP UDN IPAM is not implemented");
  if(network.kind==="ClusterUserDefinedNetwork"&&!network.spec?.namespaceSelector)throw new Error("Error from server (Invalid): ClusterUserDefinedNetwork requires namespaceSelector");
}
export function ipv4Range(cidr:string):{base:number;size:number;prefix:number} {
  const match=String(cidr).match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
  if(!match||match.slice(1,5).some(o=>Number(o)>255)||Number(match[5])>30||Number(match[5])<8)throw new Error("simulation: network allocation supports IPv4 CIDRs with prefixes /8 through /30");
  const value=match.slice(1,5).reduce((a,n)=>a*256+Number(n),0), prefix=Number(match[5]), size=2**(32-prefix);
  if(value%size)throw new Error("Error from server (Invalid): subnet CIDR must use the network address");
  return {base:value,size,prefix};
}
export function ipString(value:number) {return [24,16,8,0].map(shift=>Math.floor(value/2**shift)%256).join(".");}
/** Reconcile real NAD/condition objects. Network attachment is separately evaluated when a Pod sandbox is created. */
export function reconcileNetworks() {
  const resources=S.cluster.resources;
  for(const ns of resources.filter(r=>r.kind==="Namespace")) ns.metadata.labels={...ns.metadata.labels,"kubernetes.io/metadata.name":ns.metadata.name};
  const networks=resources.filter(r=>["UserDefinedNetwork","ClusterUserDefinedNetwork"].includes(r.kind));
  for(const network of networks) {
    const config=networkConfig(network),spec=networkSpec(network),namespaces=selectedNamespaces(network);
    let error="";const synced:string[]=[];
    for(const namespace of namespaces) {
      const ns=namespace.metadata.name;
      if(ns==="default"||ns.startsWith("openshift-")||ns.startsWith("kube-")) {error=`namespace "${ns}" is reserved`;continue;}
      if(config?.role==="Primary"&&!Object.hasOwn(namespace.metadata.labels??{},primaryLabel)) {error=`namespace "${ns}" does not have the required "${primaryLabel}" label`;continue;}
      const conflict=networks.find(r=>r!==network&&networkConfig(r)?.role==="Primary"&&selectedNamespaces(r).some(n=>n.metadata.name===ns)&&(r.status?.conditions as any[]|undefined)?.some((c:any)=>c.type==="NetworkCreated"&&c.status==="True"));
      if(conflict) {error=`primary network already exist in namespace "${ns}": "${conflict.metadata.name}"`;continue;}
      const existing=resources.find(r=>r.kind==="NetworkAttachmentDefinition"&&r.metadata.namespace===ns&&r.metadata.name===network.metadata.name);
      if(existing&&!existing.metadata.ownerReferences?.some(o=>o.kind===network.kind&&o.name===network.metadata.name)) {error="foreign NetworkAttachmentDefinition with the desired name already exist";continue;}
      const conf={cniVersion:"1.0.0",name:networkDomain(network,ns),type:"ovn-k8s-cni-overlay",netAttachDefName:ns+"/"+network.metadata.name,topology:spec?.topology.toLowerCase(),role:config?.role.toLowerCase(),subnets:config?.subnets.map((subnet:any)=>typeof subnet==="string"?subnet:subnet.cidr+(subnet.hostSubnet?"/"+subnet.hostSubnet:"")).join(","),...(config?.mtu?{mtu:config.mtu}:{})};
      const nad:Resource={apiVersion:"k8s.cni.cncf.io/v1",kind:"NetworkAttachmentDefinition",metadata:{name:network.metadata.name,namespace:ns,ownerReferences:[{apiVersion:network.apiVersion,kind:network.kind,name:network.metadata.name,uid:network.metadata.uid!,controller:true}]},spec:{config:JSON.stringify(conf)}};
      if(existing)existing.spec=nad.spec;else resources.push(nad);
      synced.push(ns);
    }
    // Removing namespace selection must remove its controller-owned attachment, while existing Pods retain their sandbox until recreated.
    const retained=resources.filter(r=>r.kind!=="NetworkAttachmentDefinition"||!r.metadata.ownerReferences?.some(o=>o.kind===network.kind&&o.name===network.metadata.name)||network.kind==="UserDefinedNetwork"&&r.metadata.namespace!==network.metadata.namespace||synced.includes(r.metadata.namespace!));
    resources.splice(0,resources.length,...retained);
    network.status={conditions:[{type:"NetworkCreated",status:error?"False":"True",reason:error?"SyncError":"NetworkAttachmentDefinitionCreated",message:error||(network.kind==="ClusterUserDefinedNetwork"?`NetworkAttachmentDefinition has been created in following namespaces: [${synced.join(" ")}]`:"NetworkAttachmentDefinition has been created"),observedGeneration:network.metadata.generation??1,lastTransitionTime:(network.status?.conditions as any[]|undefined)?.[0]?.lastTransitionTime??network.metadata.creationTimestamp??"2026-10-08T02:14:00Z"}]};
  }
  S.cluster.resources=S.cluster.resources.filter(r=>r.kind!=="NetworkAttachmentDefinition"||!r.metadata.ownerReferences?.some(o=>["UserDefinedNetwork","ClusterUserDefinedNetwork"].includes(o.kind)&&!networks.some(n=>n.kind===o.kind&&n.metadata.name===o.name&&(o.kind==="ClusterUserDefinedNetwork"||n.metadata.namespace===r.metadata.namespace))));
}
export function primaryNetwork(namespace:string,resources:Resource[]) {
  return resources.find(r=>["UserDefinedNetwork","ClusterUserDefinedNetwork"].includes(r.kind)&&networkConfig(r)?.role==="Primary"&&selectedNamespaces(r,resources).some(n=>n.metadata.name===namespace)&&(r.status?.conditions as any[]|undefined)?.some((c:any)=>c.type==="NetworkCreated"&&c.status==="True"));
}
export function awaitingPrimaryNetwork(pod:Resource) {
  const namespace=S.cluster.resources.find(r=>r.kind==="Namespace"&&r.metadata.name===pod.metadata.namespace);
  return Object.hasOwn(namespace?.metadata.labels??{},primaryLabel)&&!primaryNetwork(pod.metadata.namespace!,S.cluster.resources);
}
