import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

const Header = ({ 
  stats = {}, 
  isOnline = true, 
  onRefresh, 
  onToggleFilters, 
  showFilters = false,
  currentPage = 'home'
}) => {
  const [showStats, setShowStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Animación del header
  const headerSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(-20px)' },
    config: { mass: 1, tension: 200, friction: 20 }
  });

  // Animación del panel de estadísticas
  const statsSpring = useSpring({
    opacity: showStats ? 1 : 0,
    maxHeight: showStats ? '200px' : '0px',
    transform: showStats ? 'translateY(0)' : 'translateY(-10px)',
    config: { mass: 1, tension: 200, friction: 20 }
  });

  // Formatear hora
  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Obtener saludo según la hora
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 18) return '☀️ Buenas tardes';
    return '🌙 Buenas noches';
  };

  // Calcular racha de uso
  const getStreak = () => {
    const lastUsed = localStorage.getItem('mandc_last_used');
    const today = new Date().toDateString();
    
    if (lastUsed === today) {
      const streak = parseInt(localStorage.getItem('mandc_streak') || '1');
      return streak;
    } else {
      localStorage.setItem('mandc_last_used', today);
      localStorage.setItem('mandc_streak', '1');
      return 1;
    }
  };

  return (
    <animated.header style={headerSpring} className="sticky top-0 z-50 bg-black bg-opacity-95 backdrop-blur-sm border-b border-gray-800">
      {/* Header principal */}
      <div className="flex items-center justify-between p-4">
        {/* Logo y título */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">MC</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">MiedoandCodicia</h1>
            <p className="text-gray-400 text-xs">Cripto News Swipe</p>
          </div>
        </div>

        {/* Indicadores de estado */}
        <div className="flex items-center space-x-2">
          {/* Indicador de conexión */}
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          
          {/* Hora actual */}
          <span className="text-gray-400 text-sm font-mono">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Barra de navegación y controles */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Saludo y estadísticas rápidas */}
        <div className="flex items-center space-x-4">
          <span className="text-orange-400 text-sm font-medium">
            {getGreeting()}
          </span>
          
          {stats.totalSeen > 0 && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-xs">
                📊 {stats.totalSeen} vistas
              </span>
              <span className={`text-xs transition-transform ${showStats ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-2">
          {/* Botón de filtros */}
          <button
            onClick={onToggleFilters}
            className={`
              p-2 rounded-lg transition-colors text-sm
              ${showFilters 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
            title="Filtros"
          >
            🔍
          </button>

          {/* Botón de refresh */}
          <button
            onClick={onRefresh}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
            title="Actualizar noticias"
          >
            🔄
          </button>

          {/* Menú de navegación */}
          <div className="flex space-x-1">
            <button className="p-2 bg-orange-500 text-white rounded-lg text-sm">
              🏠
            </button>
            <button className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg text-sm">
              💾
            </button>
            <button className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg text-sm">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Panel de estadísticas expandible */}
      <animated.div style={statsSpring} className="overflow-hidden">
        <div className="px-4 pb-4 space-y-3">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-orange-400 font-bold text-lg">{stats.totalSeen || 0}</div>
              <div className="text-gray-400 text-xs">Total vistas</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-green-400 font-bold text-lg">{stats.liked || 0}</div>
              <div className="text-gray-400 text-xs">Me gusta</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-blue-400 font-bold text-lg">{stats.saved || 0}</div>
              <div className="text-gray-400 text-xs">Guardadas</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-purple-400 font-bold text-lg">{getStreak()}</div>
              <div className="text-gray-400 text-xs">Días racha</div>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-300 text-sm">Ratio de me gusta</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.likeRatio || 0) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm font-bold">
                  {((stats.likeRatio || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-300 text-sm">Nivel de engagement</div>
              <div className="text-white font-bold text-lg">
                {stats.totalSeen > 50 ? '🔥 Alto' : 
                 stats.totalSeen > 20 ? '⚡ Medio' : 
                 stats.totalSeen > 5 ? '📈 Bajo' : '🌱 Nuevo'}
              </div>
            </div>
          </div>

          {/* Botón para limpiar estadísticas */}
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres limpiar todas las estadísticas?')) {
                localStorage.removeItem('mandc_last_used');
                localStorage.removeItem('mandc_streak');
                localStorage.removeItem('mandc_saved_news');
                localStorage.removeItem('mandc_liked_news');
                localStorage.removeItem('mandc_rejected_news');
                window.location.reload();
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
          >
            🗑️ Limpiar historial
          </button>
        </div>
      </animated.div>

      {/* Indicador de estado offline */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-1 text-xs">
          📱 Modo offline - Algunas funciones limitadas
        </div>
      )}
    </animated.header>
  );
};

export default Header;