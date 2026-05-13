import axios from 'axios';

const api = axios.create({
    baseURL: '/api/',
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => {
        const method = response.config?.method?.toLowerCase();
        if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
            try {
                const bc = new BroadcastChannel('app_updates');
                bc.postMessage({ type: 'DATA_MUTATION' });
                bc.close();
            } catch (e) {
                console.error('BroadcastChannel failed', e);
            }
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.clear();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
