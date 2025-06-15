import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import SwipeStack from '../components/SwipeStack';
import Header from '../components/Header';
import useNews from '../hooks/useNews';

const Home = () => {
  // Estados locales
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Hook de noticias
  const {
    news,
    isLoading,
    error,
    hasMore,
    filters,
    stats,
    loadMore,
    refresh,
    handleSwipeRight,
    handleSwipeLeft,
    handleSwipeUp,
    updateFilters
  } = useNews();

  // Animación de entrada
  const pageSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { mass: 1, tension: 120, friction: 14 }
  });

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('🟢 Conexión restaurada', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('🔴 Sin conexión a internet', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers para swipes con notificaciones
  const handleLikeNews = (newsItem) => {
    handleSwipeRight(newsItem);
    showNotification('❤️ ¡Noticia guardada!', 'success');
  };

  const handleRejectNews = (newsItem) => {
    handleSwipeLeft(newsItem);
    showNotification('👎 No me interesa', 'info');
  };

  const handleShareNews = (newsItem) => {
    handleSwipeUp(newsItem);
    showNotification('📤 ¡Compartido!', 'success');
  };

  // Filtros disponibles
  const availableFilters = {
    sentiment: [
      { value: '', label: 'Todos los sentimientos' },
      { value: 'bullish', label: '🚀 Bullish' },
      { value: 'bearish', label: '🔻 Bearish' },
      { value: 'neutral', label: '⚖️ Neutral' }
    ],
    category: [
      { value: '', label: 'Todas las categorías' },
      { value: 'bitcoin', label: '₿ Bitcoin' },
      { value: 'ethereum', label: 'Ξ Ethereum' },
      { value: 'defi', label: '🏦 DeFi' },
      { value: 'nft', label: '🎨 NFT' },
      { value: 'regulation', label: '⚖️ Regulación' },
      { value: 'adoption', label: '📈 Adopción' }
    ]
  };

  // Handler para cambiar filtros
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    updateFilters(newFilters);
    setShowFilters(false);
    showNotification(`Filtro aplicado: ${value || 'Todos'}`, 'info');
  };

  return (
    <animated.div style={pageSpring} className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <Header
        stats={stats}
        isOnline={isOnline}
        onRefresh={refresh}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {/* Filtros panel */}
      {showFilters && (
        <div className="bg-black bg-opacity-95 border-b border-gray-700 p-4 space-y-4">
          <h3 className="text-white font-bold text-lg">🔍 Filtros</h3>
          
          {/* Filtro de sentimiento */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Sentimiento del mercado
            </label>
            <select
              value={filters.sentiment || ''}
              onChange={(e) => handleFilterChange('sentiment', e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {availableFilters.sentiment.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de categoría */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Categoría
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {availableFilters.category.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                updateFilters({});
                setShowFilters(false);
                showNotification('Filtros reiniciados', 'info');
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-8">
        {/* Error state */}
        {error && !isLoading && news.length === 0 && (
          <div className="text-center space-y-4 max-w-sm">
            <div className="text-6xl">⚠️</div>
            <h3 className="text-white text-xl font-bold">Error al cargar noticias</h3>
            <p className="text-gray-400">{error}</p>
            <div className="space-y-2">
              <button
                onClick={refresh}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Reintentar
              </button>
              {!isOnline && (
                <p className="text-red-400 text-sm">
                  Verifica tu conexión a internet
                </p>
              )}
            </div>
          </div>
        )}

        {/* SwipeStack principal */}
        {!error || news.length > 0 ? (
          <div className="w-full max-w-sm h-[600px] relative">
            <SwipeStack
              newsList={news}
              onSwipeLeft={handleRejectNews}
              onSwipeRight={handleLikeNews}
              onSwipeUp={handleShareNews}
              onLoadMore={loadMore}
              isLoading={isLoading}
              hasMore={hasMore}
            />
          </div>
        ) : null}

        {/* Estadísticas rápidas */}
        {stats.totalSeen > 0 && (
          <div className="mt-8 bg-black bg-opacity-50 rounded-lg p-4 max-w-sm w-full">
            <h4 className="text-white font-bold text-center mb-2">📊 Tus estadísticas</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-orange-400 font-bold text-lg">{stats.totalSeen}</div>
                <div className="text-gray-400 text-xs">Vistas</div>
              </div>
              <div>
                <div className="text-green-400 font-bold text-lg">{stats.liked}</div>
                <div className="text-gray-400 text-xs">Me gusta</div>
              </div>
              <div>
                <div className="text-blue-400 font-bold text-lg">{stats.saved}</div>
                <div className="text-gray-400 text-xs">Guardadas</div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-white text-sm">
                Ratio de me gusta: <span className="text-orange-400 font-bold">
                  {(stats.likeRatio * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`
          fixed top-20 left-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300
          ${notification.type === 'success' ? 'bg-green-600' : 
            notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
        `}>
          <p className="text-white text-center font-medium">
            {notification.message}
          </p>
        </div>
      )}

      {/* Indicador de conexión */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-3 rounded-lg text-center z-50">
          🔴 Sin conexión - Usando modo offline
        </div>
      )}

      {/* Instrucciones para nuevos usuarios */}
      {stats.totalSeen === 0 && !isLoading && news.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-orange-500 bg-opacity-90 text-white p-3 rounded-lg text-center z-40">
          <p className="text-sm">
            👆 Desliza las noticias: ← No me interesa | ❤️ Me gusta → | ↑ Compartir
          </p>
        </div>
      )}
    </animated.div>
  );
};

export default Home;