import axios from 'axios';
import { auth } from './firebase';

export const API_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

// One axios instance for the whole app. The Firebase ID token is attached automatically
// (and refreshed by Firebase when it expires) — no per-component interceptors.
export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const errorMessage = (err, fallback = 'Something went wrong') =>
    err?.response?.data?.message || (err?.code === 'ECONNABORTED' ? 'The server took too long to respond' : err?.message) || fallback;

export const get = (url, params) => api.get(url, { params }).then((r) => r.data);
