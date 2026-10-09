import type {Resource} from '../simulation/cluster-model.js';

const ready = (p:Resource) => !p.metadata.deletionTimestamp && (p.status?.conditions as any[]|undefined)?.some(c=>c.type==='Ready'&&c.status==='True')===true;
export function selectedServicePods(service:Resource,resources:Resource[]) {
  const selector=service.spec?.selector;
  if(!selector||!Object.keys(selector).length)return [];
  return resources.filter(p=>p.kind==='Pod'&&p.metadata.namespace===service.metadata.namespace&&Object.entries(selector).every(([k,v])=>p.metadata.labels?.[k]===v)&&p.status?.podIP&&!['Succeeded','Failed'].includes(String(p.status?.phase)));
}
export function serviceTargetPort(pod:Resource,port:any):number|undefined {
  const target=port.targetPort??port.port;
  return typeof target==='number'?target:pod.spec?.containers?.flatMap(c=>c.ports??[]).find(p=>p.name===target&&(p.protocol??'TCP')===(port.protocol??'TCP'))?.containerPort;
}
export function serviceBackends(service:Resource,resources:Resource[],port:any) {
  return selectedServicePods(service,resources).flatMap(pod=>{
    const targetPort=serviceTargetPort(pod,port);
    return targetPort!==undefined&&(ready(pod)||service.spec?.publishNotReadyAddresses)?[{pod,port:targetPort}]:[];
  });
}
const managed = 'endpointslice-controller.k8s.io';
/** Selector-owned endpoints only; selectorless Services keep their manually supplied endpoints. */
export function reconcileServices(resources:Resource[]) {
  const services=resources.filter(r=>r.kind==='Service');
  for(const service of services) {
    if(service.spec?.type==='ExternalName'||!service.spec?.selector||!Object.keys(service.spec.selector).length)continue;
    const pods=selectedServicePods(service,resources), groups=new Map<string,{ports:any[];pods:Resource[]}>();
    for(const pod of pods) {
      const ports=(service.spec?.ports??[]).flatMap((port:any)=>{
        const target=serviceTargetPort(pod,port);
        return target===undefined?[]:[{...(port.name?{name:port.name}:{}),port:target,protocol:port.protocol??'TCP'}];
      });
      if(!ports.length)continue;
      const key=JSON.stringify(ports);const group:{ports:any[];pods:Resource[]}=groups.get(key)??{ports,pods:[]};group.pods.push(pod);groups.set(key,group);
    }
    const owner={apiVersion:'v1',kind:'Service',name:service.metadata.name,uid:service.metadata.uid??'',controller:true};
    const metadata={name:service.metadata.name,namespace:service.metadata.namespace,creationTimestamp:service.metadata.creationTimestamp,labels:{...service.metadata.labels},ownerReferences:[owner]};
    const subsets=[...groups.values()].map(group=>({
      addresses:group.pods.filter(p=>ready(p)||service.spec?.publishNotReadyAddresses).map(p=>({ip:p.status!.podIP,nodeName:p.spec?.nodeName,targetRef:{kind:'Pod',namespace:p.metadata.namespace,name:p.metadata.name,uid:p.metadata.uid}})),
      notReadyAddresses:group.pods.filter(p=>!ready(p)&&!service.spec?.publishNotReadyAddresses).map(p=>({ip:p.status!.podIP,nodeName:p.spec?.nodeName,targetRef:{kind:'Pod',namespace:p.metadata.namespace,name:p.metadata.name,uid:p.metadata.uid}})),ports:group.ports,
    })).map(({addresses,notReadyAddresses,...rest})=>({...rest,...(addresses.length?{addresses}:{}),...(notReadyAddresses.length?{notReadyAddresses}:{})}));
    const existing=resources.find(r=>r.kind==='Endpoints'&&r.metadata.name===service.metadata.name&&r.metadata.namespace===service.metadata.namespace);
    if(existing)existing.subsets=subsets;else resources.push({apiVersion:'v1',kind:'Endpoints',metadata,subsets});
    const oldSlices=resources.filter(r=>r.kind==='EndpointSlice'&&r.metadata.labels?.['endpointslice.kubernetes.io/managed-by']===managed&&r.metadata.namespace===service.metadata.namespace&&r.metadata.labels['kubernetes.io/service-name']===service.metadata.name);
    const slices=[...groups.values()];if(!slices.length)slices.push({ports:[],pods:[]});
    const names=new Set<string>();
    slices.forEach((group,i)=>{
      const name=service.metadata.name+'-sim-'+i;names.add(name);
      const data={addressType:'IPv4',ports:group.ports,endpoints:group.pods.map(p=>({addresses:[p.status!.podIP],conditions:{ready:!!service.spec?.publishNotReadyAddresses||ready(p),serving:ready(p),terminating:!!p.metadata.deletionTimestamp},nodeName:p.spec?.nodeName,targetRef:{kind:'Pod',namespace:p.metadata.namespace,name:p.metadata.name,uid:p.metadata.uid}}))};
      const existing=oldSlices.find(r=>r.metadata.name===name);
      if(existing)Object.assign(existing,data);else resources.push({apiVersion:'discovery.k8s.io/v1',kind:'EndpointSlice',metadata:{...metadata,name,labels:{'kubernetes.io/service-name':service.metadata.name,'endpointslice.kubernetes.io/managed-by':managed}},...data});
    });
    for(const old of oldSlices)if(!names.has(old.metadata.name))resources.splice(resources.indexOf(old),1);
  }
  for(let i=resources.length-1;i>=0;i--) {
    const r=resources[i];
    if(['Endpoints','EndpointSlice'].includes(r.kind)&&r.metadata.ownerReferences?.some(o=>o.kind==='Service'&&!services.some(s=>s.metadata.name===o.name&&s.metadata.namespace===r.metadata.namespace)))resources.splice(i,1);
  }
  for(const route of resources.filter(r=>r.kind==='Route')) {
    const duplicate=resources.find(r=>r!==route&&r.kind==='Route'&&r.spec?.host===route.spec?.host&&(r.spec?.path??'')===(route.spec?.path??'')&&String(r.metadata.creationTimestamp)<String(route.metadata.creationTimestamp));
    route.status={ingress:[{host:route.spec?.host,routerName:'default',routerCanonicalHostname:'router-default.apps.prod-east.example.test',wildcardPolicy:route.spec?.wildcardPolicy??'None',conditions:[{type:'Admitted',status:duplicate?'False':'True',...(duplicate?{reason:'HostAlreadyClaimed',message:`a route in another namespace holds host ${route.spec?.host}`}:{})}]}]};
  }
}
export function initialApplicationNetwork():Resource[] {
  return [
    ...[{name:'payment-api',port:8080,ip:'172.30.0.10'},{name:'ledger',port:8443,ip:'172.30.0.11'}].map(s=>({apiVersion:'v1',kind:'Service',metadata:{name:s.name,namespace:'payments',creationTimestamp:'2026-10-08T00:14:00Z',labels:{app:s.name}},spec:{type:'ClusterIP',clusterIP:s.ip,clusterIPs:[s.ip],selector:{app:s.name},ports:[{name:'http',port:s.port,targetPort:s.port,protocol:'TCP'}]}})),
    {apiVersion:'route.openshift.io/v1',kind:'Route',metadata:{name:'payment-api',namespace:'payments',creationTimestamp:'2026-10-08T00:14:00Z',labels:{app:'payment-api'}},spec:{host:'payment-api-payments.apps.prod-east.example.test',to:{kind:'Service',name:'payment-api',weight:100},port:{targetPort:'http'},tls:{termination:'edge',insecureEdgeTerminationPolicy:'Redirect'},wildcardPolicy:'None'}},
  ];
}
