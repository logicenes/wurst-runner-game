self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('wurst-runner-cache-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './css/main.css',
        './js/main.js',
        './sounds/background_sound.mp3',
        './sounds/jump_sound.mp3',
        './sounds/item_received.mp3',
        './images/background.png',
        './images/skinny-player.png',
        './images/icons/skinny-player-icon.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
