import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuBanknote, LuCreditCard, LuMail, LuMapPin, LuPhone, LuPrinter, LuRotateCcw, LuStickyNote, LuTriangleAlert, LuTruck } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { cn, formatDateTime, ORDER_STATUS } from '../../lib/utils';
import { Button, Confirm, Empty, Field, PageLoader } from '../../components/ui';
import { OrderStatusBadge, PageHeader, PaymentBadge } from '../components/shared';

const NEXT = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'cancelled'];

const Card = ({ title, icon: Icon, children, className, action }) => (
    <section className={cn('card p-5', className)}>
        <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-bold">
                {Icon && <Icon className="h-4.5 w-4.5 text-muted" />}
                {title}
            </h3>
            {action}
        </div>
        {children}
    </section>
);

export default function OrderDetail() {
    const { id } = useParams();
    const qc = useQueryClient();
    const { money, settings } = useStore();
    const { data: o, isLoading, error } = useQuery({ queryKey: ['admin', 'order', id], queryFn: () => get(`/admin/orders/${id}`) });

    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [tracking, setTracking] = useState({ trackingNumber: '', carrier: '' });
    const [adminNotes, setAdminNotes] = useState('');
    const [confirm, setConfirm] = useState(null); // 'refund' | 'cancel'

    // Reset the form fields whenever a fresh copy of the order arrives (state adjusted during render).
    const [syncedKey, setSyncedKey] = useState(null);
    const key = o ? `${o._id}:${o.updatedAt}:${o.status}` : null;
    if (o && key !== syncedKey) {
        setSyncedKey(key);
        setStatus(o.status);
        setTracking({ trackingNumber: o.trackingNumber || '', carrier: o.carrier || '' });
        setAdminNotes(o.adminNotes || '');
    }

    const onDone = (data, msg) => {
        qc.setQueryData(['admin', 'order', id], (prev) => ({ ...prev, ...data }));
        qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
        qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
        toast.success(msg);
    };

    const patch = useMutation({
        mutationFn: (body) => api.patch(`/admin/orders/${id}`, body).then((r) => r.data),
        onSuccess: (data, body) => {
            onDone(data, body.status && body.status !== o.status ? `Marked as ${ORDER_STATUS[body.status]?.label}` : 'Order updated');
            setNote('');
            setConfirm(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });
    const refund = useMutation({
        mutationFn: () => api.post(`/admin/orders/${id}/refund`).then((r) => r.data),
        onSuccess: (data) => {
            onDone(data, 'Payment refunded');
            setConfirm(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    if (isLoading) return <PageLoader />;
    if (error || !o) return <div className="card"><Empty title="Order not found" text={errorMessage(error)} action={<Button to="/admin/orders">Back to orders</Button>} /></div>;

    const a = o.shippingAddress || {};
    const locked = ['cancelled', 'awaiting_payment'].includes(o.status);
    const submitStatus = () => {
        if (status === 'cancelled') return setConfirm('cancel');
        patch.mutate({ status: status !== o.status ? status : undefined, note, ...tracking });
    };

    return (
        <div>
            <PageHeader
                back={
                    <Link to="/admin/orders" className="no-print mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
                        <LuArrowLeft className="h-4 w-4" /> Orders
                    </Link>
                }
                title={
                    <span className="flex flex-wrap items-center gap-3">
                        {o.orderNumber}
                        <OrderStatusBadge status={o.status} />
                        <PaymentBadge status={o.paymentStatus} />
                    </span>
                }
                description={`Placed ${formatDateTime(o.createdAt)} · ${o.itemCount} item${o.itemCount === 1 ? '' : 's'}`}
                actions={
                    <div className="no-print flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => window.print()}><LuPrinter className="h-4 w-4" /> Invoice</Button>
                        {o.paymentMethod === 'card' && o.paymentStatus === 'paid' && (
                            <Button variant="outline" onClick={() => setConfirm('refund')} className="text-danger"><LuRotateCcw className="h-4 w-4" /> Refund</Button>
                        )}
                    </div>
                }
            />

            {o.stockIssue && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm">
                    <LuTriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                    <p><b>Stock conflict.</b> This order was paid but some items could not be reserved. Contact the customer or refund the order.</p>
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <Card title="Items">
                        <ul className="divide-y divide-line">
                            {o.items.map((it, i) => (
                                <li key={i} className="flex items-center gap-4 py-3 first:pt-0">
                                    <img src={it.image} alt="" className="h-14 w-14 rounded-xl bg-soft object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <Link to={`/admin/products/${it.productId}`} className="line-clamp-1 font-semibold hover:underline">{it.title}</Link>
                                        <p className="text-xs text-muted">
                                            {[it.color, it.size].filter(Boolean).join(' · ') || 'Standard'} · {money(it.price)} × {it.qty}
                                        </p>
                                    </div>
                                    <span className="font-semibold tabular-nums">{money(it.lineTotal)}</span>
                                </li>
                            ))}
                        </ul>
                        <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{money(o.subtotal)}</dd></div>
                            {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {o.coupon?.code && <span className="ml-1 rounded bg-soft px-1.5 py-0.5 font-mono text-xs">{o.coupon.code}</span>}</dt><dd className="text-success tabular-nums">−{money(o.discount)}</dd></div>}
                            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="tabular-nums">{o.shippingFee ? money(o.shippingFee) : 'Free'}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd className="tabular-nums">{money(o.tax)}</dd></div>
                            <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{money(o.total)}</dd></div>
                        </dl>
                    </Card>

                    <Card title="Update fulfilment" icon={LuTruck} className="no-print">
                        {locked ? (
                            <p className="text-sm text-muted">{o.status === 'cancelled' ? 'This order was cancelled and can no longer be updated.' : 'This order is waiting for the customer to complete card payment.'}</p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="label">Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {NEXT.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setStatus(s)}
                                                className={cn(
                                                    'h-9 rounded-lg border px-3 text-sm font-semibold transition',
                                                    status === s ? (s === 'cancelled' ? 'border-danger bg-danger text-white' : 'border-ink bg-ink text-bg') : 'border-line hover:border-ink/40',
                                                    s === o.status && status !== s && 'border-dashed'
                                                )}
                                            >
                                                {ORDER_STATUS[s].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Carrier" value={tracking.carrier} onChange={(e) => setTracking((t) => ({ ...t, carrier: e.target.value }))} placeholder="e.g. UPS, DHL" />
                                    <Field label="Tracking number" value={tracking.trackingNumber} onChange={(e) => setTracking((t) => ({ ...t, trackingNumber: e.target.value }))} />
                                </div>
                                <Field label="Note for the timeline (visible to customer)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional message" />
                                <div className="flex justify-end">
                                    <Button onClick={submitStatus} loading={patch.isPending} variant={status === 'cancelled' ? 'danger' : 'primary'}>
                                        {status !== o.status ? `Mark as ${ORDER_STATUS[status]?.label}` : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card title="Timeline">
                        <ol className="relative ml-2 space-y-5 border-l border-line pl-6">
                            {[...(o.timeline || [])].reverse().map((t, i) => (
                                <li key={i} className="relative">
                                    <span className={cn('absolute top-1 -left-[31px] h-3 w-3 rounded-full ring-4 ring-surface', i === 0 ? 'bg-accent' : 'bg-line')} />
                                    <p className="text-sm font-semibold">{t.label}</p>
                                    {t.note && <p className="text-sm text-muted">{t.note}</p>}
                                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(t.at)}{t.by && t.by !== 'system' ? ` · ${t.by}` : ''}</p>
                                </li>
                            ))}
                        </ol>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Customer">
                        <p className="font-semibold">{o.customerName}</p>
                        <a href={`mailto:${o.email}`} className="mt-1 flex items-center gap-2 text-sm text-muted hover:text-ink"><LuMail className="h-4 w-4" /> {o.email}</a>
                        {a.phone && <a href={`tel:${a.phone}`} className="mt-1 flex items-center gap-2 text-sm text-muted hover:text-ink"><LuPhone className="h-4 w-4" /> {a.phone}</a>}
                        <p className="mt-3 text-xs text-muted">{o.customerOrders} order{o.customerOrders === 1 ? '' : 's'} with {settings.storeName || 'the store'}</p>
                    </Card>

                    <Card title="Shipping address" icon={LuMapPin}>
                        <address className="text-sm leading-relaxed not-italic">
                            {a.fullName}<br />
                            {a.line1}{a.line2 ? <>, {a.line2}</> : null}<br />
                            {a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}<br />
                            {a.country}
                        </address>
                        {o.notes && <p className="mt-3 rounded-xl bg-soft p-3 text-sm"><span className="font-semibold">Customer note:</span> {o.notes}</p>}
                        {(o.trackingNumber || o.carrier) && <p className="mt-3 text-sm"><span className="text-muted">Tracking:</span> {o.carrier} {o.trackingNumber}</p>}
                    </Card>

                    <Card title="Payment" icon={o.paymentMethod === 'cod' ? LuBanknote : LuCreditCard}>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-muted">Method</dt><dd className="font-medium">{o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card (Stripe)'}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><PaymentBadge status={o.paymentStatus} /></dd></div>
                            {o.paymentDetails?.last4 && <div className="flex justify-between"><dt className="text-muted">Card</dt><dd className="capitalize">{o.paymentDetails.brand} •••• {o.paymentDetails.last4}</dd></div>}
                            {o.paidAt && <div className="flex justify-between"><dt className="text-muted">Paid</dt><dd>{formatDateTime(o.paidAt)}</dd></div>}
                            {o.paymentIntentId && <div className="flex justify-between gap-3"><dt className="text-muted">Intent</dt><dd className="truncate font-mono text-xs">{o.paymentIntentId}</dd></div>}
                            {o.refundedAt && <div className="flex justify-between"><dt className="text-muted">Refunded</dt><dd>{formatDateTime(o.refundedAt)}</dd></div>}
                        </dl>
                        {o.paymentMethod === 'cod' && o.status !== 'cancelled' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="no-print mt-4 w-full"
                                loading={patch.isPending}
                                onClick={() => patch.mutate({ paymentStatus: o.paymentStatus === 'paid' ? 'unpaid' : 'paid' })}
                            >
                                {o.paymentStatus === 'paid' ? 'Mark as unpaid' : 'Mark cash as collected'}
                            </Button>
                        )}
                    </Card>

                    <Card title="Internal notes" icon={LuStickyNote} className="no-print">
                        <textarea rows={4} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="input" placeholder="Only visible to admins" />
                        <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline" disabled={adminNotes === (o.adminNotes || '')} loading={patch.isPending} onClick={() => patch.mutate({ adminNotes })}>Save note</Button>
                        </div>
                    </Card>
                </div>
            </div>

            <Confirm
                open={confirm === 'refund'}
                onClose={() => setConfirm(null)}
                onConfirm={() => refund.mutate()}
                loading={refund.isPending}
                title="Refund this payment?"
                message={`${money(o.total)} will be refunded to the customer's card through Stripe. Undelivered orders are also cancelled and restocked.`}
                confirmText="Refund"
            />
            <Confirm
                open={confirm === 'cancel'}
                onClose={() => setConfirm(null)}
                onConfirm={() => patch.mutate({ status: 'cancelled', note })}
                loading={patch.isPending}
                title="Cancel this order?"
                message={o.paymentStatus === 'paid' && o.paymentMethod === 'card' ? 'The card payment will be refunded automatically and stock returned.' : 'Reserved stock will be returned to inventory.'}
                confirmText="Cancel order"
            />
        </div>
    );
}
