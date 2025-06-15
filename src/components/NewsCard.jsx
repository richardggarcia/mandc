import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';

const NewsCard = ({ 
  news, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  style = {},
  isActive = false 
}) => {
  // Estados para el swipe
  const [{ x, y, rot, scale }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: 0,
    scale: 1,
    config: { mass: 1, tension: 500, friction: 50 }
  }));

  // Configuración del drag/swipe
  const bind = useDrag(({ args: [index], down, movement: [mx, my], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2; // Velocidad mínima para trigger
    const dir = xDir < 0 ? -1 : 1; // Dirección del swipe
    
    // Si no está siendo arrastrado, volver a posición original
    if (!down && !trigger) {
      set({ x: 0, y: 0, rot: 0, scale: 1 });
      return;
    }

    // Durante el drag
    if (down) {
      set({
        x: mx,
        y: my,
        rot: mx / 100,
        scale: 1.1,
        immediate: false
      });
    } else if (trigger) {
      // Determinar tipo de swipe
      if (Math.abs(my) > Math.abs(mx) && my < -50) {
        // Swipe UP - Compartir
        set({
          x: 0,
          y: -window.innerHeight,
          rot: 0,
          scale: 0.8,
          immediate: false
        });
        setTimeout(() => onSwipeUp && onSwipeUp(news), 200);
      } else if (mx > 50) {
        // Swipe RIGHT - Me gusta
        set({
          x: window.innerWidth,
          y: my,
          rot: dir * 45,
          scale: 0.8,
          immediate: false
        });
        setTimeout(() => onSwipeRight && onSwipeRight(news), 200);
      } else if (mx < -50) {
        // Swipe LEFT - No me interesa
        set({
          x: -window.innerWidth,
          y: my,
          rot: dir * 45,
          scale: 0.8,
          immediate: false
        });
        setTimeout(() => onSwipeLeft && onSwipeLeft(news), 200);
      } else {
        // Volver a posición original
        set({ x: 0, y: 0, rot: 0, scale: 1 });
      }
    }
  });

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  // Función para obtener color de sentimiento
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish':
        return 'text-green-400';
      case 'negative':
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  // Función para obtener emoji de sentimiento
  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish':
        return '🚀';
      case 'negative':
      case 'bearish':
        return '🔻';
      default:
        return '⚖️';
    }
  };

  return (
    <animated.div
      {...bind()}
      style={{
        transform: x.to(x => `translateX(${x}px) translateY(${y.get()}px) rotate(${rot.get()}deg) scale(${scale.get()})`),
        ...style
      }}
      className={`
        absolute w-full h-full max-w-sm mx-auto bg-gradient-to-br from-gray-900 to-black 
        rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden
        ${isActive ? 'z-10' : 'z-0'}
      `}
    >
      {/* Indicadores de swipe */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Indicador LIKE (derecha) */}
        <animated.div
          style={{
            opacity: x.to(x => (x > 0 ? x / 100 : 0))
          }}
          className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg"
        >
          ❤️ LIKE
        </animated.div>
        
        {/* Indicador NOPE (izquierda) */}
        <animated.div
          style={{
            opacity: x.to(x => (x < 0 ? Math.abs(x) / 100 : 0))
          }}
          className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg"
        >
          👎 NOPE
        </animated.div>
        
        {/* Indicador SHARE (arriba) */}
        <animated.div
          style={{
            opacity: y.to(y => (y < 0 ? Math.abs(y) / 100 : 0))
          }}
          className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg"
        >
          📤 SHARE
        </animated.div>
      </div>

      {/* Contenido de la noticia */}
      <div className="relative h-full flex flex-col">
        {/* Header con fuente y tiempo */}
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
          <div className="flex items-center space-x-2">
            {news.source_logo && (
              <img 
                src={news.source_logo} 
                alt={news.source} 
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-gray-300 text-sm font-medium">{news.source}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getSentimentColor(news.sentiment)}`}>
              {getSentimentEmoji(news.sentiment)}
            </span>
            <span className="text-gray-400 text-sm">{formatDate(news.published_date)}</span>
          </div>
        </div>

        {/* Imagen principal */}
        {news.image_url && (
          <div className="relative flex-1 min-h-[200px]">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        )}

        {/* Contenido de texto */}
        <div className="p-6 space-y-4 bg-gradient-to-t from-black to-transparent">
          {/* Categorías/Tags */}
          {news.categories && news.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {news.categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="bg-orange-500 bg-opacity-20 text-orange-300 px-3 py-1 rounded-full text-xs font-medium border border-orange-500 border-opacity-30"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Título */}
          <h2 className="text-white text-xl font-bold leading-tight line-clamp-3">
            {news.title}
          </h2>

          {/* Descripción */}
          {news.description && (
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
              {news.description}
            </p>
          )}

          {/* Precio/Métricas (si disponible) */}
          {(news.price || news.market_cap || news.volume) && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              {news.price && (
                <div className="text-center">
                  <div className="text-green-400 font-bold">${news.price}</div>
                  <div className="text-gray-400 text-xs">Precio</div>
                </div>
              )}
              {news.market_cap && (
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{news.market_cap}</div>
                  <div className="text-gray-400 text-xs">Market Cap</div>
                </div>
              )}
              {news.volume && (
                <div className="text-center">
                  <div className="text-purple-400 font-bold">{news.volume}</div>
                  <div className="text-gray-400 text-xs">Volumen</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones de uso (solo en primera card) */}
      {isActive && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 rounded-lg p-2">
          <p className="text-white text-xs text-center">
            ← No me interesa | ❤️ Me gusta → | ↑ Compartir
          </p>
        </div>
      )}
    </animated.div>
  );
};

export default NewsCard;