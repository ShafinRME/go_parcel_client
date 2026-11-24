import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LuPackage } from 'react-icons/lu';
import { get } from '../../lib/api';
import { Button, Empty, Pagination, Skeleton } from '../../components/ui';
import { OrderRow } from './Overview';
import { cn } from '../../lib/utils';
import { useTitle } from '../../hooks/useCommon';

const FILTERS = [
    ['', 'All'],
    ['pending', 'Placed'],
    ['processing', 'Processing'],
    ['shipped', 'Shipped'],
    ['delivered', 'Delivered'],
    ['awaiting_payment', 'Unpaid'],
    ['cancelled', 'Cancelled'],
];

export default function Orders() {
    useTitle('My orders');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useQuery({ queryKey: ['my-orders', page, status], queryFn: () => get('/orders/mine', { page, status: status || undefined }), placeholderData: keepPreviousData });
    return (
        <div>
            <h1 className="text-3xl font-extrabold">Orders</h1>
            <div className="mt-6 flex gap-1 overflow-x-auto no-scrollbar">
                {FILTERS.map(([k, l]) => (
                    <button key={k} onClick={() => { setStatus(k); setPage(1); }} className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition', status === k ? 'bg-ink text-bg' : 'bg-soft hover:bg-line')}>
                        {l}
                    </button>
                ))}
            </div>
            <div className="card mt-6 overflow-hidden">
                {isLoading ? (
                    <div className="space-y-3 p-5">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
                ) : data?.items?.length ? (
                    <div className="divide-y divide-line">{data.items.map((o) => <OrderRow key={o._id} o={o} />)}</div>
                ) : (
                    <Empty icon={LuPackage} title="No orders here" action={<Button to="/shop">Shop now</Button>} />
                )}
            </div>
            <div className="mt-6">
                <Pagination page={page} pages={data?.pages} onChange={setPage} />
            </div>
        </div>
    );
}
