import axios from 'axios';

// DEBUG: Log do protocolo que o navegador está usando
console.log('🔐 Protocolo do navegador:', window.location.protocol);
console.log('🌐 Host do navegador:', window.location.host);

// Se o navegador está em HTTPS e o backend está em HTTP, 
// tente usar HTTPS também (comum em produção)
// IMPORTANTE: Certifique-se que seu backend suporta ambos HTTP e HTTPS
const getBaseURL = () => {
  const isHTTPS = window.location.protocol === 'https:';
  const protocol = isHTTPS ? 'https' : 'http';
  return `${protocol}://localhost:5237/api/v1`;
};

console.log('🌍 Base URL será:', getBaseURL());

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de cada requisição, caso exista um token salvo, anexam ele! 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    console.log('📤 Requisição para:', config.url);
    console.log('🔑 Token encontrado:', !!token);
    console.log('🔑 Token primeiros caracteres:', token ? token.substring(0, 20) + '...' : 'NENHUM');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Header Authorization adicionado');
    } else {
        console.warn('⚠️ AVISO: Token não encontrado em localStorage!');
    }
    return config;
});

// Interceptor de resposta para capturar erros 401
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.error('❌ ERRO 401 - Não Autorizado');
            console.error('📍 URL da requisição:', error.config?.url);
            console.error('📋 Headers enviados:', error.config?.headers);
            console.error('💾 Token em localStorage:', localStorage.getItem('auth_token'));
            console.error('📩 Resposta do servidor:', error.response?.data);
        }
        return Promise.reject(error);
    }
);