import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuCircleCheck, LuRotateCcw, LuShare2, LuShieldCheck, LuStar, LuTruck } from 'react-icons/lu';
import { api, errorMessage, get } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Empty, Field, Pagination, QtyInput, Skeleton, Stars } from '../components/ui';
import ProductCard, { PriceTag, WishlistButton } from '../components/product/ProductCard';
import ProductOptions from '../components/product/ProductOptions';
import { pushRecentlyViewed, useTitle } from '../hooks/useCommon';
import { cn, formatDate } from '../lib/utils';
import NotFound from './NotFound';

function Gallery({ images, title }) {
    const [i, setI] = useState(0);
    const [zoom, setZoom] = useState(null);
    return (
        <div className="flex min-w-0 flex-col-reverse gap-3 self-start md:flex-row md:items-start">
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-col">
                    {images.map((src, idx) => (
                        <button key={src} onClick={() => setI(idx)} className={cn('h-20 w-20 shrink-0 rounded-xl border-2 bg-soft p-1.5 transition', idx === i ? 'border-ink' : 'border-transparent hover:border-line')} aria-label={`Image ${idx + 1}`}>
                            <img src={src} alt="" className="h-full w-full object-contain" />
                        </button>
                    ))}
                </div>
            )}
            <div
                className="relative aspect-square min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-soft md:max-h-[600px]"
                onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onMouseLeave={() => setZoom(null)}
            >
                <img
                    src={images[i]}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-200"
                    style={zoom ? { transform: 'scale(1.9)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                />
            </div>
        </div>
    );
}

function Reviews({ product }) {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
    const [open, setOpen] = useState(false);
    const { data, isLoading } = useQuery({ queryKey: ['reviews', product._id, page], queryFn: () => get(`/products/${product._id}/reviews`, { page, limit: 5 }) });

    const submit = useMutation({
        mutationFn: () => api.post(`/products/${product._id}/reviews`, form),
        onSuccess: (r) => {
            toast.success(r.data.message);
            setForm({ rating: 0, title: '', comment: '' });
            setOpen(false);
            qc.invalidateQueries({ queryKey: ['reviews', product._id] });
            qc.invalidateQueries({ queryKey: ['product', product.slug] });
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    const total = data?.total || 0;
    return (
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div>
                <div className="flex items-end gap-3">
                    <p className="font-display text-6xl font-bold">{(product.ratingAvg || 0).toFixed(1)}</p>
                    <div className="pb-2">
                        <Stars value={product.ratingAvg} />
                        <p className="mt-1 text-sm text-muted">{product.ratingCount} reviews</p>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    {(data?.distribution || []).map((d) => (
                        <div key={d.rating} className="flex items-center gap-3 text-sm">
                            <span className="flex w-8 items-center gap-1">{d.rating} <LuStar className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${total ? (d.count / total) * 100 : 0}%` }} />
                            </div>
                            <span className="w-8 text-right text-muted">{d.count}</span>
                        </div>
                    ))}
                </div>
                {user ? (
                    <Button variant="outline" className="mt-6 w-full" onClick={() => setOpen((o) => !o)}>Write a review</Button>
                ) : (
                    <Button variant="outline" className="mt-6 w-full" to="/login" state={{ from: `/product/${product.slug}` }}>Sign in to review</Button>
                )}
            </div>
            <div>
                {open && (
                    <form
                        className="card mb-8 space-y-4 p-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!form.rating) return toast.error('Please choose a rating');
                            submit.mutate();
                        }}
                    >
                        <div>
                            <p className="label">Your rating</p>
                            <Stars value={form.rating} size="h-7 w-7" onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
                        </div>
                        <Field label="Title (optional)" value={form.title} maxLength={100} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                        <Field label="Review">
                            <textarea className="input" rows={4} required minLength={5} maxLength={2000} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="What did you like or dislike?" />
                        </Field>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" loading={submit.isPending}>Submit review</Button>
                        </div>
                    </form>
                )}
                {isLoading ? (
                    <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
                ) : total === 0 ? (
                    <Empty icon={LuStar} title="No reviews yet" text="Be the first to share your thoughts." />
                ) : (
                    <div className="divide-y divide-line">
                        {data.items.map((r) => (
                            <article key={r._id} className="py-5 first:pt-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {r.userPhoto ? <img src={r.userPhoto} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-soft text-sm font-bold">{r.userName?.[0]}</span>}
                                        <div>
                                            <p className="text-sm font-semibold">{r.userName}</p>
                                            <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                                        </div>
                                    </div>
                                    {r.verified && <Badge tone="success"><LuCircleCheck className="h-3 w-3" /> Verified purchase</Badge>}
                                </div>
                                <Stars value={r.rating} className="mt-3" size="h-3.5 w-3.5" />
                                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                                <p className="mt-1 text-sm leading-relaxed text-ink/85">{r.comment}</p>
                                {r.reply?.text && (
                                    <div className="mt-3 rounded-xl bg-soft p-3 text-sm">
                                        <p className="text-xs font-semibold text-muted">Response from the store</p>
                                        <p className="mt-1">{r.reply.text}</p>
                                    </div>
                                )}
                            </article>
                        ))}
                        <div className="pt-6">
                            <Pagination page={page} pages={data.pages} onChange={setPage} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductView({ slug }) {
    const navigate = useNavigate();
    const { addToCart, settings, money } = useStore();
    const { data, isLoading, error } = useQuery({ queryKey: ['product', slug], queryFn: () => get(`/products/${slug}`) });
    const [qty, setQty] = useState(1);
    const [color, setColor] = useState(null);
    const [size, setSize] = useState(null);
    const [tab, setTab] = useState('description');
    const p = data?.product;
    useTitle(p?.title);

    useEffect(() => {
        if (p?._id) pushRecentlyViewed(p._id);
    }, [p?._id]);

    if (error?.response?.status === 404) return <NotFound />;
    if (isLoading || !p)
        return (
            <div className="container-x grid gap-10 pt-8 lg:grid-cols-2">
                <Skeleton className="aspect-square rounded-3xl" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );

    const out = p.stock <= 0;
    const validate = () => {
        if (p.colors?.length && !color) return toast.error('Please choose a color'), false;
        if (p.sizes?.length && !size) return toast.error('Please choose a size'), false;
        return true;
    };
    const add = () => validate() && addToCart(p, { qty, color, size });
    const buyNow = () => {
        if (!validate()) return;
        addToCart(p, { qty, color, size, open: false });
        navigate('/checkout');
    };
    const share = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) await navigator.share({ title: p.title, url });
            else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied');
            }
        } catch {
            /* cancelled */
        }
    };

    return (
        <div className="pb-24 lg:pb-0">
            <div className="container-x pt-6">
                <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
                    <Link to="/" className="hover:text-ink">Home</Link> /
                    <Link to="/shop" className="hover:text-ink">Shop</Link> /
                    {data.category && (
                        <>
                            <Link to={`/shop?category=${data.category.slug}`} className="hover:text-ink">{data.category.name}</Link> /
                        </>
                    )}
                    <span className="truncate text-ink">{p.title}</span>
                </nav>

                <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                    <Gallery images={p.images} title={p.title} />

                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                {p.brand && <Link to={`/shop?brand=${encodeURIComponent(p.brand)}`} className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-accent">{p.brand}</Link>}
                                <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{p.title}</h1>
                            </div>
                            <div className="flex gap-2">
                                <WishlistButton productId={p._id} className="border border-line" />
                                <button onClick={share} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-soft" aria-label="Share">
                                    <LuShare2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <button onClick={() => { setTab('reviews'); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-3 flex items-center gap-2">
                            <Stars value={p.ratingAvg} />
                            <span className="text-sm text-muted underline-offset-4 hover:underline">{p.ratingAvg?.toFixed(1)} · {p.ratingCount} reviews</span>
                        </button>
                        <div className="mt-6 flex items-center gap-3">
                            <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} size="text-3xl" />
                            {p.discountPercent > 0 && <Badge tone="accent">Save {p.discountPercent}%</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted">Tax included where applicable. {settings.freeShippingThreshold ? `Free shipping over ${money(settings.freeShippingThreshold)}.` : ''}</p>
                        {p.shortDescription && <p className="mt-6 leading-relaxed text-muted">{p.shortDescription}.</p>}

                        <div className="mt-6">
                            <ProductOptions product={p} color={color} size={size} setColor={setColor} setSize={setSize} />
                        </div>

                        <p className={cn('mt-6 flex items-center gap-2 text-sm font-semibold', out ? 'text-danger' : p.stock <= (settings.lowStockThreshold || 10) ? 'text-warning' : 'text-success')}>
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {out ? 'Out of stock' : p.stock <= (settings.lowStockThreshold || 10) ? `Hurry — only ${p.stock} left` : 'In stock, ready to ship'}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <QtyInput value={qty} onChange={setQty} max={Math.max(1, Math.min(99, p.stock))} />
                            <Button className="min-w-40 flex-1" size="lg" onClick={add} disabled={out}>Add to bag</Button>
                        </div>
                        <Button variant="accent" size="lg" className="mt-3 w-full" onClick={buyNow} disabled={out}>Buy it now</Button>

                        <div className="mt-8 grid gap-3 rounded-2xl border border-line p-4 text-sm">
                            <p className="flex items-center gap-3"><LuTruck className="h-5 w-5 text-accent" /> {p.shippingInfo || 'Ships in 2–4 business days'}</p>
                            <p className="flex items-center gap-3"><LuRotateCcw className="h-5 w-5 text-accent" /> {p.returnPolicy || '30 days return policy'}</p>
                            <p className="flex items-center gap-3"><LuShieldCheck className="h-5 w-5 text-accent" /> {p.warranty || 'Secure checkout & buyer protection'}</p>
                        </div>
                    </div>
                </div>

                <section id="details" className="mt-20 scroll-mt-24">
                    <div className="flex gap-6 border-b border-line">
                        {[
                            ['description', 'Description'],
                            ['specs', 'Specifications'],
                            ['reviews', `Reviews (${p.ratingCount || 0})`],
                        ].map(([k, l]) => (
                            <button key={k} onClick={() => setTab(k)} className={cn('-mb-px border-b-2 pb-3 text-sm font-semibold transition', tab === k ? 'border-ink' : 'border-transparent text-muted hover:text-ink')}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <div className="py-8">
                        {tab === 'description' && <p className="max-w-3xl whitespace-pre-line leading-relaxed text-ink/85">{p.description}</p>}
                        {tab === 'specs' && (
                            <dl className="max-w-2xl divide-y divide-line rounded-2xl border border-line">
                                {(p.specs?.length ? p.specs : [{ label: 'SKU', value: p.sku }]).map((s) => (
                                    <div key={s.label} className="grid grid-cols-[160px_1fr] gap-4 px-5 py-3 text-sm">
                                        <dt className="text-muted">{s.label}</dt>
                                        <dd className="font-medium">{s.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {tab === 'reviews' && <Reviews product={p} />}
                    </div>
                </section>

                {data.related?.length > 0 && (
                    <section className="mt-12">
                        <h2 className="mb-8 text-3xl font-bold">You may also like</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
                            {data.related.slice(0, 4).map((r) => (
                                <ProductCard key={r._id} product={r} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.title}</p>
                        <p className="text-sm font-bold">{money(p.price)}</p>
                    </div>
                    <Button onClick={add} disabled={out}>{out ? 'Sold out' : 'Add to bag'}</Button>
                </div>
            </div>
        </div>
    );
}

export default function Product() {
    const { slug } = useParams();
    // keyed by slug so quantity / option state resets when navigating between products
    return <ProductView key={slug} slug={slug} />;
}
