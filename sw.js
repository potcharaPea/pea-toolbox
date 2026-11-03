// PEA ToolBox service worker — เปิดได้ตอนไม่มีเน็ต
// ไฟล์แอป: โหลดใหม่จากเน็ตก่อน (ได้เวอร์ชันล่าสุดเสมอ) ล้มเหลวค่อยใช้ของในเครื่อง
// รูป/ฟอนต์จากเว็บอื่น (Supabase Storage, Google Fonts): ใช้ของในเครื่องก่อน ไม่มีค่อยโหลด แล้วเก็บไว้
// ข้อมูลตาราง (/rest/v1/) ไม่แคช — ออฟไลน์แอปใช้ข้อมูลที่ฝังในไฟล์แทนอยู่แล้ว
const C = 'pea-toolbox-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.pathname.includes('/rest/v1/') || !u.protocol.startsWith('http')) return;
  const net = () => fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); }
    return r;
  });
  e.respondWith(u.origin === location.origin
    ? net().catch(() => caches.match(e.request, { ignoreSearch: true }))
    : caches.match(e.request).then(hit => hit || net()));
});
