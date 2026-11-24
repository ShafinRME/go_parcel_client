import { useEffect, useState } from 'react';
import { safeStorage } from '../lib/utils';

export function useDebounce(value, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

const RV_KEY = 'recentlyViewed';
export const pushRecentlyViewed = (id) => {
    const list = safeStorage.get(RV_KEY, []).filter((x) => x !== id);
    safeStorage.set(RV_KEY, [id, ...list].slice(0, 12));
};
export const getRecentlyViewed = () => safeStorage.get(RV_KEY, []);

export function useTitle(title) {
    useEffect(() => {
        const prev = document.title;
        if (title) document.title = `${title} · Lumen & Co.`;
        return () => {
            document.title = prev;
        };
    }, [title]);
}

export function useLockBody(locked) {
    useEffect(() => {
        if (!locked) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [locked]);
}
