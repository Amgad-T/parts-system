
const CACHE_NAME = 'warehouse-offline-v1';

// الملفات التي سيتم تخزينها لتعمل بدون إنترنت
const urlsToCache = [
  './',
  './index.html',
  './logo.png',
  './manifest.json',
  // تخزين مكتبة الإكسل لتعمل أوفلاين
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// حدث التثبيت: حفظ الملفات في الذاكرة المخبأة
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// حدث الجلب (عند طلب المتصفح لأي ملف)
self.addEventListener('fetch', event => {
  // نستثني ملف الإكسل وواجهة GitHub من هذا التخزين 
  // لأن الكود الخاص بك في index.html يتعامل معها ويحفظها في IndexedDB
  if (event.request.url.includes('data.xlsx') || event.request.url.includes('api.github.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان الملف موجوداً في الذاكرة، قم بإرجاعه فوراً (بدون نت)
        if (response) {
          return response;
        }
        // إذا لم يكن موجوداً، حاول جلبه من الإنترنت
        return fetch(event.request).catch(() => {
          console.log('Offline and resource not found in cache');
        });
      })
  );
});

// تحديث الذاكرة المخبأة عند وجود إصدار جديد
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
