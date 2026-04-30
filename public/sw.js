const CACHE_NAME = 'rinyushoku-v1'

// キャッシュするリソース（アプリシェル）
const STATIC_ASSETS = [
  '/',
  '/dashboard',
]

// インストール時：静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // キャッシュ失敗しても続行
      })
    })
  )
  self.skipWaiting()
})

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// フェッチ：Network First戦略（常に最新データを取得、失敗時はキャッシュ）
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // PocketBase APIリクエストはキャッシュしない
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    return
  }

  // HTMLページはNetwork First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // 静的アセット（JS/CSS/画像）はCache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
    })
  )
})
