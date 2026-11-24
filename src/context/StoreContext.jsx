/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, get, errorMessage } from '../lib/api';
import { formatMoney, safeStorage } from '../lib/utils';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);
const CART_KEY = 'cart.v2';
const WISH_KEY = 'wishlist.v2';

const snapshot = (p) => ({
    _id: p._id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images?.slice(0, 1) || [],
    stock: p.stock,
    brand: p.brand,
});
const sameLine = (a, b) => a.productId === b.productId && (a.color || null) === (b.color || null) && (a.size || null) === (b.size || null);
const toServer = (items) => items.map(({ productId, qty, color, size }) => ({ productId, qty, color: color || null, size: size || null }));

export function StoreProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => get('/settings'), staleTime: 5 * 60 * 1000 });

    const [cart, setCart] = useState(() => safeStorage.get(CART_KEY, []));
    const [wishlist, setWishlist] = useState(() => safeStorage.get(WISH_KEY, []));
    const [cartOpen, setCartOpen] = useState(false);
    const [quickView, setQuickView] = useState(null); // product slug
    const syncedFor = useRef(null);
    const saveTimer = useRef(null);

    // Merge guest cart/wishlist into the account when someone signs in.
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            if (syncedFor.current) {
                // signed out: start fresh locally
                // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local state when auth changes
                setCart([]);
                setWishlist([]);
            }
            syncedFor.current = null;
            return;
        }
        if (syncedFor.current === user.uid) return;
        syncedFor.current = user.uid;
        (async () => {
            try {
                const local = safeStorage.get(CART_KEY, []);
                const server = await get('/cart');
                const merged = server.map((s) => ({ productId: s.productId, qty: s.qty, color: s.color, size: s.size, product: s.product }));
                for (const l of local) {
                    const hit = merged.find((m) => sameLine(m, l));
                    if (hit) hit.qty = Math.min(99, Math.max(hit.qty, l.qty));
                    else merged.push(l);
                }
                if (local.length) {
                    const { data } = await api.put('/cart', { items: toServer(merged) });
                    setCart(data.map((d) => ({ ...d, product: snapshot(d.product) })));
                } else setCart(merged.map((m) => ({ ...m, product: snapshot(m.product) })));
                safeStorage.set(CART_KEY, []);

                const localWish = safeStorage.get(WISH_KEY, []);
                const w = localWish.length ? (await api.post('/wishlist/merge', { productIds: localWish })).data : await get('/wishlist');
                setWishlist(w.ids || []);
                safeStorage.set(WISH_KEY, []);
            } catch {
                /* keep local state if the API is unreachable */
            }
        })();
    }, [user, authLoading]);

    // Persist cart: localStorage for guests, debounced API save for members.
    const persist = useCallback(
        (items) => {
            if (!user) return safeStorage.set(CART_KEY, items);
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                api.put('/cart', { items: toServer(items) }).catch(() => {});
            }, 400);
        },
        [user]
    );

    const updateCart = useCallback(
        (fn) =>
            setCart((prev) => {
                const next = fn(prev);
                persist(next);
                return next;
            }),
        [persist]
    );

    const addToCart = useCallback(
        (product, { qty = 1, color = null, size = null, open = true } = {}) => {
            if (!product || product.stock <= 0) return toast.error('This item is out of stock');
            const line = { productId: product._id, qty, color, size, product: snapshot(product) };
            let capped = false;
            updateCart((prev) => {
                const hit = prev.find((l) => sameLine(l, line));
                if (hit) {
                    const q = Math.min(product.stock, hit.qty + qty, 99);
                    capped = q < hit.qty + qty;
                    return prev.map((l) => (sameLine(l, line) ? { ...l, qty: q } : l));
                }
                return [...prev, { ...line, qty: Math.min(qty, product.stock) }];
            });
            if (capped) toast(`Only ${product.stock} available`, { icon: 'ℹ️' });
            else toast.success('Added to bag');
            if (open) setCartOpen(true);
        },
        [updateCart]
    );

    const setQty = useCallback(
        (line, qty) => updateCart((prev) => prev.map((l) => (sameLine(l, line) ? { ...l, qty: Math.max(1, Math.min(qty, l.product?.stock || 99, 99)) } : l))),
        [updateCart]
    );
    const removeFromCart = useCallback((line) => updateCart((prev) => prev.filter((l) => !sameLine(l, line))), [updateCart]);
    const clearCart = useCallback(() => {
        setCart([]);
        safeStorage.set(CART_KEY, []);
    }, []);

    const toggleWishlist = useCallback(
        async (productId) => {
            const has = wishlist.includes(productId);
            const next = has ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
            setWishlist(next);
            toast.success(has ? 'Removed from wishlist' : 'Saved to wishlist');
            if (!user) return safeStorage.set(WISH_KEY, next);
            try {
                const { data } = await api.post('/wishlist/toggle', { productId });
                setWishlist(data.ids);
            } catch (e) {
                setWishlist(wishlist);
                toast.error(errorMessage(e));
            }
        },
        [wishlist, user]
    );

    const count = cart.reduce((s, l) => s + l.qty, 0);
    const subtotal = cart.reduce((s, l) => s + l.qty * (l.product?.price || 0), 0);
    const symbol = settings?.currencySymbol || '$';

    const value = useMemo(
        () => ({
            settings: settings || {},
            money: (n) => formatMoney(n, symbol),
            cart,
            count,
            subtotal,
            addToCart,
            setQty,
            removeFromCart,
            clearCart,
            cartOpen,
            setCartOpen,
            wishlist,
            toggleWishlist,
            inWishlist: (id) => wishlist.includes(id),
            quickView,
            setQuickView,
        }),
        [settings, symbol, cart, count, subtotal, addToCart, setQty, removeFromCart, clearCart, cartOpen, wishlist, toggleWishlist, quickView]
    );

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
