import { forwardRef, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router';
import { LuChevronLeft, LuChevronRight, LuLoaderCircle, LuStar, LuX } from 'react-icons/lu';
import { cn } from '../../lib/utils';
import { useLockBody } from '../../hooks/useCommon';

const BTN = {
    primary: 'bg-ink text-bg hover:opacity-90',
    accent: 'bg-accent text-accent-ink hover:brightness-110',
    outline: 'border border-line bg-surface text-ink hover:border-ink/40',
    ghost: 'text-ink hover:bg-soft',
    soft: 'bg-soft text-ink hover:bg-line',
    danger: 'bg-danger text-white hover:brightness-110',
    link: 'text-ink underline underline-offset-4 hover:text-accent px-0 h-auto',
};
const SIZE = { sm: 'h-9 px-3.5 text-sm rounded-lg', md: 'h-11 px-5 text-sm rounded-xl', lg: 'h-13 px-7 text-base rounded-xl', icon: 'h-10 w-10 rounded-full', iconSm: 'h-8 w-8 rounded-full' };

export const Button = forwardRef(function Button({ as, to, variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }, ref) {
    const cls = cn(
        'inline-flex select-none items-center justify-center gap-2 font-semibold whitespace-nowrap transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        BTN[variant],
        SIZE[size],
        className
    );
    const content = (
        <>
            {loading && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
            {children}
        </>
    );
    if (to) return <Link ref={ref} to={to} className={cls} {...rest}>{content}</Link>;
    const Comp = as || 'button';
    return (
        <Comp ref={ref} className={cls} disabled={disabled || loading} {...(Comp === 'button' ? { type: rest.type || 'button' } : {})} {...rest}>
            {content}
        </Comp>
    );
});

const TONES = {
    neutral: 'bg-soft text-muted',
    info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    dark: 'bg-ink text-bg',
};
export const Badge = ({ tone = 'neutral', className, children }) => (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone], className)}>{children}</span>
);

export const Spinner = ({ className }) => <LuLoaderCircle className={cn('h-6 w-6 animate-spin text-muted', className)} />;

export const PageLoader = () => (
    <div className="grid min-h-[50vh] place-items-center">
        <Spinner className="h-8 w-8" />
    </div>
);

export const Skeleton = ({ className }) => <div className={cn('skeleton', className)} />;

export function Stars({ value = 0, size = 'h-4 w-4', className, onChange }) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;
    return (
        <div className={cn('flex items-center gap-0.5', className)} onMouseLeave={() => setHover(0)} aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => {
                const fill = Math.max(0, Math.min(1, shown - (i - 1)));
                const star = (
                    <span className="relative inline-block">
                        <LuStar className={cn(size, 'text-line')} fill="currentColor" strokeWidth={0} />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <LuStar className={cn(size, 'text-amber-400')} fill="currentColor" strokeWidth={0} />
                        </span>
                    </span>
                );
                return onChange ? (
                    <button key={i} type="button" onMouseEnter={() => setHover(i)} onClick={() => onChange(i)} aria-label={`${i} stars`} className="p-0.5">
                        {star}
                    </button>
                ) : (
                    <span key={i}>{star}</span>
                );
            })}
        </div>
    );
}

export function Modal({ open, onClose, title, children, className, size = 'max-w-lg' }) {
    useLockBody(open);
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        initial={{ y: 30, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 30, opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className={cn('relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl', size, className)}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            {title ? <h3 className="text-xl font-bold">{title}</h3> : <span />}
                            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-soft" aria-label="Close">
                                <LuX className="h-5 w-5" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 'max-w-md' }) {
    useLockBody(open);
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    const from = side === 'right' ? '100%' : '-100%';
    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
                    <motion.aside
                        initial={{ x: from }}
                        animate={{ x: 0 }}
                        exit={{ x: from }}
                        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                        className={cn('absolute top-0 flex h-full w-full flex-col bg-surface shadow-2xl', width, side === 'right' ? 'right-0' : 'left-0')}
                    >
                        <div className="flex items-center justify-between border-b border-line px-5 py-4">
                            <h3 className="text-lg font-bold">{title}</h3>
                            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft" aria-label="Close">
                                <LuX className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">{children}</div>
                        {footer && <div className="border-t border-line p-5">{footer}</div>}
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export function Confirm({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmText = 'Confirm', tone = 'danger', loading }) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="max-w-md">
            {message && <p className="text-sm text-muted">{message}</p>}
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmText}</Button>
            </div>
        </Modal>
    );
}

export function Empty({ icon: Icon, title, text, action }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {Icon && (
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-soft">
                    <Icon className="h-7 w-7 text-muted" />
                </div>
            )}
            <h3 className="text-lg font-bold">{title}</h3>
            {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function Pagination({ page, pages, onChange }) {
    if (!pages || pages <= 1) return null;
    const nums = [];
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
        else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    return (
        <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
            <Button variant="outline" size="iconSm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
                <LuChevronLeft className="h-4 w-4" />
            </Button>
            {nums.map((n, i) =>
                n === '…' ? (
                    <span key={`e${i}`} className="px-1 text-muted">…</span>
                ) : (
                    <button key={n} onClick={() => onChange(n)} className={cn('h-8 min-w-8 rounded-full px-2 text-sm font-semibold transition', n === page ? 'bg-ink text-bg' : 'hover:bg-soft')}>
                        {n}
                    </button>
                )
            )}
            <Button variant="outline" size="iconSm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
                <LuChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}

export function Field({ label, error, hint, className, children, ...props }) {
    const id = useId();
    return (
        <div className={className}>
            {label && <label htmlFor={props.id || id} className="label">{label}</label>}
            {children || <input id={props.id || id} className={cn('input', error && 'border-danger')} {...props} />}
            {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
    );
}

export function Toggle({ checked, onChange, label, description }) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4">
            <span>
                {label && <span className="block text-sm font-semibold">{label}</span>}
                {description && <span className="block text-xs text-muted">{description}</span>}
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-ink' : 'bg-line')}
            >
                <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-bg shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
            </button>
        </label>
    );
}

export function QtyInput({ value, onChange, max = 99, size = 'md' }) {
    const h = size === 'sm' ? 'h-9' : 'h-11';
    return (
        <div className={cn('inline-flex items-center rounded-xl border border-line bg-surface', h)}>
            <button type="button" className="h-full w-9 text-lg text-muted hover:text-ink disabled:opacity-30" disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">−</button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
            <button type="button" className="h-full w-9 text-lg text-muted hover:text-ink disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">+</button>
        </div>
    );
}

export function SectionHeading({ eyebrow, title, action, className }) {
    return (
        <div className={cn('mb-8 flex items-end justify-between gap-4', className)}>
            <div>
                {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>}
                <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
            </div>
            {action}
        </div>
    );
}
