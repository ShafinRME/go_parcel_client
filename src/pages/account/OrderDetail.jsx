import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuCreditCard, LuPrinter, LuStar } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, Confirm, Modal, PageLoader } from '../../components/ui';
import { OrderProgress, OrderStatusBadge, OrderTimeline, PaymentBadge } from '../../components/order';
import { formatDateTime } from '../../lib/utils';
import { useTitle } from '../../hooks/useCommon';

const stripePromise = import.meta.env.VITE_payment_Key ? loadStripe(import.meta.env.VITE_payment_Key) : null;

function PayForm({ order, onDone }) {
    const stripe = useStripe();
    const elements = useElements();
    const { theme } = useTheme();
    const { money } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post(`/orders/${order._id}/pay`);
            if (!data.paid) {
                const { error: err } = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
                if (err) throw new Error(err.message);
                await api.post(`/orders/${order._id}/confirm`);
            }
            toast.success('Payment received — thank you!');
            onDone();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={pay}>
            <div className="rounded-xl border border-line px-4 py-3.5">
                <CardElement options={{ style: { base: { fontSize: '15px', color: theme === 'dark' ? '#f3f2ef' : '#121212' } } }} />
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <Button type="submit" className="mt-5 w-full" size="lg" loading={loading}>Pay {money(order.total)}</Button>
        </form>
    );
}

export default function OrderDetail() {
    const { id } = useParams();
    const qc = useQueryClient();
    const { money } = useStore();
    const { data: o, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => get(`/orders/${id}`) });
    const [cancelOpen, setCancelOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    useTitle(o ? `Order ${o.orderNumber}` : 'Order');
    if (isLoading || !o) return <PageLoader />;

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ['order', id] });
        qc.invalidateQueries({ queryKey: ['my-orders'] });
    };
    const cancel = async () => {
        setBusy(true);
        try {
            await api.post(`/orders/${o._id}/cancel`, { reason: 'Cancelled by customer' });
            toast.success(o.paymentStatus === 'paid' ? 'Order cancelled — your refund is on its way' : 'Order cancelled');
            setCancelOpen(false);
            refresh();
        } catch (e) {
            toast.error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };
    const canCancel = ['awaiting_payment', 'pending', 'processing'].includes(o.status);
    const a = o.shippingAddress || {};

    return (
        <div className="space-y-6">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
                <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><LuArrowLeft className="h-4 w-4" /> All orders</Link>
                <div className="flex flex-wrap gap-2">
                    {o.status === 'awaiting_payment' && <Button size="sm" variant="accent" onClick={() => setPayOpen(true)}><LuCreditCard className="h-4 w-4" /> Pay now</Button>}
                    <Button size="sm" variant="outline" onClick={() => window.print()}><LuPrinter className="h-4 w-4" /> Invoice</Button>
                    {canCancel && <Button size="sm" variant="ghost" className="text-danger" onClick={() => setCancelOpen(true)}>Cancel order</Button>}
                </div>
            </div>

            <div className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold">Order {o.orderNumber}</h1>
                        <p className="mt-1 text-sm text-muted">Placed {formatDateTime(o.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                        <OrderStatusBadge status={o.status} />
                        <PaymentBadge status={o.paymentStatus} />
                    </div>
                </div>
                <div className="mt-8">
                    <OrderProgress status={o.status} />
                </div>
                {o.trackingNumber && (
                    <p className="mt-6 rounded-xl bg-soft p-3 text-sm">Tracking: <b>{o.carrier ? `${o.carrier} · ` : ''}{o.trackingNumber}</b></p>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="card divide-y divide-line">
                    {o.items.map((l) => (
                        <div key={l.productId + (l.color || '') + (l.size || '')} className="flex items-center gap-4 p-5">
                            <img src={l.image} alt="" className="h-16 w-16 rounded-xl bg-soft object-contain p-1" />
                            <div className="min-w-0 flex-1">
                                <Link to={`/product/${l.slug}`} className="text-sm font-semibold hover:underline">{l.title}</Link>
                                <p className="text-xs text-muted">{[l.color, l.size && `Size ${l.size}`, `${money(l.price)} × ${l.qty}`].filter(Boolean).join(' · ')}</p>
                                {o.status === 'delivered' && (
                                    <Link to={`/product/${l.slug}#details`} className="no-print mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent"><LuStar className="h-3 w-3" /> Write a review</Link>
                                )}
                            </div>
                            <p className="text-sm font-bold">{money(l.lineTotal)}</p>
                        </div>
                    ))}
                    <dl className="space-y-2 p-5 text-sm">
                        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
                        {o.discount > 0 && <div className="flex justify-between text-success"><dt>Discount {o.coupon?.code && `(${o.coupon.code})`}</dt><dd>−{money(o.discount)}</dd></div>}
                        <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{o.shippingFee ? money(o.shippingFee) : 'Free'}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{money(o.tax)}</dd></div>
                        <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
                    </dl>
                </div>
                <div className="space-y-6">
                    <div className="card p-5 text-sm">
                        <p className="mb-2 font-bold">Shipping to</p>
                        <p>{a.fullName}</p>
                        <p className="text-muted">{a.line1}{a.line2 && `, ${a.line2}`}</p>
                        <p className="text-muted">{a.city}{a.state && `, ${a.state}`} {a.postalCode}</p>
                        <p className="text-muted">{a.country}</p>
                        <p className="mt-1 text-muted">{a.phone}</p>
                        <p className="mb-2 mt-5 font-bold">Payment</p>
                        <p className="text-muted">
                            {o.paymentMethod === 'cod' ? 'Cash on delivery' : o.paymentDetails?.last4 ? `${o.paymentDetails.brand?.toUpperCase()} •••• ${o.paymentDetails.last4}` : 'Card'}
                        </p>
                    </div>
                    <div className="card no-print p-5">
                        <p className="mb-4 font-bold">Activity</p>
                        <OrderTimeline timeline={o.timeline} />
                    </div>
                </div>
            </div>

            <Confirm
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                onConfirm={cancel}
                loading={busy}
                title="Cancel this order?"
                message={o.paymentStatus === 'paid' ? 'Your card payment will be refunded in full. This cannot be undone.' : 'This cannot be undone.'}
                confirmText="Yes, cancel order"
            />
            <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Complete payment">
                <Elements stripe={stripePromise}>
                    <PayForm order={o} onDone={() => { setPayOpen(false); refresh(); }} />
                </Elements>
            </Modal>
        </div>
    );
}
