import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { LuBanknote, LuCreditCard, LuLock, LuMapPin, LuTag, LuX } from 'react-icons/lu';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, errorMessage } from '../lib/api';
import { Button, Field } from '../components/ui';
import { Totals, useQuote } from './Cart';
import { useTitle } from '../hooks/useCommon';
import { cn } from '../lib/utils';

const stripePromise = import.meta.env.VITE_payment_Key ? loadStripe(import.meta.env.VITE_payment_Key) : null;

const EMPTY = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'United States' };

function CheckoutForm() {
    const { cart, clearCart, money, settings } = useStore();
    const { profile, user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { theme } = useTheme();

    const saved = profile?.addresses || [];
    const [addrId, setAddrId] = useState(() => saved.find((a) => a.isDefault)?._id || saved[0]?._id || 'new');
    const [addr, setAddr] = useState({ ...EMPTY, fullName: profile?.name || '' });
    const [saveAddr, setSaveAddr] = useState(true);
    const [errors, setErrors] = useState({});
    const [method, setMethod] = useState('card');
    const [couponInput, setCouponInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [notes, setNotes] = useState('');
    const [placing, setPlacing] = useState(false);
    const [cardError, setCardError] = useState('');
    const [pending, setPending] = useState(null); // { orderId, clientSecret } kept for retries

    const { data: quote, isFetching } = useQuote(cart, coupon);

    const announced = useRef('');
    useEffect(() => {
        if (!coupon) {
            announced.current = '';
            return;
        }
        if (quote?.couponError) {
            toast.error(quote.couponError);
            setCoupon('');
        } else if (quote?.coupon?.code === coupon && announced.current !== coupon) {
            announced.current = coupon;
            toast.success(`Coupon ${coupon} applied`);
        }
    }, [quote?.couponError, quote?.coupon?.code, coupon]);

    const shipping = addrId === 'new' ? addr : saved.find((a) => a._id === addrId);
    const cardStyle = useMemo(
        () => ({
            style: {
                base: { fontSize: '15px', color: theme === 'dark' ? '#f3f2ef' : '#121212', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#8a8984' } },
                invalid: { color: '#d23b3b' },
            },
            hidePostalCode: false,
        }),
        [theme]
    );

    const validateAddress = () => {
        if (addrId !== 'new') return true;
        const e = {};
        if (addr.fullName.trim().length < 2) e.fullName = 'Required';
        if (addr.phone.trim().length < 5) e.phone = 'Required';
        if (addr.line1.trim().length < 3) e.line1 = 'Required';
        if (addr.city.trim().length < 2) e.city = 'Required';
        if (addr.postalCode.trim().length < 2) e.postalCode = 'Required';
        if (addr.country.trim().length < 2) e.country = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const finish = (orderId) => {
        clearCart();
        navigate(`/order/${orderId}/success`, { replace: true });
    };

    const payCard = async (orderId, clientSecret) => {
        const card = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card, billing_details: { name: shipping.fullName, email: user.email, phone: shipping.phone } },
        });
        if (error) {
            setCardError(error.message);
            throw new Error(error.message);
        }
        if (paymentIntent.status === 'succeeded') {
            await api.post(`/orders/${orderId}/confirm`);
            finish(orderId);
        }
    };

    const place = async (e) => {
        e.preventDefault();
        setCardError('');
        if (!validateAddress()) return toast.error('Please complete your shipping address');
        if (quote?.problems?.length) return toast.error(quote.problems[0].message);
        if (method === 'card' && (!stripe || !elements)) return toast.error('Card payments are still loading');

        setPlacing(true);
        try {
            if (pending && method === 'card') {
                await payCard(pending.orderId, pending.clientSecret);
                return;
            }
            if (addrId === 'new' && saveAddr) {
                api.post('/users/me/addresses', { ...addr, label: 'Home', isDefault: saved.length === 0 }).then(refreshProfile).catch(() => {});
            }
            const { data } = await api.post('/orders', {
                items: cart.map(({ productId, qty, color, size }) => ({ productId, qty, color: color || null, size: size || null })),
                couponCode: coupon || null,
                shippingAddress: { ...shipping, email: user.email, _id: undefined, label: undefined, isDefault: undefined },
                paymentMethod: method,
                notes,
            });
            if (method === 'cod') return finish(data.order._id);
            setPending({ orderId: data.order._id, clientSecret: data.clientSecret });
            await payCard(data.order._id, data.clientSecret);
        } catch (err) {
            if (!err?.response && err?.message) return; // card error already shown inline
            toast.error(errorMessage(err));
        } finally {
            setPlacing(false);
        }
    };

    const setA = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));

    return (
        <form onSubmit={place} className="grid gap-10 lg:grid-cols-[1fr_420px]">
            <div className="space-y-8">
                <section className="card p-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold"><LuMapPin className="h-5 w-5 text-accent" /> Shipping address</h2>
                    <p className="mt-1 text-sm text-muted">Order updates go to {user.email}</p>
                    {saved.length > 0 && (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {saved.map((a) => (
                                <label key={a._id} className={cn('cursor-pointer rounded-2xl border p-4 text-sm transition', addrId === a._id ? 'border-ink ring-4 ring-ink/5' : 'border-line hover:border-ink/30')}>
                                    <input type="radio" className="sr-only" checked={addrId === a._id} onChange={() => setAddrId(a._id)} />
                                    <p className="font-semibold">{a.fullName} <span className="ml-1 text-xs font-normal text-muted">{a.label}</span></p>
                                    <p className="mt-1 text-muted">{a.line1}{a.line2 && `, ${a.line2}`}</p>
                                    <p className="text-muted">{a.city}{a.state && `, ${a.state}`} {a.postalCode}, {a.country}</p>
                                    <p className="text-muted">{a.phone}</p>
                                </label>
                            ))}
                            <label className={cn('grid cursor-pointer place-items-center rounded-2xl border border-dashed p-4 text-sm font-semibold transition', addrId === 'new' ? 'border-ink' : 'border-line hover:border-ink/30')}>
                                <input type="radio" className="sr-only" checked={addrId === 'new'} onChange={() => setAddrId('new')} />
                                + Use a new address
                            </label>
                        </div>
                    )}
                    {addrId === 'new' && (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Field label="Full name" value={addr.fullName} onChange={setA('fullName')} error={errors.fullName} autoComplete="name" />
                            <Field label="Phone" value={addr.phone} onChange={setA('phone')} error={errors.phone} autoComplete="tel" />
                            <Field className="sm:col-span-2" label="Street address" value={addr.line1} onChange={setA('line1')} error={errors.line1} autoComplete="address-line1" />
                            <Field className="sm:col-span-2" label="Apartment, suite (optional)" value={addr.line2} onChange={setA('line2')} autoComplete="address-line2" />
                            <Field label="City" value={addr.city} onChange={setA('city')} error={errors.city} autoComplete="address-level2" />
                            <Field label="State / region" value={addr.state} onChange={setA('state')} autoComplete="address-level1" />
                            <Field label="Postal code" value={addr.postalCode} onChange={setA('postalCode')} error={errors.postalCode} autoComplete="postal-code" />
                            <Field label="Country" value={addr.country} onChange={setA('country')} error={errors.country} autoComplete="country-name" />
                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" /> Save this address for next time
                            </label>
                        </div>
                    )}
                </section>

                <section className="card p-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold"><LuCreditCard className="h-5 w-5 text-accent" /> Payment</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {[
                            ['card', LuCreditCard, 'Credit / debit card', 'Visa, Mastercard, Amex'],
                            settings.codEnabled !== false && ['cod', LuBanknote, 'Cash on delivery', 'Pay when it arrives'],
                        ]
                            .filter(Boolean)
                            .map(([k, Icon, t, s]) => (
                                <label key={k} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition', method === k ? 'border-ink ring-4 ring-ink/5' : 'border-line hover:border-ink/30')}>
                                    <input type="radio" className="sr-only" checked={method === k} onChange={() => setMethod(k)} disabled={!!pending && k === 'cod'} />
                                    <Icon className="h-5 w-5" />
                                    <span>
                                        <span className="block text-sm font-semibold">{t}</span>
                                        <span className="block text-xs text-muted">{s}</span>
                                    </span>
                                </label>
                            ))}
                    </div>
                    {method === 'card' && (
                        <div className="mt-5">
                            <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
                                <CardElement options={cardStyle} onChange={() => setCardError('')} />
                            </div>
                            {cardError && <p className="mt-2 text-sm text-danger">{cardError}</p>}
                            <p className="mt-2 text-xs text-muted">Test mode: use card 4242 4242 4242 4242, any future date and any CVC.</p>
                        </div>
                    )}
                </section>

                <section className="card p-6">
                    <Field label="Order notes (optional)">
                        <textarea className="input" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions, gift message…" />
                    </Field>
                </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="card p-6">
                    <h2 className="mb-5 text-lg font-bold">Order summary</h2>
                    <ul className="mb-6 max-h-72 space-y-4 overflow-y-auto pr-1">
                        {(quote?.lines || []).map((l) => (
                            <li key={`${l.productId}-${l.color}-${l.size}`} className="flex items-center gap-3">
                                <span className="relative">
                                    <img src={l.image} alt="" className="h-14 w-14 rounded-xl bg-soft object-contain p-1" />
                                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-bg">{l.qty}</span>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">{l.title}</span>
                                    <span className="block text-xs text-muted">{[l.color, l.size].filter(Boolean).join(' · ')}</span>
                                </span>
                                <span className="text-sm font-semibold">{money(l.lineTotal)}</span>
                            </li>
                        ))}
                    </ul>
                    {quote?.problems?.length > 0 && (
                        <div className="mb-4 rounded-xl bg-warning/10 p-3 text-xs text-warning">{quote.problems.map((p) => <p key={p.productId}>• {p.message}</p>)}</div>
                    )}
                    {quote?.coupon ? (
                        <div className="mb-5 flex items-center justify-between rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success">
                            <span className="flex items-center gap-2 font-semibold"><LuTag className="h-4 w-4" /> {quote.coupon.code}</span>
                            <button type="button" onClick={() => setCoupon('')} aria-label="Remove coupon" disabled={!!pending}><LuX className="h-4 w-4" /></button>
                        </div>
                    ) : (
                        <div className="mb-5 flex gap-2">
                            <input className="input uppercase" placeholder="Discount code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} disabled={!!pending} aria-label="Discount code" />
                            <Button variant="outline" onClick={() => couponInput.trim() && setCoupon(couponInput.trim().toUpperCase())} disabled={!!pending}>Apply</Button>
                        </div>
                    )}
                    <Totals quote={quote} loading={isFetching} />
                    <Button type="submit" size="lg" className="mt-6 w-full" loading={placing} disabled={!quote || quote.problems?.length > 0}>
                        <LuLock className="h-4 w-4" /> {method === 'cod' ? 'Place order' : `Pay ${money(quote?.total || 0)}`}
                    </Button>
                    <p className="mt-3 text-center text-xs text-muted">By placing your order you agree to our terms and returns policy.</p>
                </div>
            </aside>
        </form>
    );
}

export default function Checkout() {
    const { cart } = useStore();
    const { profile } = useAuth();
    useTitle('Checkout');
    if (!cart.length) return <Navigate to="/cart" replace />;
    return (
        <div className="container-x pt-8">
            <h1 className="mb-8 text-4xl font-extrabold">Checkout</h1>
            {!stripePromise && <p className="mb-6 rounded-xl bg-warning/10 p-3 text-sm text-warning">Card payments are not configured (VITE_payment_Key missing). Cash on delivery still works.</p>}
            <Elements stripe={stripePromise}>{profile ? <CheckoutForm key={profile._id} /> : <p className="text-muted">Loading your account…</p>}</Elements>
        </div>
    );
}
