import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

const { newsAPI } = apiService;

const useNews = (initialFilters = {}) => {
  // Estados principales
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [likedNews, setLikedNews] = useState([]);
  const [rejectedNews, setRejectedNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);

  // Referencias para evitar llamadas duplicadas
  const loadingRef = useRef(false);
  const lastLoadTime = useRef(0);

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mandc_saved_news') || '[]');
      const liked = JSON.parse(localStorage.getItem('mandc_liked_news') || '[]');
      const rejected = JSON.parse(localStorage.getItem('mandc_rejected_news') || '[]');
      
      setSavedNews(saved);
      setLikedNews(liked);
      setRejectedNews(rejected);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Función para guardar en localStorage
  const saveToStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, []);

  // Función para cargar noticias
  const loadNews = useCallback(async (reset = false, customFilters = {}) => {
    // Prevenir cargas duplicadas más estricto
    if (loadingRef.current) {
      console.log('🚫 Ya hay una carga en progreso');
      return;
    }
    
    // Throttle más agresivo
    const now = Date.now();
    if (now - lastLoadTime.current < 2000) {
      console.log('🚫 Throttle: esperando antes de siguiente carga');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      loadingRef.current = true;
      lastLoadTime.current = now;

      const pageToLoad = reset ? 1 : currentPage;
      const mergedFilters = { ...filters, ...customFilters };
      
      console.log(`🔄 Cargando noticias - Página: ${pageToLoad}`, mergedFilters);
      
      // Timeout más corto y mejor manejo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
      
      try {
        const response = await newsAPI.getNews({
          page: pageToLoad,
          limit: 10,
          ...mergedFilters,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.success && response.data) {
          const newNews = response.data.news || [];
          const pagination = response.data.pagination || {};
          
          // Filtrar noticias ya rechazadas
          const rejectedIds = new Set(rejectedNews.map(item => item.id));
          const filteredNews = newNews.filter(item => !rejectedIds.has(item.id));
          
          if (reset) {
            setNews(filteredNews);
            setCurrentPage(2);
          } else {
            setNews(prev => {
              // Evitar duplicados
              const existingIds = new Set(prev.map(item => item.id));
              const uniqueNews = filteredNews.filter(item => !existingIds.has(item.id));
              return [...prev, ...uniqueNews];
            });
            setCurrentPage(prev => prev + 1);
          }
          
          setHasMore(pagination.hasNextPage || newNews.length === 10);
          
          console.log(`✅ Cargadas ${filteredNews.length} noticias nuevas`);
        } else {
          throw new Error(response.message || 'Error al cargar noticias');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Conexión muy lenta - usando modo offline');
        }
        throw fetchError;
      }
      
    } catch (err) {
      console.error('❌ Error cargando noticias:', err);
      
      // Usar noticias mock inmediatamente si hay problemas de conexión
      if (news.length === 0) {
        console.log('📱 Usando noticias de demostración por problemas de conexión');
        setNews(getMockNews());
        setError('Modo offline - Usando noticias de demostración');
      } else {
        setError('Error de conexión - Verifica tu internet');
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [currentPage, filters, rejectedNews, news.length]);

  // Función para obtener noticias mock (fallback)
  const getMockNews = () => {
    return [
      {
        id: 'mock_1',
        title: 'Bitcoin alcanza nuevo máximo histórico superando los $100,000',
        description: 'La criptomoneda líder marca un hito importante en el mercado cripto tras superar la barrera psicológica de los seis dígitos.',
        source: 'MiedoandCodicia',
        source_logo: '/icons/favicon.ico',
        image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500',
        published_date: new Date().toISOString(),
        sentiment: 'bullish',
        categories: ['Bitcoin', 'Mercados', 'ATH'],
        price: '$102,450'
      },
      {
        id: 'mock_2',
        title: 'Ethereum se prepara para el próximo upgrade que reducirá las fees',
        description: 'La red Ethereum implementará mejoras significativas que prometen reducir costos de transacción y mejorar la escalabilidad.',
        source: 'CryptoNews',
        image_url: 'https://images.unsplash.com/photo-1622565396171-c4e06ba78fb3?w=500',
        published_date: new Date(Date.now() - 3600000).toISOString(),
        sentiment: 'positive',
        categories: ['Ethereum', 'Tecnología', 'DeFi']
      },
      {
        id: 'mock_3',
        title: 'Instituciones adoptan masivamente Bitcoin como reserva de valor',
        description: 'Grandes corporaciones continúan agregando Bitcoin a sus balances como cobertura contra la inflación.',
        source: 'Bitcoin Magazine',
        image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=500',
        published_date: new Date(Date.now() - 7200000).toISOString(),
        sentiment: 'bullish',
        categories: ['Bitcoin', 'Institucional', 'Adopción']
      }
    ];
  };

  // Función para manejar swipe right (me gusta)
  const handleSwipeRight = useCallback((newsItem) => {
    const updatedLiked = [...likedNews, newsItem];
    setLikedNews(updatedLiked);
    saveToStorage('mandc_liked_news', updatedLiked);
    
    // También guardar en noticias guardadas
    if (!savedNews.find(item => item.id === newsItem.id)) {
      const updatedSaved = [...savedNews, { ...newsItem, saved_at: new Date().toISOString() }];
      setSavedNews(updatedSaved);
      saveToStorage('mandc_saved_news', updatedSaved);
    }
    
    console.log('❤️ Noticia guardada como "me gusta":', newsItem.title);
  }, [likedNews, savedNews, saveToStorage]);

  // Función para manejar swipe left (no me interesa)
  const handleSwipeLeft = useCallback((newsItem) => {
    const updatedRejected = [...rejectedNews, newsItem];
    setRejectedNews(updatedRejected);
    saveToStorage('mandc_rejected_news', updatedRejected);
    
    console.log('👎 Noticia marcada como "no me interesa":', newsItem.title);
  }, [rejectedNews, saveToStorage]);

  // Función para manejar swipe up (compartir)
  const handleSwipeUp = useCallback(async (newsItem) => {
    try {
      if (navigator.share) {
        // API nativa de compartir (PWA)
        await navigator.share({
          title: newsItem.title,
          text: newsItem.description,
          url: newsItem.url || window.location.href
        });
      } else {
        // Fallback: copiar al clipboard
        const shareText = `${newsItem.title}\n\n${newsItem.description}\n\n#MiedoandCodicia #Crypto`;
        await navigator.clipboard.writeText(shareText);
        
        // Mostrar notificación (puedes implementar tu sistema de notificaciones)
        console.log('📋 Contenido copiado al portapapeles');
      }
      
      console.log('📤 Noticia compartida:', newsItem.title);
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  }, []);

  // Función para eliminar noticia guardada
  const removeSavedNews = useCallback((newsId) => {
    const updatedSaved = savedNews.filter(item => item.id !== newsId);
    setSavedNews(updatedSaved);
    saveToStorage('mandc_saved_news', updatedSaved);
  }, [savedNews, saveToStorage]);

  // Función para limpiar historial
  const clearHistory = useCallback((type = 'all') => {
    switch (type) {
      case 'rejected':
        setRejectedNews([]);
        saveToStorage('mandc_rejected_news', []);
        break;
      case 'liked':
        setLikedNews([]);
        saveToStorage('mandc_liked_news', []);
        break;
      case 'saved':
        setSavedNews([]);
        saveToStorage('mandc_saved_news', []);
        break;
      default:
        setRejectedNews([]);
        setLikedNews([]);
        setSavedNews([]);
        saveToStorage('mandc_rejected_news', []);
        saveToStorage('mandc_liked_news', []);
        saveToStorage('mandc_saved_news', []);
    }
  }, [saveToStorage]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    setHasMore(true);
    loadNews(true, newFilters);
  }, [loadNews]);

  // Función para refrescar noticias
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadNews(true);
  }, [loadNews]);

  // Cargar noticias iniciales - TEMPORALMENTE SOLO MOCK
  useEffect(() => {
    // TEMPORALMENTE: Solo usar datos mock para evitar timeouts
    console.log('📱 Cargando datos de demostración (modo desarrollo)');
    setNews(getMockNews());
    setError(null);
    setIsLoading(false);
    
    // TODO: Descomentar cuando la API esté funcionando
    // loadNews(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo una vez al montar - loadNews se recrea en cada render

  // Estadísticas
  const stats = {
    totalSeen: likedNews.length + rejectedNews.length,
    liked: likedNews.length,
    rejected: rejectedNews.length,
    saved: savedNews.length,
    likeRatio: likedNews.length / Math.max(1, likedNews.length + rejectedNews.length)
  };

  return {
    // Estados
    news,
    savedNews,
    likedNews,
    rejectedNews,
    isLoading,
    error,
    hasMore,
    filters,
    stats,
    
    // Acciones
    loadMore: () => loadNews(false),
    refresh,
    handleSwipeRight,
    handleSwipeLeft,
    handleSwipeUp,
    removeSavedNews,
    clearHistory,
    updateFilters
  };
};

export default useNews;