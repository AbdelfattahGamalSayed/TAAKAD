import net from 'node:net';
export function portInUse(port) {
  return new Promise(resolve => {
    const socket=net.connect({host:'127.0.0.1',port});
    const finish=value=>{socket.destroy();resolve(value);};
    socket.setTimeout(700,()=>finish(true));
    socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));
  });
}
export async function inspectRunningApp({apiPort=8787,metroPort=8081,token}={}) {
  const busy=await Promise.all([portInUse(apiPort),portInUse(metroPort)]);
  if(!busy.some(Boolean))return {status:'available',ports:[]};
  const ports=[apiPort,metroPort].filter((_,i)=>busy[i]);
  if(busy.every(Boolean)&&token){
    try{
      const origins=[`http://127.0.0.1:${apiPort}`,`http://127.0.0.1:${metroPort}`];
      const health=await Promise.all(origins.map(async origin=>{
        const r=await fetch(origin+'/api/health',{signal:AbortSignal.timeout(1500)});
        return r.ok&&(await r.json()).service==='TAAKAD';
      }));
      if(health.every(Boolean)){
        const response=await fetch(origins[1]+'/api/reports/list',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:'{}',signal:AbortSignal.timeout(1500)});
        const matched=response.ok;await response.body?.cancel();
        if(matched)return {status:'running',ports};
      }
    }catch{/* A partial or different server is never silently reused. */}
  }
  return {status:'conflict',ports};
}
