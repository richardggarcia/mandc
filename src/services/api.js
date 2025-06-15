import axios from 'axios';

// Configuración base de la API
const BASE_URL = 'https://mandc.bitsdeve.com/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data || error.message);
    
    // Manejo personalizado de errores
    if (error.response) {
      // Error del servidor
      const { status, data } = error.response;
      switch (status) {
        case 400:
          throw new Error(data?.message || 'Solicitud inválida');
        case 401:
          throw new Error('No autorizado');
        case 403:
          throw new Error('Acceso denegado');
        case 404:
          throw new Error('Recurso no encontrado');
        case 429:
          throw new Error('Demasiadas solicitudes. Intenta más tarde');
        case 500:
          throw new Error('Error interno del servidor');
        default:
          throw new Error(data?.message || `Error del servidor: ${status}`);
      }
    } else if (error.request) {
      // Error de red
      throw new Error('Error de conexión. Verifica tu internet');
    } else {
      // Error en la configuración
      throw new Error('Error en la solicitud');
    }
  }
);

// Servicio de noticias
export const newsAPI = {
  // Obtener noticias con filtros
  getNews: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        sentiment,
        source,
        search,
        sort = 'published_date',
        order = 'desc'
      } = params;

      const queryParams = {
        page,
        limit,
        sort,
        order
      };

      // Agregar filtros opcionales
      if (category) queryParams.category = category;
      if (sentiment) queryParams.sentiment = sentiment;
      if (source) queryParams.source = source;
      if (search) queryParams.q = search;

      const response = await apiClient.get('/news', { params: queryParams });
      
      return {
        success: true,
        data: response.data,
        message: 'Noticias cargadas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  },

  // Obtener una noticia específica
  getNewsById: async (id) => {
    try {
      const response = await apiClient.get(`/news/${id}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Noticia cargada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  },

  // Obtener categorías disponibles
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      
      return {
        success: true,
        data: response.data,
        message: 'Categorías cargadas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
        error: error
      };
    }
  },

  // Obtener fuentes disponibles
  getSources: async () => {
    try {
      const response = await apiClient.get('/sources');
      
      return {
        success: true,
        data: response.data,
        message: 'Fuentes cargadas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
        error: error
      };
    }
  },

  // Obtener tendencias
  getTrending: async (timeframe = '24h') => {
    try {
      const response = await apiClient.get('/trending', {
        params: { timeframe }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Tendencias cargadas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
        error: error
      };
    }
  },

  // Buscar noticias
  searchNews: async (query, filters = {}) => {
    try {
      const params = {
        q: query,
        page: 1,
        limit: 20,
        ...filters
      };

      const response = await apiClient.get('/search', { params });
      
      return {
        success: true,
        data: response.data,
        message: 'Búsqueda realizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: { news: [], pagination: {} },
        message: error.message,
        error: error
      };
    }
  }
};

// Servicio de análisis y métricas
export const analyticsAPI = {
  // Enviar evento de swipe
  trackSwipe: async (eventData) => {
    try {
      const response = await apiClient.post('/analytics/swipe', eventData);
      
      return {
        success: true,
        data: response.data,
        message: 'Evento registrado'
      };
    } catch (error) {
      // No es crítico si falla el tracking
      console.warn('Warning: Analytics tracking failed:', error.message);
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async (userId) => {
    try {
      const response = await apiClient.get(`/analytics/user/${userId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Estadísticas cargadas'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  }
};

// Servicio de utilidades
export const utilsAPI = {
  // Health check del API
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      
      return {
        success: true,
        data: response.data,
        message: 'API funcionando correctamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'API no disponible'
      };
    }
  },

  // Obtener configuración de la app
  getAppConfig: async () => {
    try {
      const response = await apiClient.get('/config');
      
      return {
        success: true,
        data: response.data,
        message: 'Configuración cargada'
      };
    } catch (error) {
      return {
        success: false,
        data: {
          app_name: 'MiedoandCodicia',
          version: '1.0.0',
          features: {
            swipe: true,
            share: true,
            pwa: true
          }
        },
        message: 'Usando configuración por defecto'
      };
    }
  }
};

// Función helper para manejo de errores de red
export const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return 'Sin conexión a internet. Verifica tu conexión.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Error de red. Intenta de nuevo.';
  }
  
  if (error.code === 'TIMEOUT') {
    return 'La solicitud tomó demasiado tiempo. Intenta de nuevo.';
  }
  
  return error.message || 'Error desconocido';
};

// Función helper para retry de requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Export por defecto con todas las APIs
export default {
  news: newsAPI,
  analytics: analyticsAPI,
  utils: utilsAPI,
  client: apiClient,
  helpers: {
    handleNetworkError,
    retryRequest
  }
};