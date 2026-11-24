import { Link } from 'react-router';
import { LuEye, LuHeart, LuPlus } from 'react-icons/lu';
import { Skeleton, Stars } from '../ui';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function WishlistButton({ productId, className }) {
    const { inWishlist, toggleWishlist } = useStore();
    const on = inWishlist(productId);
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(productId);
            }}
            aria-label={on ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={on}
            className={cn('grid h-9 w-9 place-items-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition hover:scale-105', className)}
        >
            <LuHeart className={cn('h-4 w-4 transition', on ? 'fill-accent text-accent' : 'text-ink')} />
        </button>
    );
}

export function PriceTag({ price, compareAtPrice, className, size = 'text-base' }) {
    const { money } = useStore();
    return (
        <div className={cn('flex items-baseline gap-2', className)}>
            <span className={cn('font-bold tabular-nums', size)}>{money(price)}</span>
            {compareAtPrice > price && <span className="text-sm text-muted line-through tabular-nums">{money(compareAtPrice)}</span>}
        </div>
    );
}

export default function ProductCard({ product: p, className }) {
    const { addToCart, setQuickView, settings } = useStore();
    const out = p.stock <= 0;
    const low = !out && p.stock <= (settings.lowStockThreshold || 10);
    const needsOptions = p.colors?.length > 0 || p.sizes?.length > 0;

    return (
        <article className={cn('group relative flex flex-col', className)}>
            <Link to={`/product/${p.slug}`} className="relative block overflow-hidden rounded-2xl bg-soft">
                <div className="aspect-[4/5]">
                    <img
                        src={p.images?.[0]}
                        alt={p.title}
                        loading="lazy"
                        className={cn('h-full w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-105', p.images?.[1] && 'group-hover:opacity-0')}
                    />
                    {p.images?.[1] && (
                        <img src={p.images[1]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                    )}
                </div>
                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                    {p.discountPercent > 0 && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-ink">−{p.discountPercent}%</span>}
                    {out && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-bg">Sold out</span>}
                    {low && <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-warning">Only {p.stock} left</span>}
                </div>
                <WishlistButton productId={p._id} className="absolute right-3 top-3" />
                <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (needsOptions) setQuickView(p.slug);
                            else addToCart(p);
                        }}
                        disabled={out}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-50"
                    >
                        <LuPlus className="h-4 w-4" /> {needsOptions ? 'Choose options' : 'Add to bag'}
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setQuickView(p.slug);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-surface text-ink shadow-sm"
                        aria-label="Quick view"
                    >
                        <LuEye className="h-4 w-4" />
                    </button>
                </div>
            </Link>
            <div className="flex flex-1 flex-col px-1 pt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">{p.brand || ' '}</p>
                <Link to={`/product/${p.slug}`} className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug hover:underline">{p.title}</Link>
                <div className="mt-1.5 flex items-center gap-1.5">
                    <Stars value={p.ratingAvg} size="h-3.5 w-3.5" />
                    <span className="text-xs text-muted">({p.ratingCount || 0})</span>
                </div>
                <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} className="mt-2" />
            </div>
        </article>
    );
}

export function ProductCardSkeleton() {
    return (
        <div>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <Skeleton className="mt-3 h-3 w-16" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <Skeleton className="mt-2 h-4 w-20" />
        </div>
    );
}

export function ProductGrid({ products, loading, count = 8, className }) {
    return (
        <div className={cn('grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4', className)}>
            {loading ? Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />) : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
    );
}
