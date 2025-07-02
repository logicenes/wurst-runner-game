const CACHE_NAME = 'wurst-runner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
  '/sounds/background_sound.mp3',
  '/sounds/jump_sound.mp3',
  '/sounds/item-received.mp3',
  '/images/background.png',
  '/images/skinny-player.png',
  '/images/chocolate.png',
  '/images/hamburger.png',
  '/images/hotdog.png',
  '/images/tennisball.png',
  '/images/star.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
