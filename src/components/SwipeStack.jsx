import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import NewsCard from './NewsCard';

const SwipeStack = ({ 
  newsList = [], 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp,
  onLoadMore,
  isLoading = false,
  hasMore = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stackSize] = useState(3); // Número de cards visibles en el stack
  const swipeCountRef = useRef(0);

  // Configuración de la animación del stack
  const stackSpring = useSpring({
    opacity: newsList.length > 0 ? 1 : 0,
    transform: newsList.length > 0 ? 'scale(1)' : 'scale(0.9)',
    config: { mass: 1, tension: 120, friction: 14 }
  });

  // Handler para swipe left
  const handleSwipeLeft = (news) => {
    console.log('👎 Swiped LEFT:', news.title);
    onSwipeLeft && onSwipeLeft(news);
    nextCard();
  };

  // Handler para swipe right
  const handleSwipeRight = (news) => {
    console.log('❤️ Swiped RIGHT:', news.title);
    onSwipeRight && onSwipeRight(news);
    nextCard();
  };

  // Handler para swipe up
  const handleSwipeUp = (news) => {
    console.log('📤 Swiped UP:', news.title);
    onSwipeUp && onSwipeUp(news);
    nextCard();
  };

  // Avanzar a la siguiente card
  const nextCard = () => {
    setCurrentIndex(prev => prev + 1);
    swipeCountRef.current += 1;
    
    // Cargar más noticias cuando quedan pocas
    const remainingCards = newsList.length - currentIndex - 1;
    if (remainingCards <= 2 && hasMore && !isLoading) {
      onLoadMore && onLoadMore();
    }
  };

  // Reset cuando llegan nuevas noticias
  useEffect(() => {
    if (newsList.length > 0 && currentIndex >= newsList.length) {
      setCurrentIndex(Math.max(0, newsList.length - stackSize));
    }
  }, [newsList.length, currentIndex, stackSize]);

  // Calcular las cards visibles en el stack
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < stackSize; i++) {
      const cardIndex = currentIndex + i;
      if (cardIndex < newsList.length) {
        cards.push({
          news: newsList[cardIndex],
          index: cardIndex,
          stackPosition: i
        });
      }
    }
    return cards;
  };

  // Configuración de posición para cada card en el stack
  const getCardStyle = (stackPosition) => {
    const baseScale = 1 - (stackPosition * 0.05);
    const baseY = stackPosition * 10;
    const baseOpacity = 1 - (stackPosition * 0.1);
    
    return {
      transform: `translateY(${baseY}px) scale(${baseScale})`,
      opacity: baseOpacity,
      zIndex: stackSize - stackPosition
    };
  };

  // Si no hay noticias
  if (newsList.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-400">Cargando noticias cripto...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📰</div>
              <p className="text-gray-400">No hay noticias disponibles</p>
              <button 
                onClick={() => onLoadMore && onLoadMore()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cargar noticias
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Si ya no hay más cards
  if (currentIndex >= newsList.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-white text-xl font-bold">¡Has visto todas las noticias!</h3>
          <p className="text-gray-400">Swipeaste {swipeCountRef.current} noticias</p>
          {hasMore && (
            <button 
              onClick={() => onLoadMore && onLoadMore()}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Cargando...' : 'Cargar más noticias'}
            </button>
          )}
          <button 
            onClick={() => {
              setCurrentIndex(0);
              swipeCountRef.current = 0;
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors ml-2"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const visibleCards = getVisibleCards();

  return (
    <animated.div 
      style={stackSpring}
      className="relative w-full h-full max-w-sm mx-auto"
    >
      {/* Stack de cards */}
      <div className="relative w-full h-full">
        {visibleCards.map(({ news, index, stackPosition }) => (
          <div
            key={`${news.id || index}-${index}`}
            className="absolute inset-0"
            style={getCardStyle(stackPosition)}
          >
            <NewsCard
              news={news}
              onSwipeLeft={stackPosition === 0 ? handleSwipeLeft : undefined}
              onSwipeRight={stackPosition === 0 ? handleSwipeRight : undefined}
              onSwipeUp={stackPosition === 0 ? handleSwipeUp : undefined}
              isActive={stackPosition === 0}
            />
          </div>
        ))}
      </div>

      {/* Contador de progreso */}
      <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
        <div className="bg-black bg-opacity-50 rounded-full px-4 py-2">
          <span className="text-white text-sm">
            {currentIndex + 1} / {newsList.length}
          </span>
          {hasMore && (
            <span className="text-orange-400 text-sm ml-2">
              + más noticias
            </span>
          )}
        </div>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
          <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-white text-sm">Cargando...</span>
          </div>
        </div>
      )}

      {/* Botones de acción manual (opcional) */}
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center space-x-4">
        <button
          onClick={() => handleSwipeLeft(visibleCards[0]?.news)}
          className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xl transition-colors shadow-lg"
          disabled={visibleCards.length === 0}
        >
          👎
        </button>
        <button
          onClick={() => handleSwipeUp(visibleCards[0]?.news)}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xl transition-colors shadow-lg"
          disabled={visibleCards.length === 0}
        >
          📤
        </button>
        <button
          onClick={() => handleSwipeRight(visibleCards[0]?.news)}
          className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-xl transition-colors shadow-lg"
          disabled={visibleCards.length === 0}
        >
          ❤️
        </button>
      </div>
    </animated.div>
  );
};

export default SwipeStack;