// Cache only the public offline page. Never cache accounts, API responses or logs.
const CACHE='form-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/offline.html','/offline.css'])));self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(new URL(event.request.url).pathname==='/offline.css'){event.respondWith(caches.match('/offline.css').then(cached=>cached||fetch(event.request)));return}
  if(event.request.mode==='navigate'&&new URL(event.request.url).origin===self.location.origin){
    event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));
  }
});
