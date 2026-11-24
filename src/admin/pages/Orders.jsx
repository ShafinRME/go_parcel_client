import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuDownload, LuSearch, LuShoppingBag } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { useDebounce } from '../../hooks/useCommon';
import { cn, downloadBlob, formatDateTime, ORDER_STATUS } from '../../lib/utils';
import { Badge, Button, Empty, Pagination } from '../../components/ui';
import { OrderStatusBadge, PageHeader, PaymentBadge, Select, SkeletonRows, Table, Td, Th } from '../components/shared';

const TABS = ['', 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'awaiting_payment'];

export default function Orders() {
    const { money } = useStore();
    const [sp, setSp] = useSearchParams();
    const [search, setSearch] = useState(sp.get('search') || '');
    const [exporting, setExporting] = useState(false);
    const q = useDebounce(search, 350);

    const status = sp.get('status') || '';
    const paymentStatus = sp.get('paymentStatus') || '';
    const paymentMethod = sp.get('paymentMethod') || '';
    const from = sp.get('from') || '';
    const to = sp.get('to') || '';
    const page = Number(sp.get('page')) || 1;

    const update = (k, v) => {
        const next = new URLSearchParams(sp);
        if (v) next.set(k, v);
        else next.delete(k);
        if (k !== 'page') next.delete('page');
        setSp(next, { replace: true });
    };

    const filters = { status, paymentStatus, paymentMethod, from, to, search: q };
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['admin', 'orders', filters, page],
        queryFn: () => get('/admin/orders', { ...filters, page, limit: 15 }),
        placeholderData: keepPreviousData,
    });
    const counts = data?.counts || {};
    const allCount = Object.entries(counts).reduce((s, [k, v]) => (k === 'awaiting_payment' ? s : s + v), 0);

    const exportCsv = async () => {
        setExporting(true);
        try {
            const r = await api.get('/admin/orders/export', { params: filters, responseType: 'blob' });
            downloadBlob(r.data, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
        } catch (e) {
            toast.error(errorMessage(e));
        } finally {
            setExporting(false);
        }
    };

    const items = data?.items || [];

    return (
        <div>
            <PageHeader title="Orders" description="Track, fulfil and manage every order." actions={<Button variant="outline" onClick={exportCsv} loading={exporting}><LuDownload className="h-4 w-4" /> Export CSV</Button>} />

            <div className="card overflow-hidden">
                <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 pt-3">
                    {TABS.map((t) => {
                        const n = t ? counts[t] || 0 : allCount;
                        return (
                            <button
                                key={t || 'all'}
                                onClick={() => update('status', t)}
                                className={cn('relative flex shrink-0 items-center gap-1.5 px-3 pb-3 text-sm font-semibold transition', status === t ? 'text-ink' : 'text-muted hover:text-ink')}
                            >
                                {t ? ORDER_STATUS[t]?.label : 'All'}
                                <span className={cn('rounded-full px-1.5 text-[11px]', status === t ? 'bg-ink text-bg' : 'bg-soft')}>{n}</span>
                                {status === t && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ink" />}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 border-b border-line p-4 xl:flex-row xl:items-center">
                    <div className="relative flex-1">
                        <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                update('search', e.target.value);
                            }}
                            placeholder="Order number, email, name or phone"
                            className="input h-10 pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={paymentStatus} onChange={(v) => update('paymentStatus', v)} options={[{ value: '', label: 'Any payment' }, { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid (COD)' }, { value: 'pending', label: 'Pending' }, { value: 'refunded', label: 'Refunded' }, { value: 'failed', label: 'Failed' }]} />
                        <Select value={paymentMethod} onChange={(v) => update('paymentMethod', v)} options={[{ value: '', label: 'Any method' }, { value: 'card', label: 'Card' }, { value: 'cod', label: 'Cash on delivery' }]} />
                        <input type="date" value={from} onChange={(e) => update('from', e.target.value)} className="input h-10 w-auto" aria-label="From date" />
                        <span className="text-muted">–</span>
                        <input type="date" value={to} onChange={(e) => update('to', e.target.value)} className="input h-10 w-auto" aria-label="To date" />
                    </div>
                </div>

                <div className={cn('transition-opacity', isFetching && !isLoading && 'opacity-60')}>
                    <Table className="min-w-[900px]">
                        <thead>
                            <tr>
                                <Th>Order</Th>
                                <Th>Date</Th>
                                <Th>Customer</Th>
                                <Th>Items</Th>
                                <Th>Payment</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Total</Th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <SkeletonRows cols={7} />
                        ) : (
                            <tbody>
                                {items.map((o) => (
                                    <tr key={o._id} className="cursor-pointer hover:bg-soft/40">
                                        <Td>
                                            <Link to={`/admin/orders/${o._id}`} className="font-semibold hover:underline">{o.orderNumber}</Link>
                                            {o.stockIssue && <Badge tone="danger" className="ml-2">Stock issue</Badge>}
                                        </Td>
                                        <Td className="whitespace-nowrap text-muted">{formatDateTime(o.createdAt)}</Td>
                                        <Td>
                                            <p className="font-medium">{o.customerName}</p>
                                            <p className="text-xs text-muted">{o.email}</p>
                                        </Td>
                                        <Td className="text-muted">{o.itemCount}</Td>
                                        <Td>
                                            <div className="flex flex-col items-start gap-1">
                                                <PaymentBadge status={o.paymentStatus} />
                                                <span className="text-[11px] font-medium tracking-wide text-muted uppercase">{o.paymentMethod === 'cod' ? 'COD' : 'Card'}</span>
                                            </div>
                                        </Td>
                                        <Td><OrderStatusBadge status={o.status} /></Td>
                                        <Td className="text-right font-semibold tabular-nums">{money(o.total)}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </Table>
                    {!isLoading && !items.length && <Empty icon={LuShoppingBag} title="No orders found" text="Orders matching your filters will appear here." />}
                </div>
                {data?.pages > 1 && (
                    <div className="border-t border-line p-4">
                        <Pagination page={page} pages={data.pages} onChange={(p) => update('page', String(p))} />
                    </div>
                )}
            </div>
        </div>
    );
}
