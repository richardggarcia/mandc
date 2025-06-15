# 🚀 MiedoandCodicia - Cripto News Swipe App

Una **Progressive Web App (PWA)** tipo Tinder para noticias cripto. Desliza para descubrir las últimas noticias del mundo crypto con una experiencia completamente inmersiva.

![MiedoandCodicia Logo](https://via.placeholder.com/200x100/f97316/ffffff?text=MiedoandCodicia)

## 📱 Características Principales

- **🔄 Swipe News**: Desliza derecha (me gusta), izquierda (no me interesa), arriba (compartir)
- **📱 PWA Nativa**: Funciona como app nativa en iOS y Android
- **🔥 Tiempo Real**: Noticias cripto actualizadas constantemente
- **💾 Offline**: Funciona sin conexión con Service Worker
- **🎯 Personalización IA**: Recomendaciones basadas en tus gustos
- **📊 Analytics**: Estadísticas de uso y preferencias
- **🌙 Dark Mode**: Diseño optimizado para modo oscuro

## 🛠️ Stack Técnico

- **Frontend**: React 18 + Hooks
- **Animaciones**: React Spring + React Use Gesture
- **Estilos**: Tailwind CSS con configuración personalizada
- **PWA**: Service Worker + Web App Manifest
- **API**: Axios para comunicación con backend
- **Routing**: React Router DOM
- **Estado**: React Context + Custom Hooks

## 🚀 Instalación Rápida

### 1. Clonar y configurar el proyecto

```bash
# 📥 Clonar desde GitHub
git clone https://github.com/richardggarcia/mandc.git
cd mandc

# 📦 Instalar dependencias
npm install

# 🎨 Configurar Tailwind CSS
npx tailwindcss init -p
```

### 2. Estructura de archivos necesaria

```bash
# 📁 Crear estructura de directorios
mkdir -p src/components src/pages src/hooks src/utils src/styles src/services public/icons

# 🗂️ Crear archivos principales
touch src/components/NewsCard.jsx
touch src/components/SwipeStack.jsx
touch src/components/Header.jsx
touch src/pages/Home.jsx
touch src/pages/Saved.jsx
touch src/hooks/useSwipe.js
touch src/hooks/useNews.js
touch src/services/api.js
touch src/styles/globals.css
touch public/manifest.json
touch public/sw.js
```

### 3. Configurar archivos principales

**src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**public/index.html** (actualizar el head)
```html
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#f97316" />
  <meta name="description" content="App de noticias cripto con swipe - MiedoandCodicia" />
  
  <!-- PWA Meta Tags -->
  <link rel="apple-touch-icon" href="%PUBLIC_URL%/icons/icon-192x192.png" />
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
  
  <!-- iOS Specific -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="MiedoandCodicia">
  
  <title>MiedoandCodicia - Cripto News Swipe</title>
</head>
```

### 4. Copiar todos los componentes

Copia todos los componentes que hemos creado en los artifacts anteriores:

1. **NewsCard.jsx** → `src/components/NewsCard.jsx`
2. **SwipeStack.jsx** → `src/components/SwipeStack.jsx`
3. **Header.jsx** → `src/components/Header.jsx`
4. **Home.jsx** → `src/pages/Home.jsx`
5. **Saved.jsx** → `src/pages/Saved.jsx`
6. **useNews.js** → `src/hooks/useNews.js`
7. **api.js** → `src/services/api.js`
8. **App.js** → `src/App.js`
9. **globals.css** → `src/styles/globals.css`
10. **tailwind.config.js** → `tailwind.config.js`
11. **manifest.json** → `public/manifest.json`
12. **sw.js** → `public/sw.js`
13. **package.json** → `package.json`

### 5. Instalar dependencias finales

```bash
# 📦 Instalar todas las dependencias
npm install

# 🎨 Instalar dependencias de desarrollo
npm install -D autoprefixer postcss tailwindcss workbox-webpack-plugin
```

### 6. Iniciar el proyecto

```bash
# 🚀 Modo desarrollo
npm start

# 🏗️ Build para producción
npm run build

# 🔍 Servir build localmente
npm run serve
```

## 🎯 Uso de la Aplicación

### Gestos de Swipe

- **← Swipe Left**: No me interesa la noticia
- **→ Swipe Right**: Me gusta, guardar noticia
- **↑ Swipe Up**: Compartir noticia en redes sociales
- **👆 Tap**: Ver detalles completos de la noticia

### Funciones Principales

1. **Feed Principal**: Stack infinito de noticias cripto
2. **Noticias Guardadas**: Ver y gestionar noticias que te gustaron
3. **Filtros**: Por sentimiento, categoría, fuente
4. **Estadísticas**: Analiza tus patrones de lectura
5. **Modo Offline**: Funciona sin conexión a internet

### Configuración PWA

La app se puede instalar como aplicación nativa:

1. **Chrome/Edge**: Botón "Instalar app" en la barra de direcciones
2. **Safari iOS**: Compartir → "Añadir a pantalla de inicio"
3. **Android**: "Añadir a pantalla de inicio" desde el menú

## 🔧 Configuración del Backend

La app conecta con la API en `https://mandc.bitsdeve.com/api/news`. 

Para cambiar la URL del backend, edita `src/services/api.js`:

```javascript
const BASE_URL = 'https://tu-backend.com/api';
```

### Endpoints esperados:

- `GET /news` - Lista de noticias con paginación
- `GET /news/:id` - Noticia específica
- `GET /categories` - Categorías disponibles
- `GET /sources` - Fuentes de noticias
- `GET /trending` - Noticias trending
- `POST /analytics/swipe` - Tracking de swipes

## 📱 Deploy y Producción

### Deploy en Vercel (Recomendado)

```bash
# 📤 Deploy directo
npm run deploy:vercel

# O configurar manualmente
npm install -g vercel
vercel --prod
```

### Deploy en Netlify

```bash
# 📤 Build y deploy
npm run build
npm run deploy:netlify
```

### Deploy personalizado

```bash
# 🏗️ Build para producción
npm run build

# Los archivos estarán en /build
# Subir a tu servidor web preferido
```

## 🎨 Personalización

### Colores y Tema

Edita `tailwind.config.js` para cambiar la paleta de colores:

```javascript
colors: {
  'mc-orange': '#f97316', // Color principal
  'mc-red': '#dc2626',    // Color de "miedo"
  'mc-green': '#16a34a',  // Color de "codicia"
}
```

### Configuración PWA

Edita `public/manifest.json` para personalizar:

- Nombre de la app
- Iconos
- Colores de tema
- Configuración de pantalla

## 🧪 Testing y Desarrollo

```bash
# 🧪 Ejecutar tests
npm test

# 📊 Analizar bundle
npm run analyze

# 🔍 Lighthouse audit
npm run pwa:test

# 🧹 Limpiar dependencias
npm run clean
```

## 📊 Monitoreo y Analytics

La app incluye tracking automático de:

- Swipes por tipo (like, nope, share)
- Tiempo de lectura
- Categorías preferidas
- Patrones de uso

Los datos se envían a `/analytics/swipe` para análisis posterior.

## 🐛 Troubleshooting

### Problemas comunes:

1. **Service Worker no se registra**:
   ```bash
   # Limpiar cache del navegador
   # Verificar que sw.js esté en /public
   ```

2. **Tailwind CSS no funciona**:
   ```bash
   # Reinstalar Tailwind
   npm uninstall tailwindcss
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **API no conecta**:
   ```bash
   # Verificar CORS en el backend
   # Comprobar URL en api.js
   ```

4. **PWA no instala**:
   ```bash
   # Verificar manifest.json
   # Comprobar Service Worker
   # Usar HTTPS en producción
   ```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la branch: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🚀 Próximas Funcionalidades

- [ ] **Notificaciones Push** para noticias importantes
- [ ] **Modo oscuro/claro** personalizable
- [ ] **Compartir en redes sociales** nativo
- [ ] **Comentarios y reacciones** en noticias
- [ ] **Alertas de precios** para criptomonedas
- [ ] **Widget de portfolio** personal
- [ ] **Integración con exchanges** (solo lectura)
- [ ] **Modo podcast** para noticias en audio

## 📞 Soporte

- **GitHub Issues**: [Issues](https://github.com/richardggarcia/mandc/issues)
- **Email**: support@miedoandcodicia.com
- **Twitter**: [@miedoandcodicia](https://twitter.com/miedoandcodicia)

---

**¡Disfruta swipeando noticias cripto! 🚀📱**

*Hecho con ❤️ por el equipo de MiedoandCodicia*