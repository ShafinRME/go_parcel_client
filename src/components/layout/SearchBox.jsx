import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LuArrowUpRight, LuSearch, LuX } from 'react-icons/lu';
import { get } from '../../lib/api';
import { useDebounce } from '../../hooks/useCommon';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export default function SearchBox({ autoFocus, onDone, className }) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const term = useDebounce(q.trim(), 220);
    const navigate = useNavigate();
    const { money } = useStore();
    const box = useRef(null);

    const { data, isFetching } = useQuery({
        queryKey: ['suggest', term],
        queryFn: () => get('/products/suggest', { q: term }),
        enabled: term.length >= 2,
        staleTime: 60 * 1000,
    });

    useEffect(() => {
        const onClick = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const products = data?.products || [];
    const go = (path) => {
        setOpen(false);
        setQ('');
        onDone?.();
        navigate(path);
    };
    const submit = (e) => {
        e.preventDefault();
        if (active >= 0 && products[active]) return go(`/product/${products[active].slug}`);
        if (q.trim()) go(`/shop?search=${encodeURIComponent(q.trim())}`);
    };

    return (
        <div ref={box} className={cn('relative', className)}>
            <form onSubmit={submit} role="search">
                <LuSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                    autoFocus={autoFocus}
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setOpen(true);
                        setActive(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, products.length - 1));
                        if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, -1));
                        if (e.key === 'Escape') setOpen(false);
                    }}
                    placeholder="Search products, brands and more"
                    aria-label="Search products"
                    className="h-11 w-full rounded-full border border-line bg-soft/60 pl-11 pr-10 text-sm outline-none transition placeholder:text-muted focus:border-ink/30 focus:bg-surface"
                />
                {q && (
                    <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-line" aria-label="Clear search">
                        <LuX className="h-3.5 w-3.5" />
                    </button>
                )}
            </form>

            {open && term.length >= 2 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-fade-up">
                    {data?.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-b border-line p-3">
                            {data.categories.map((c) => (
                                <button key={c._id} onClick={() => go(`/shop?category=${c.slug}`)} className="rounded-full bg-soft px-3 py-1 text-xs font-semibold hover:bg-line">
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    )}
                    {products.length === 0 ? (
                        <p className="p-5 text-sm text-muted">{isFetching ? 'Searching…' : `No results for “${term}”`}</p>
                    ) : (
                        <ul>
                            {products.map((p, i) => (
                                <li key={p._id}>
                                    <button
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => go(`/product/${p.slug}`)}
                                        className={cn('flex w-full items-center gap-3 px-3 py-2.5 text-left transition', active === i ? 'bg-soft' : '')}
                                    >
                                        <img src={p.images?.[0]} alt="" className="h-11 w-11 rounded-lg bg-soft object-contain" loading="lazy" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">{p.title}</span>
                                            <span className="block text-xs text-muted">{p.brand}</span>
                                        </span>
                                        <span className="text-sm font-semibold">{money(p.price)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={submit} className="flex w-full items-center justify-between border-t border-line px-4 py-3 text-sm font-semibold hover:bg-soft">
                        See all results for “{term}” <LuArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
