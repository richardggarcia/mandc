import React, { useState, useEffect } from 'react';
import { useSpring, animated, useTransition } from 'react-spring';
import useNews from '../hooks/useNews';

const Saved = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('saved_at'); // saved_at, title, published_date
  const [filterBy, setFilterBy] = useState('all'); // all, liked, shared
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [selectedNews, setSelectedNews] = useState(null);

  // Hook de noticias
  const { savedNews, likedNews, removeSavedNews, handleSwipeUp } = useNews();

  // Animación de entrada
  const pageSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { mass: 1, tension: 120, friction: 14 }
  });

  // Filtrar y ordenar noticias
  const getFilteredNews = () => {
    let filtered = [...savedNews];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(news => 
        news.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.source?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterBy === 'liked') {
      const likedIds = new Set(likedNews.map(news => news.id));
      filtered = filtered.filter(news => likedIds.has(news.id));
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title?.localeCompare(b.title) || 0;
        case 'published_date':
          return new Date(b.published_date) - new Date(a.published_date);
        case 'saved_at':
        default:
          return new Date(b.saved_at || b.published_date) - new Date(a.saved_at || a.published_date);
      }
    });

    return filtered;
  };

  const filteredNews = getFilteredNews();

  // Transiciones para las cards
  const transitions = useTransition(filteredNews, {
    from: { opacity: 0, transform: 'scale(0.9) translateY(20px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
    trail: 100,
    config: { mass: 1, tension: 200, friction: 20 }
  });

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    } else if (diffInMinutes < 10080) {
      return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
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

  // Función para compartir noticia
  const handleShare = async (news) => {
    await handleSwipeUp(news);
  };

  // Función para abrir modal de noticia
  const openNewsModal = (news) => {
    setSelectedNews(news);
  };

  // Función para cerrar modal
  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  // Componente de card de noticia
  const NewsCard = ({ news, index }) => {
    const isLiked = likedNews.some(liked => liked.id === news.id);

    return (
      <div className={`
        ${viewMode === 'grid' 
          ? 'bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl' 
          : 'bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg flex'
        } 
        transition-all duration-300 cursor-pointer group
      `}>
        {/* Imagen */}
        {news.image_url && (
          <div className={`
            ${viewMode === 'grid' ? 'h-40 w-full' : 'w-24 h-24 flex-shrink-0'}
            relative overflow-hidden
          `}>
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            
            {/* Indicadores en la imagen */}
            <div className="absolute top-2 left-2 flex space-x-1">
              {isLiked && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ❤️
                </span>
              )}
              <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                {getSentimentEmoji(news.sentiment)}
              </span>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {news.source_logo && (
                <img 
                  src={news.source_logo} 
                  alt={news.source} 
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="text-gray-400 text-xs font-medium">{news.source}</span>
            </div>
            <span className="text-gray-500 text-xs">{formatDate(news.saved_at || news.published_date)}</span>
          </div>

          <h3 
            onClick={() => openNewsModal(news)}
            className={`
              text-white font-bold leading-tight mb-2 hover:text-mc-orange-400 transition-colors
              ${viewMode === 'grid' ? 'text-lg line-clamp-2' : 'text-sm line-clamp-2'}
            `}
          >
            {news.title}
          </h3>

          {viewMode === 'grid' && news.description && (
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
              {news.description}
            </p>
          )}

          {/* Categorías */}
          {news.categories && news.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {news.categories.slice(0, viewMode === 'grid' ? 3 : 2).map((category, i) => (
                <span
                  key={i}
                  className="bg-mc-orange-500 bg-opacity-20 text-mc-orange-300 px-2 py-1 rounded-full text-xs font-medium border border-mc-orange-500 border-opacity-30"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => handleShare(news)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors text-sm"
                title="Compartir"
              >
                📤
              </button>
              <button
                onClick={() => removeSavedNews(news.id)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors text-sm"
                title="Eliminar de guardados"
              >
                🗑️
              </button>
            </div>
            
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors text-sm"
                title="Leer noticia completa"
              >
                🔗
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <animated.div style={pageSpring} className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black bg-opacity-95 backdrop-blur-sm border-b border-gray-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white font-bold text-xl">💾 Noticias Guardadas</h1>
              <p className="text-gray-400 text-sm">{filteredNews.length} noticias</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'grilla'}`}
              >
                {viewMode === 'grid' ? '📋' : '⊞'}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar noticias guardadas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-mc-orange-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros y ordenación */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-mc-orange-500"
            >
              <option value="saved_at">Más recientes</option>
              <option value="published_date">Por fecha de publicación</option>
              <option value="title">Por título</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-mc-orange-500"
            >
              <option value="all">Todas</option>
              <option value="liked">Solo las que me gustan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            {savedNews.length === 0 ? (
              <div className="space-y-4">
                <div className="text-6xl">💾</div>
                <h3 className="text-white text-xl font-bold">No tienes noticias guardadas</h3>
                <p className="text-gray-400">
                  Desliza hacia la derecha en las noticias que te gusten para guardarlas aquí
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-white text-xl font-bold">No se encontraron resultados</h3>
                <p className="text-gray-400">
                  Intenta con otros términos de búsqueda o cambia los filtros
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBy('all');
                  }}
                  className="bg-mc-orange-500 hover:bg-mc-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
            }
          `}>
            {transitions((style, news) => (
              <animated.div key={news.id} style={style}>
                <NewsCard news={news} />
              </animated.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de noticia */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-white font-bold text-lg leading-tight flex-1 pr-4">
                  {selectedNews.title}
                </h2>
                <button
                  onClick={closeNewsModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {selectedNews.image_url && (
                <img
                  src={selectedNews.image_url}
                  alt={selectedNews.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{selectedNews.source}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{formatDate(selectedNews.published_date)}</span>
                  </div>
                  <span className="text-mc-orange-400">
                    {getSentimentEmoji(selectedNews.sentiment)}
                  </span>
                </div>

                {selectedNews.description && (
                  <p className="text-gray-300 leading-relaxed">
                    {selectedNews.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedNews.categories?.map((category, i) => (
                    <span
                      key={i}
                      className="bg-mc-orange-500 bg-opacity-20 text-mc-orange-300 px-3 py-1 rounded-full text-xs border border-mc-orange-500 border-opacity-30"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => handleShare(selectedNews)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    📤 Compartir
                  </button>
                  {selectedNews.url && (
                    <a
                      href={selectedNews.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-mc-orange-500 hover:bg-mc-orange-600 text-white py-2 px-4 rounded-lg transition-colors text-center"
                    >
                      🔗 Leer completa
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </animated.div>
  );
};

export default Saved;