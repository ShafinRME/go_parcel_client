import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { LuArrowRight, LuArrowUpRight, LuHeadphones, LuRotateCcw, LuShieldCheck, LuSparkles, LuTruck, LuZap } from 'react-icons/lu';
import { get } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { Button, SectionHeading, Skeleton, Stars } from '../components/ui';
import ProductCard, { ProductGrid, PriceTag } from '../components/product/ProductCard';
import { Newsletter } from '../components/layout/Footer';
import { getRecentlyViewed, useTitle } from '../hooks/useCommon';
import { cn } from '../lib/utils';

function Hero() {
    const { settings } = useStore();
    const { data: banners = [], isLoading } = useQuery({ queryKey: ['banners'], queryFn: () => get('/banners') });
    const [i, setI] = useState(0);
    useEffect(() => {
        if (banners.length < 2) return;
        const t = setInterval(() => setI((x) => (x + 1) % banners.length), 6500);
        return () => clearInterval(t);
    }, [banners.length]);

    if (isLoading) return <Skeleton className="h-[560px] w-full rounded-[28px]" />;
    if (!banners.length) return null;
    const b = banners[i % banners.length];

    return (
        <div className="relative overflow-hidden rounded-[28px] bg-ink text-bg dark:bg-surface dark:text-ink">
            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid min-h-[520px] items-center gap-6 p-7 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-16">
                <AnimatePresence mode="wait">
                    <motion.div key={b._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-current/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest">
                            <LuSparkles className="h-3.5 w-3.5 text-accent" /> {b.eyebrow || settings.heroBadge}
                        </span>
                        <h1 className="mt-6 max-w-xl text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl">{b.title}</h1>
                        {b.subtitle && <p className="mt-6 max-w-md text-base leading-relaxed opacity-70 sm:text-lg">{b.subtitle}</p>}
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Button to={b.ctaLink || '/shop'} variant="accent" size="lg">
                                {b.ctaText || 'Shop now'} <LuArrowRight className="h-5 w-5" />
                            </Button>
                            <Link to="/shop?onSale=true" className="inline-flex h-13 items-center gap-2 rounded-xl border border-current/20 px-6 font-semibold transition hover:bg-white/10">
                                Today's deals
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
                <div className="relative mx-auto aspect-square w-full max-w-[460px]">
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white/15 to-white/0 dark:from-ink/10" />
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={b.image}
                            src={b.image}
                            alt=""
                            initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.6 }}
                            className="relative h-full w-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)]"
                        />
                    </AnimatePresence>
                </div>
            </div>
            {banners.length > 1 && (
                <div className="absolute bottom-6 left-7 flex gap-2 sm:left-12 lg:left-16">
                    {banners.map((x, idx) => (
                        <button key={x._id} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} className={cn('h-1.5 rounded-full transition-all', idx === i % banners.length ? 'w-10 bg-accent' : 'w-4 bg-current/30')} />
                    ))}
                </div>
            )}
        </div>
    );
}

function Perks() {
    const { settings, money } = useStore();
    const items = [
        [LuTruck, 'Free shipping', settings.freeShippingThreshold ? `On orders over ${money(settings.freeShippingThreshold)}` : 'On every order'],
        [LuRotateCcw, '30-day returns', 'Change of mind? No problem'],
        [LuShieldCheck, 'Secure checkout', 'Encrypted card payments by Stripe'],
        [LuHeadphones, 'Real human support', '7 days a week, 9am – 9pm'],
    ];
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {items.map(([Icon, t, s]) => (
                <div key={t} className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 sm:p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-soft">
                        <Icon className="h-5 w-5 text-accent" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-bold">{t}</span>
                        <span className="block truncate text-xs text-muted">{s}</span>
                    </span>
                </div>
            ))}
        </div>
    );
}

function Categories() {
    const { data: cats = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories'), staleTime: 5 * 60 * 1000 });
    return (
        <section>
            <SectionHeading eyebrow="Browse" title="Shop by category" action={<Button to="/shop" variant="link">View all</Button>} />
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-7">
                {isLoading
                    ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-36 shrink-0 sm:w-auto" />)
                    : cats.map((c) => (
                          <Link key={c._id} to={`/shop?category=${c.slug}`} className="group w-36 shrink-0 snap-start sm:w-auto">
                              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-soft">
                                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-contain p-4 transition duration-700 group-hover:scale-110" />
                                  <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-surface opacity-0 shadow transition group-hover:opacity-100">
                                      <LuArrowUpRight className="h-4 w-4" />
                                  </span>
                              </div>
                              <p className="mt-2.5 text-sm font-bold">{c.name}</p>
                              <p className="text-xs text-muted">{c.productCount} items</p>
                          </Link>
                      ))}
            </div>
        </section>
    );
}

const TABS = [
    { key: 'popular', label: 'Best sellers', params: { sort: 'popular' } },
    { key: 'newest', label: 'New arrivals', params: { sort: 'newest' } },
    { key: 'rated', label: 'Top rated', params: { sort: 'rating' } },
    { key: 'sale', label: 'On sale', params: { onSale: 'true', sort: 'discount' } },
];

function ProductTabs() {
    const [tab, setTab] = useState(TABS[0]);
    const { data, isLoading } = useQuery({ queryKey: ['products', 'home', tab.key], queryFn: () => get('/products', { ...tab.params, limit: 8 }) });
    return (
        <section>
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Trending now</p>
                    <h2 className="text-3xl font-bold sm:text-4xl">Picked for you</h2>
                </div>
                <div className="flex gap-1 overflow-x-auto rounded-full bg-soft p-1 no-scrollbar">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => setTab(t)} className={cn('whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition', tab.key === t.key ? 'bg-surface shadow-sm' : 'text-muted hover:text-ink')}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
            <ProductGrid products={data?.items || []} loading={isLoading} />
            <div className="mt-10 text-center">
                <Button to={`/shop?${new URLSearchParams(tab.params)}`} variant="outline" size="lg">
                    Explore {tab.label.toLowerCase()} <LuArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </section>
    );
}

function useCountdown() {
    const end = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

function DealOfTheWeek() {
    const { data } = useQuery({ queryKey: ['products', 'deal'], queryFn: () => get('/products', { onSale: 'true', sort: 'discount', limit: 1, inStock: 'true' }) });
    const { addToCart } = useStore();
    const [d, h, m, s] = useCountdown();
    const p = data?.items?.[0];
    if (!p) return null;
    return (
        <section className="grid overflow-hidden rounded-[28px] border border-line bg-surface lg:grid-cols-2">
            <div className="relative grid place-items-center bg-soft p-10">
                <span className="absolute left-6 top-6 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-accent-ink">−{p.discountPercent}%</span>
                <img src={p.images?.[0]} alt={p.title} className="h-72 w-full object-contain sm:h-96" loading="lazy" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    <LuZap className="h-4 w-4" /> Deal of the week
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{p.title}</h2>
                <div className="mt-3 flex items-center gap-2">
                    <Stars value={p.ratingAvg} />
                    <span className="text-sm text-muted">{p.ratingCount} reviews</span>
                </div>
                <p className="mt-4 line-clamp-3 text-muted">{p.description}</p>
                <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} size="text-3xl" className="mt-6" />
                <div className="mt-6 flex gap-3">
                    {[
                        [d, 'Days'],
                        [h, 'Hours'],
                        [m, 'Mins'],
                        [s, 'Secs'],
                    ].map(([v, l]) => (
                        <div key={l} className="w-16 rounded-2xl bg-soft py-3 text-center">
                            <p className="font-display text-2xl font-bold tabular-nums">{String(v).padStart(2, '0')}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{l}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => addToCart(p)}>Add to bag</Button>
                    <Button size="lg" variant="outline" to={`/product/${p.slug}`}>View product</Button>
                </div>
            </div>
        </section>
    );
}

function Brands() {
    const { data } = useQuery({ queryKey: ['facets', ''], queryFn: () => get('/products/facets') });
    const brands = (data?.brands || []).slice(0, 18).map((b) => b.name);
    if (!brands.length) return null;
    const row = [...brands, ...brands];
    return (
        <section className="overflow-hidden border-y border-line py-8">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-14 hover:[animation-play-state:paused]">
                {row.map((b, i) => (
                    <Link key={`${b}-${i}`} to={`/shop?brand=${encodeURIComponent(b)}`} className="font-display text-2xl font-bold text-muted/60 transition hover:text-ink sm:text-3xl">
                        {b}
                    </Link>
                ))}
            </div>
            <style>{'@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
        </section>
    );
}

function Testimonials() {
    const { data = [] } = useQuery({ queryKey: ['testimonials'], queryFn: () => get('/testimonials') });
    if (!data.length) return null;
    return (
        <section>
            <SectionHeading eyebrow="Loved by customers" title="Real reviews, real people" />
            <div className="grid gap-4 md:grid-cols-3">
                {data.slice(0, 6).map((r) => (
                    <figure key={r._id} className="card flex flex-col p-6">
                        <Stars value={r.rating} />
                        <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">“{r.comment}”</blockquote>
                        <figcaption className="mt-5 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-soft text-xs font-bold">{r.userName?.[0]}</span>
                            <span>
                                <span className="block text-sm font-semibold">{r.userName}</span>
                                {r.verified && <span className="block text-xs text-success">Verified buyer</span>}
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}

function RecentlyViewed() {
    const ids = getRecentlyViewed();
    const { data } = useQuery({ queryKey: ['products', 'recent', ids.join(',')], queryFn: () => get('/products', { ids: ids.join(','), limit: 12 }), enabled: ids.length > 0 });
    const items = (data?.items || []).sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id)).slice(0, 4);
    if (!items.length) return null;
    return (
        <section>
            <SectionHeading eyebrow="Pick up where you left off" title="Recently viewed" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
                {items.map((p) => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    const { settings } = useStore();
    useTitle(settings.tagline || 'Home');
    return (
        <div className="space-y-20 pb-4 sm:space-y-24">
            <div className="container-x space-y-4 pt-4 sm:pt-6">
                <Hero />
                <Perks />
            </div>
            <div className="container-x">
                <Categories />
            </div>
            <div className="container-x">
                <ProductTabs />
            </div>
            <div className="container-x">
                <DealOfTheWeek />
            </div>
            <Brands />
            <div className="container-x">
                <Testimonials />
            </div>
            <div className="container-x">
                <RecentlyViewed />
            </div>
            <div className="container-x">
                <section className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-14 text-center text-bg sm:px-12 dark:bg-surface dark:text-ink">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Join the list</p>
                    <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold sm:text-5xl">Get 10% off your first order</h2>
                    <p className="mx-auto mt-4 max-w-md opacity-70">New drops, restocks and members-only offers. Use code <b>WELCOME10</b> at checkout.</p>
                    <div className="mt-8 flex justify-center">
                        <Newsletter dark />
                    </div>
                </section>
            </div>
        </div>
    );
}
