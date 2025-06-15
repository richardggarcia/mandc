// Service Worker para MiedoandCodicia PWA
// Versión 1.0.0

const CACHE_NAME = 'mandc-v1.0.0';
const STATIC_CACHE = 'mandc-static-v1';
const DYNAMIC_CACHE = 'mandc-dynamic-v1';
const API_CACHE = 'mandc-api-v1';

// Archivos que se cachean en la instalación (App Shell)
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Rutas de la aplicación
  '/saved',
  '/stats',
  '/settings'
];

// URLs de API que se cachean
const API_URLS = [
  'https://mandc.bitsdeve.com/api/news',
  'https://mandc.bitsdeve.com/api/categories',
  'https://mandc.bitsdeve.com/api/sources'
];

// URLs que nunca se cachean
const NEVER_CACHE = [
  '/api/analytics',
  '/api/tracking',
  'chrome-extension://',
  'moz-extension://'
];

// Duración del cache (en milisegundos)
const CACHE_DURATION = {
  API: 5 * 60 * 1000,      // 5 minutos para API
  IMAGES: 24 * 60 * 60 * 1000, // 24 horas para imágenes
  STATIC: 7 * 24 * 60 * 60 * 1000 // 7 días para archivos estáticos
};

// Configuración de notificaciones
const NOTIFICATION_CONFIG = {
  badge: '/icons/icon-96x96.png',
  icon: '/icons/icon-192x192.png',
  vibrate: [200, 100, 200],
  requireInteraction: false,
  silent: false
};

// === EVENTOS DEL SERVICE WORKER ===

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Instalando Service Worker v' + CACHE_NAME);
  
  event.waitUntil(
    Promise.all([
      // Crear cache estático
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 SW: Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Crear otros caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ SW: Service Worker instalado correctamente');
      // Forzar activación inmediata
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ SW: Error en instalación:', error);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: Activando Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      cleanOldCaches(),
      // Tomar control de todas las pestañas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW: Service Worker activado');
      // Notificar a los clientes sobre la activación
      notifyClients('sw-activated');
    })
  );
});

// Interceptar requests de red
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorar requests que no debemos cachear
  if (shouldSkipRequest(request)) {
    return;
  }
  
  // Estrategia según el tipo de request
  if (isApiRequest(url)) {
    // API: Network First con fallback a cache
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (isImageRequest(request)) {
    // Imágenes: Cache First con fallback a network
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
  } else if (isStaticAsset(request)) {
    // Archivos estáticos: Cache First
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // Páginas HTML: Network First con fallback a cache
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
  }
});

// Manejar mensajes desde la aplicación
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_NEWS':
      cacheNewsData(data);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    default:
      console.log('📨 SW: Mensaje no reconocido:', type);
  }
});

// Manejar background sync para noticias
self.addEventListener('sync', (event) => {
  console.log('🔄 SW: Background sync:', event.tag);
  
  if (event.tag === 'background-news-sync') {
    event.waitUntil(syncNewsInBackground());
  }
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('📱 SW: Push notification recibida');
  
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(showNotification(data));
  }
});

// Manejar click en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 SW: Click en notificación');
  
  event.notification.close();
  
  // Abrir o enfocar la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Si hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// === ESTRATEGIAS DE CACHE ===

// Network First: Intenta red primero, fallback a cache
async function networkFirstStrategy(request, cacheName) {
  try {
    // Intentar obtener de la red
    const response = await fetch(request);
    
    if (response.ok) {
      // Guardar en cache si la respuesta es exitosa
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🌐 SW: Red no disponible, usando cache para:', request.url);
    
    // Si falla la red, intentar obtener del cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, devolver página offline
    if (request.destination === 'document') {
      return caches.match('/offline.html') || createOfflineResponse();
    }
    
    throw error;
  }
}

// Cache First: Busca en cache primero, fallback a red
async function cacheFirstStrategy(request, cacheName) {
  // Buscar en cache primero
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse && !isCacheExpired(cachedResponse)) {
    return cachedResponse;
  }
  
  try {
    // Si no está en cache o está expirado, obtener de la red
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Si falla la red y hay algo en cache (aunque esté expirado), usarlo
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// === FUNCIONES AUXILIARES ===

// Verificar si se debe saltar el request
function shouldSkipRequest(request) {
  const url = request.url;
  
  return (
    request.method !== 'GET' ||
    NEVER_CACHE.some(pattern => url.includes(pattern)) ||
    url.includes('chrome-extension') ||
    url.includes('moz-extension') ||
    url.includes('safari-extension')
  );
}

// Verificar si es request de API
function isApiRequest(url) {
  return url.hostname === 'mandc.bitsdeve.com' && url.pathname.startsWith('/api/');
}

// Verificar si es request de imagen
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

// Verificar si es archivo estático
function isStaticAsset(request) {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'manifest' ||
         /\.(js|css|woff|woff2|ttf|eot)$/i.test(request.url);
}

// Verificar si el cache está expirado
function isCacheExpired(response) {
  const cachedTime = response.headers.get('sw-cached-time');
  if (!cachedTime) return true;
  
  const age = Date.now() - parseInt(cachedTime);
  const maxAge = isImageRequest({ url: response.url }) ? 
                 CACHE_DURATION.IMAGES : 
                 CACHE_DURATION.API;
                 
  return age > maxAge;
}

// Limpiar caches antiguos
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (cacheName !== CACHE_NAME && 
          cacheName !== STATIC_CACHE && 
          cacheName !== DYNAMIC_CACHE && 
          cacheName !== API_CACHE) {
        console.log('🗑️ SW: Eliminando cache antiguo:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

// Cachear datos de noticias
async function cacheNewsData(newsData) {
  try {
    const cache = await caches.open(API_CACHE);
    const response = new Response(JSON.stringify(newsData), {
      headers: {
        'Content-Type': 'application/json',
        'sw-cached-time': Date.now().toString()
      }
    });
    
    await cache.put('/api/news/offline', response);
    console.log('💾 SW: Noticias cacheadas para uso offline');
  } catch (error) {
    console.error('❌ SW: Error cacheando noticias:', error);
  }
}

// Sincronizar noticias en background
async function syncNewsInBackground() {
  try {
    console.log('🔄 SW: Sincronizando noticias en background');
    
    const response = await fetch('https://mandc.bitsdeve.com/api/news?limit=10');
    if (response.ok) {
      const newsData = await response.json();
      await cacheNewsData(newsData);
      
      // Notificar a los clientes sobre las nuevas noticias
      notifyClients('news-updated', { count: newsData.news?.length || 0 });
    }
  } catch (error) {
    console.error('❌ SW: Error en background sync:', error);
  }
}

// Mostrar notificación
async function showNotification(data) {
  const options = {
    ...NOTIFICATION_CONFIG,
    body: data.body || 'Nuevas noticias cripto disponibles',
    tag: data.tag || 'news-update',
    data: data.url || '/',
    actions: [
      {
        action: 'view',
        title: 'Ver noticias',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Cerrar',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  return self.registration.showNotification(
    data.title || 'MiedoandCodicia',
    options
  );
}

// Notificar a todos los clientes
function notifyClients(type, data = {}) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, data });
    });
  });
}

// Obtener estado del cache
async function getCacheStatus() {
  const staticCache = await caches.open(STATIC_CACHE);
  const dynamicCache = await caches.open(DYNAMIC_CACHE);
  const apiCache = await caches.open(API_CACHE);
  
  const [staticKeys, dynamicKeys, apiKeys] = await Promise.all([
    staticCache.keys(),
    dynamicCache.keys(),
    apiCache.keys()
  ]);
  
  return {
    static: staticKeys.length,
    dynamic: dynamicKeys.length,
    api: apiKeys.length,
    total: staticKeys.length + dynamicKeys.length + apiKeys.length
  };
}

// Limpiar todos los caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ SW: Todos los caches eliminados');
}

// Crear respuesta offline de emergencia
function createOfflineResponse() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MiedoandCodicia - Sin conexión</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #f97316, #dc2626);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        h1 { font-size: 2em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        button { 
          background: white; 
          color: #f97316; 
          border: none; 
          padding: 15px 30px; 
          border-radius: 25px; 
          font-size: 1em; 
          cursor: pointer;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>🔴 Sin conexión</h1>
      <p>No hay conexión a internet disponible</p>
      <button onclick="window.location.reload()">Reintentar</button>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

console.log('🚀 SW: Service Worker cargado correctamente');