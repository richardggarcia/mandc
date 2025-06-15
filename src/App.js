import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Saved from './pages/Saved';
import './styles/globals.css';

// Componente de loading inicial
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-mc-orange-500 to-mc-red-600 flex items-center justify-center z-100">
      <div className="text-center space-y-6">
        {/* Logo animado */}
        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto animate-bounce-gentle">
          <span className="text-white font-bold text-4xl">MC</span>
        </div>
        
        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-white font-bold text-2xl">MiedoandCodicia</h1>
          <p className="text-white text-opacity-80 text-sm">Cripto News Swipe</p>
        </div>
        
        {/* Loading indicator */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        
        <p className="text-white text-opacity-60 text-xs">
          Cargando las últimas noticias cripto...
        </p>
      </div>
    </div>
  );
};

// Componente de error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">⚠️</div>
            <div className="space-y-2">
              <h2 className="text-white text-xl font-bold">Oops! Algo salió mal</h2>
              <p className="text-gray-400 text-sm">
                La aplicación encontró un error inesperado. Por favor, recarga la página.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-mc-orange-500 hover:bg-mc-orange-600 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Recargar aplicación
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors text-sm"
              >
                Limpiar datos y recargar
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left bg-gray-800 rounded-lg p-4 text-xs">
                <summary className="text-gray-400 cursor-pointer">Detalles del error</summary>
                <pre className="text-red-400 mt-2 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de navegación inferior
const BottomNavigation = ({ currentPath, onNavigate }) => {
  const navItems = [
    { 
      path: '/', 
      icon: '🏠', 
      label: 'Inicio',
      activeIcon: '🏠'
    },
    { 
      path: '/saved', 
      icon: '💾', 
      label: 'Guardadas',
      activeIcon: '💾'
    },
    { 
      path: '/stats', 
      icon: '📊', 
      label: 'Stats',
      activeIcon: '📊'
    },
    { 
      path: '/settings', 
      icon: '⚙️', 
      label: 'Config',
      activeIcon: '⚙️'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`
                flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-mc-orange-500 text-white scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <span className="text-lg">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Componente principal de la App
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Detectar si la app está instalada como PWA
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Manejar el evento beforeinstallprompt para PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Función para instalar la PWA
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  // Configurar meta tags dinámicamente
  useEffect(() => {
    // Theme color para la barra de estado
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = '#f97316';
    }

    // Configurar viewport para PWA
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    }

    // Deshabilitar zoom en iOS
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    return () => {
      document.removeEventListener('gesturestart', (e) => e.preventDefault());
      document.removeEventListener('gesturechange', (e) => e.preventDefault());
      document.removeEventListener('gestureend', (e) => e.preventDefault());
    };
  }, []);

  // Manejar splash screen
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Rutas principales */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/stats" element={<div className="p-4 text-white">Estadísticas (En desarrollo)</div>} />
            <Route path="/settings" element={<div className="p-4 text-white">Configuración (En desarrollo)</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Navegación inferior */}
          <BottomNavigation 
            currentPath={window.location.pathname}
            onNavigate={(path) => window.history.pushState(null, '', path)}
          />

          {/* Botón de instalación PWA */}
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="fixed top-4 right-4 bg-mc-orange-500 hover:bg-mc-orange-600 text-white p-3 rounded-full shadow-lg z-60 transition-colors"
              title="Instalar app"
            >
              📱
            </button>
          )}

          {/* Indicador de estado de la app */}
          {isInstalled && (
            <div className="fixed top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs z-60">
              📱 Instalada
            </div>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;