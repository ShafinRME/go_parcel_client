/* eslint-disable react-refresh/only-export-components */
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LuArrowDownRight, LuArrowUpRight, LuImagePlus, LuLink, LuLoaderCircle, LuX } from 'react-icons/lu';
import { Badge, Button } from '../../components/ui';
import { api, errorMessage } from '../../lib/api';
import { cn, ORDER_STATUS, PAYMENT_STATUS, readFileAsDataURL } from '../../lib/utils';

export function PageHeader({ title, description, actions, back }) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {back}
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export const OrderStatusBadge = ({ status }) => {
    const s = ORDER_STATUS[status] || { label: status, tone: 'neutral' };
    return <Badge tone={s.tone}>{s.label}</Badge>;
};

export const PaymentBadge = ({ status }) => {
    const s = PAYMENT_STATUS[status] || { label: status, tone: 'neutral' };
    return <Badge tone={s.tone}>{s.label}</Badge>;
};

export function Change({ value }) {
    if (value == null) return null;
    const up = value >= 0;
    const Icon = up ? LuArrowUpRight : LuArrowDownRight;
    return (
        <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold', up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
            <Icon className="h-3.5 w-3.5" />
            {Math.abs(value).toFixed(1)}%
        </span>
    );
}

export function StatCard({ label, value, change, icon: Icon, hint }) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted">{label}</p>
                {Icon && (
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft">
                        <Icon className="h-4.5 w-4.5 text-ink" />
                    </span>
                )}
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums">{value}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <Change value={change} />
                {hint && <span>{hint}</span>}
            </div>
        </div>
    );
}

// Table primitives
export const Table = ({ children, className }) => (
    <div className="overflow-x-auto">
        <table className={cn('w-full min-w-[640px] text-left text-sm', className)}>{children}</table>
    </div>
);
export const Th = ({ children, className }) => (
    <th className={cn('whitespace-nowrap border-b border-line bg-soft/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted', className)}>{children}</th>
);
export const Td = ({ children, className, ...rest }) => (
    <td className={cn('border-b border-line px-4 py-3 align-middle', className)} {...rest}>
        {children}
    </td>
);

export const SkeletonRows = ({ rows = 6, cols = 5 }) => (
    <tbody>
        {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
                {Array.from({ length: cols }).map((__, c) => (
                    <td key={c} className="border-b border-line px-4 py-3.5">
                        <div className="skeleton h-4 w-full max-w-[160px]" />
                    </td>
                ))}
            </tr>
        ))}
    </tbody>
);

export function Select({ value, onChange, options, className, ...rest }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cn('input h-10 w-auto pr-8', className)} {...rest}>
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

export function ChipsInput({ value = [], onChange, placeholder = 'Type and press Enter', max = 20 }) {
    const [text, setText] = useState('');
    const add = () => {
        const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
        if (!parts.length) return;
        const next = [...value];
        parts.forEach((p) => !next.includes(p) && next.length < max && next.push(p));
        onChange(next);
        setText('');
    };
    return (
        <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface px-2 py-1.5 focus-within:border-ink/40">
            {value.map((v) => (
                <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-soft px-2 py-1 text-xs font-medium">
                    {v}
                    <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="text-muted hover:text-ink">
                        <LuX className="h-3 w-3" />
                    </button>
                </span>
            ))}
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        add();
                    } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
                }}
                onBlur={add}
                placeholder={value.length ? '' : placeholder}
                className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted/70"
            />
        </div>
    );
}

export async function uploadImage(file) {
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5 MB');
    const dataUrl = await readFileAsDataURL(file);
    const { data } = await api.post('/admin/upload', { image: dataUrl });
    return data.url;
}

/** Single image field: upload or paste a URL. */
export function SingleImageInput({ value, onChange, aspect = 'aspect-video' }) {
    const ref = useRef(null);
    const [busy, setBusy] = useState(false);
    const [url, setUrl] = useState('');
    const pick = async (file) => {
        if (!file) return;
        setBusy(true);
        try {
            onChange(await uploadImage(file));
            toast.success('Image uploaded');
        } catch (e) {
            toast.error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() => ref.current?.click()}
                className={cn('relative grid w-full place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-soft/50 transition hover:border-ink/40', aspect)}
            >
                {value ? (
                    <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <span className="flex flex-col items-center gap-1 text-sm text-muted">
                        <LuImagePlus className="h-6 w-6" /> Click to upload
                    </span>
                )}
                {busy && (
                    <span className="absolute inset-0 grid place-items-center bg-black/40">
                        <LuLoaderCircle className="h-6 w-6 animate-spin text-white" />
                    </span>
                )}
            </button>
            <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => {
                    pick(e.target.files?.[0]);
                    e.target.value = '';
                }} />
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <LuLink className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste image URL" className="input h-9 pl-9" />
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        if (/^https?:\/\//.test(url)) {
                            onChange(url.trim());
                            setUrl('');
                        } else toast.error('Enter a valid http(s) URL');
                    }}
                >
                    Use
                </Button>
                {value && (
                    <Button size="sm" variant="ghost" onClick={() => onChange('')}>
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}

export const fieldErrors = (err) => {
    const out = {};
    (err?.response?.data?.details || []).forEach((d) => {
        if (d.path && !out[d.path]) out[d.path] = d.message;
    });
    return out;
};
