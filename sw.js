// Simple SW for GH Pages
const CACHE_NAME = '183days-gh-v1-2025-08-15';
const ASSETS = ['./','./index.html','./app.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('183days-gh-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode==='navigate'){e.respondWith(fetch(req).catch(()=>caches.match('./index.html')));return;}
  e.respondWith(caches.match(req).then(c=>c||fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,cp));return res;}).catch(()=>c)));
});
