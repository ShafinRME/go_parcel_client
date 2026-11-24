import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowRight } from 'react-icons/lu';
import { Button, Modal, QtyInput, Skeleton, Stars } from '../ui';
import { useStore } from '../../context/StoreContext';
import { get } from '../../lib/api';
import { PriceTag, WishlistButton } from './ProductCard';
import ProductOptions from './ProductOptions';

function Body({ slug, onClose }) {
    const { addToCart } = useStore();
    const { data, isLoading } = useQuery({ queryKey: ['product', slug], queryFn: () => get(`/products/${slug}`) });
    const [img, setImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [color, setColor] = useState(null);
    const [size, setSize] = useState(null);

    if (isLoading || !data)
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="aspect-square" />
                <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-24" />
                </div>
            </div>
        );
    const p = data.product;
    const add = () => {
        if (p.colors?.length && !color) return toast.error('Please choose a color');
        if (p.sizes?.length && !size) return toast.error('Please choose a size');
        addToCart(p, { qty, color, size });
        onClose();
    };
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-soft">
                    <img src={p.images[img]} alt={p.title} className="h-full w-full object-contain p-6" />
                    <WishlistButton productId={p._id} className="absolute right-3 top-3" />
                </div>
                {p.images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {p.images.map((src, i) => (
                            <button key={src} onClick={() => setImg(i)} className={`h-16 w-16 shrink-0 rounded-xl border-2 bg-soft p-1 ${i === img ? 'border-ink' : 'border-transparent'}`}>
                                <img src={src} alt="" className="h-full w-full object-contain" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{p.brand}</p>
                <h3 className="mt-1 text-2xl font-bold">{p.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                    <Stars value={p.ratingAvg} />
                    <span className="text-sm text-muted">{p.ratingCount} reviews</span>
                </div>
                <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} size="text-2xl" className="mt-4" />
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted">{p.description}</p>
                <div className="mt-5">
                    <ProductOptions product={p} color={color} size={size} setColor={setColor} setSize={setSize} />
                </div>
                <div className="mt-6 flex gap-3">
                    <QtyInput value={qty} onChange={setQty} max={Math.max(1, p.stock)} />
                    <Button className="flex-1" onClick={add} disabled={p.stock <= 0}>{p.stock > 0 ? 'Add to bag' : 'Sold out'}</Button>
                </div>
                <Link to={`/product/${p.slug}`} onClick={onClose} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-accent">
                    View full details <LuArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export default function QuickView() {
    const { quickView, setQuickView } = useStore();
    return (
        <Modal open={!!quickView} onClose={() => setQuickView(null)} size="max-w-4xl">
            {quickView && <Body key={quickView} slug={quickView} onClose={() => setQuickView(null)} />}
        </Modal>
    );
}
