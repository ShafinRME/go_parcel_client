import { Link, useNavigate } from 'react-router';
import { LuShoppingBag, LuTrash2, LuTruck } from 'react-icons/lu';
import { Button, Drawer, Empty, QtyInput } from '../ui';
import { useStore } from '../../context/StoreContext';

export function FreeShippingBar() {
    const { subtotal, settings, money } = useStore();
    const goal = Number(settings.freeShippingThreshold) || 0;
    if (!goal) return null;
    const left = Math.max(0, goal - subtotal);
    const pct = Math.min(100, (subtotal / goal) * 100);
    return (
        <div className="rounded-2xl bg-soft p-4">
            <p className="flex items-center gap-2 text-sm">
                <LuTruck className="h-4 w-4 text-accent" />
                {left > 0 ? (
                    <span>
                        You're <b>{money(left)}</b> away from free shipping
                    </span>
                ) : (
                    <b>You've unlocked free shipping 🎉</b>
                )}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function CartLine({ line, compact }) {
    const { setQty, removeFromCart, money } = useStore();
    const p = line.product || {};
    return (
        <div className="flex gap-4">
            <Link to={`/product/${p.slug}`} className="shrink-0">
                <img src={p.images?.[0]} alt={p.title} className={`${compact ? 'h-20 w-20' : 'h-24 w-24'} rounded-xl bg-soft object-contain p-1.5`} loading="lazy" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link to={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">{p.title}</Link>
                        <p className="mt-0.5 text-xs text-muted">{[p.brand, line.color, line.size && `Size ${line.size}`].filter(Boolean).join(' · ')}</p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">{money(p.price * line.qty)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                    <QtyInput size="sm" value={line.qty} max={Math.min(99, p.stock || 99)} onChange={(q) => setQty(line, q)} />
                    <button onClick={() => removeFromCart(line)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-soft hover:text-danger" aria-label="Remove item">
                        <LuTrash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartDrawer() {
    const { cart, cartOpen, setCartOpen, subtotal, money, count } = useStore();
    const navigate = useNavigate();
    const go = (to) => {
        setCartOpen(false);
        navigate(to);
    };
    return (
        <Drawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            title={`Your bag${count ? ` (${count})` : ''}`}
            footer={
                cart.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted">Subtotal</span>
                            <span className="text-lg font-bold">{money(subtotal)}</span>
                        </div>
                        <p className="text-xs text-muted">Shipping, taxes and discounts are calculated at checkout.</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" onClick={() => go('/cart')}>View bag</Button>
                            <Button onClick={() => go('/checkout')}>Checkout</Button>
                        </div>
                    </div>
                )
            }
        >
            {cart.length === 0 ? (
                <Empty icon={LuShoppingBag} title="Your bag is empty" text="Looks like you haven't added anything yet." action={<Button onClick={() => go('/shop')}>Start shopping</Button>} />
            ) : (
                <div className="space-y-5 p-5">
                    <FreeShippingBar />
                    {cart.map((l) => (
                        <CartLine key={`${l.productId}-${l.color}-${l.size}`} line={l} compact />
                    ))}
                </div>
            )}
        </Drawer>
    );
}
