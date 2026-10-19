/* Oddiy service worker: faqat PWA/APK o'rnatilishi uchun. Hech narsani keshlamaydi, shuning uchun yangilanishlar darhol ko'rinadi. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r));
});
