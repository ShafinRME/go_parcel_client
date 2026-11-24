/* eslint-disable react-refresh/only-export-components */
import { useQuery } from '@tanstack/react-query';
import { LuArrowRight, LuLock, LuShoppingBag } from 'react-icons/lu';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { Button, Empty } from '../components/ui';
import { CartLine, FreeShippingBar } from '../components/layout/CartDrawer';
import { useTitle } from '../hooks/useCommon';

export function useQuote(cart, couponCode) {
    const items = cart.map(({ productId, qty, color, size }) => ({ productId, qty, color: color || null, size: size || null }));
    return useQuery({
        queryKey: ['quote', items, couponCode || ''],
        queryFn: () => api.post('/orders/quote', { items, couponCode: couponCode || null }).then((r) => r.data),
        enabled: items.length > 0,
        placeholderData: (prev) => prev,
    });
}

export function Totals({ quote, loading }) {
    const { money, subtotal } = useStore();
    const rows = [
        ['Subtotal', money(quote?.subtotal ?? subtotal)],
        quote?.discount > 0 && [`Discount${quote.coupon ? ` (${quote.coupon.code})` : ''}`, `−${money(quote.discount)}`, 'text-success'],
        ['Shipping', quote ? (quote.shippingFee === 0 ? 'Free' : money(quote.shippingFee)) : '—'],
        ['Tax', quote ? money(quote.tax) : '—'],
    ].filter(Boolean);
    return (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
            <dl className="space-y-2.5 text-sm">
                {rows.map(([k, v, cls]) => (
                    <div key={k} className="flex justify-between">
                        <dt className="text-muted">{k}</dt>
                        <dd className={`font-semibold tabular-nums ${cls || ''}`}>{v}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold tabular-nums">{money(quote?.total ?? subtotal)}</span>
            </div>
        </div>
    );
}

export default function Cart() {
    const { cart, count } = useStore();
    useTitle('Your bag');
    const { data: quote, isFetching } = useQuote(cart);

    if (!cart.length)
        return (
            <div className="container-x pt-10">
                <Empty icon={LuShoppingBag} title="Your bag is empty" text="Discover something you'll love — new arrivals land every week." action={<Button to="/shop" size="lg">Start shopping</Button>} />
            </div>
        );

    return (
        <div className="container-x pt-8">
            <h1 className="text-4xl font-extrabold">Your bag <span className="text-muted">({count})</span></h1>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    <FreeShippingBar />
                    {quote?.problems?.length > 0 && (
                        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                            {quote.problems.map((p) => (
                                <p key={p.productId}>• {p.message}</p>
                            ))}
                        </div>
                    )}
                    <div className="card divide-y divide-line">
                        {cart.map((l) => (
                            <div key={`${l.productId}-${l.color}-${l.size}`} className="p-5">
                                <CartLine line={l} />
                            </div>
                        ))}
                    </div>
                    <Button to="/shop" variant="link">← Continue shopping</Button>
                </div>
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="card p-6">
                        <h2 className="mb-5 text-lg font-bold">Order summary</h2>
                        <Totals quote={quote} loading={isFetching} />
                        <Button to="/checkout" size="lg" className="mt-6 w-full">
                            Checkout <LuArrowRight className="h-4 w-4" />
                        </Button>
                        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
                            <LuLock className="h-3.5 w-3.5" /> Secure, encrypted checkout
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
