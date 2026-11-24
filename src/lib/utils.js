export const cn = (...c) => c.flat().filter(Boolean).join(' ');

export const formatMoney = (n, symbol = '$') => {
    const v = Number(n) || 0;
    return `${symbol}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
    d ? new Date(d).toLocaleDateString('en-US', opts) : '';

export const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

export const initials = (name = '') =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join('') || '?';

export const ORDER_STATUS = {
    awaiting_payment: { label: 'Awaiting payment', tone: 'warning' },
    pending: { label: 'Placed', tone: 'info' },
    processing: { label: 'Processing', tone: 'info' },
    shipped: { label: 'Shipped', tone: 'accent' },
    out_for_delivery: { label: 'Out for delivery', tone: 'accent' },
    delivered: { label: 'Delivered', tone: 'success' },
    cancelled: { label: 'Cancelled', tone: 'danger' },
    returned: { label: 'Returned', tone: 'neutral' },
};

export const PAYMENT_STATUS = {
    paid: { label: 'Paid', tone: 'success' },
    unpaid: { label: 'Unpaid (COD)', tone: 'warning' },
    pending: { label: 'Pending', tone: 'warning' },
    refunded: { label: 'Refunded', tone: 'neutral' },
    failed: { label: 'Failed', tone: 'danger' },
};

export const STATUS_STEPS = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

export const safeStorage = {
    get(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v == null ? fallback : JSON.parse(v);
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* storage unavailable */
        }
    },
};

export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
