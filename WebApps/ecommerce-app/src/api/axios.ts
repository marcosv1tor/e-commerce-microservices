import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // apontando para o gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de cada requisição, caso exista um token salvo, anexam ele! 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});