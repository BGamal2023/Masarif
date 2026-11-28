const CACHE="masarif-v9";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
// always ask the server (no-cache = revalidate), so a new version shows on the next open
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"no-cache"})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// network first so updates show up, cache when offline
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const sameOrigin=new URL(e.request.url).origin===self.location.origin;
  e.respondWith((sameOrigin?fetch(e.request.url,{cache:"no-cache"}):fetch(e.request)).then(r=>{
    if(r.ok||r.type==="opaque"){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return r;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))));
});
