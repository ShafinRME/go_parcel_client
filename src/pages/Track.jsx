import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LuPackageSearch } from 'react-icons/lu';
import { get, errorMessage } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { Button, Field } from '../components/ui';
import { OrderProgress, OrderStatusBadge, OrderTimeline } from '../components/order';
import { useTitle } from '../hooks/useCommon';
import { formatDate } from '../lib/utils';

export default function Track() {
    useTitle('Track your order');
    const [params, setParams] = useSearchParams();
    const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
    const [email, setEmail] = useState(params.get('email') || '');
    const { money } = useStore();
    const q = { orderNumber: params.get('order'), email: params.get('email') };
    const { data, isFetching, error } = useQuery({
        queryKey: ['track', q],
        queryFn: () => get('/track', q),
        enabled: !!(q.orderNumber && q.email),
        retry: false,
    });

    return (
        <div className="container-x max-w-3xl pt-10">
            <div className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-soft"><LuPackageSearch className="h-6 w-6 text-accent" /></span>
                <h1 className="mt-5 text-4xl font-extrabold">Track your order</h1>
                <p className="mt-2 text-muted">Enter the order number from your confirmation and the email you used at checkout.</p>
            </div>
            <form
                className="card mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                onSubmit={(e) => {
                    e.preventDefault();
                    setParams({ order: orderNumber.trim().toUpperCase(), email: email.trim().toLowerCase() });
                }}
            >
                <Field label="Order number" placeholder="LC-100001" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                <Field label="Email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" loading={isFetching}>Track</Button>
            </form>

            {error && <p className="mt-6 rounded-xl bg-danger/10 p-4 text-center text-sm text-danger">{errorMessage(error)}</p>}
            {data && (
                <div className="card mt-6 space-y-8 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted">Order {data.orderNumber} · placed {formatDate(data.createdAt)}</p>
                            <p className="text-lg font-bold">{money(data.total)} · {data.items.reduce((s, i) => s + i.qty, 0)} items</p>
                        </div>
                        <OrderStatusBadge status={data.status} />
                    </div>
                    <OrderProgress status={data.status} />
                    {data.trackingNumber && (
                        <p className="rounded-xl bg-soft p-3 text-sm">
                            Carrier tracking: <b>{data.carrier ? `${data.carrier} · ` : ''}{data.trackingNumber}</b>
                        </p>
                    )}
                    <OrderTimeline timeline={data.timeline} />
                </div>
            )}
        </div>
    );
}
