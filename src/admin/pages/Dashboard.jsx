import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LuArrowRight, LuDollarSign, LuInbox, LuReceipt, LuShoppingBag, LuStar, LuTriangleAlert, LuUserPlus } from 'react-icons/lu';
import { get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { cn, formatDate, ORDER_STATUS } from '../../lib/utils';
import { Badge, Skeleton } from '../../components/ui';
import { OrderStatusBadge, PageHeader, StatCard, Table, Td, Th } from '../components/shared';

const RANGES = [7, 30, 90];
const STATUS_COLORS = {
    pending: '#3b82f6', processing: '#6366f1', shipped: 'var(--accent)', out_for_delivery: '#f59e0b',
    delivered: 'var(--success)', cancelled: 'var(--danger)', returned: '#9ca3af', awaiting_payment: '#d4d4d4',
};

function ChartTooltip({ active, payload, label, money }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lg">
            <p className="mb-1 font-semibold">{formatDate(label)}</p>
            <p className="text-muted">Revenue: <span className="font-semibold text-ink">{money(payload[0]?.payload?.revenue)}</span></p>
            <p className="text-muted">Orders: <span className="font-semibold text-ink">{payload[0]?.payload?.orders}</span></p>
        </div>
    );
}

export default function Dashboard() {
    const [days, setDays] = useState(30);
    const { money } = useStore();
    const { profile } = useAuth();
    const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats', days], queryFn: () => get('/admin/stats', { days }) });

    const k = data?.kpis;
    const statusTotal = (data?.byStatus || []).reduce((s, x) => s + x.count, 0) || 1;
    const catMax = Math.max(1, ...(data?.byCategory || []).map((c) => c.revenue));

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back${profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}`}
                description="Here's what's happening in your store."
                actions={
                    <div className="inline-flex rounded-xl border border-line bg-surface p-1">
                        {RANGES.map((r) => (
                            <button key={r} onClick={() => setDays(r)} className={cn('h-8 rounded-lg px-3 text-sm font-semibold transition', days === r ? 'bg-ink text-bg' : 'text-muted hover:text-ink')}>
                                {r}d
                            </button>
                        ))}
                    </div>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[132px]" />)
                ) : (
                    <>
                        <StatCard label="Revenue" value={money(k?.revenue.value)} change={k?.revenue.change} icon={LuDollarSign} hint={`vs previous ${days}d`} />
                        <StatCard label="Orders" value={k?.orders.value ?? 0} change={k?.orders.change} icon={LuShoppingBag} hint={`vs previous ${days}d`} />
                        <StatCard label="Avg. order value" value={money(k?.avgOrder.value)} icon={LuReceipt} hint="paid orders" />
                        <StatCard label="New customers" value={k?.newCustomers.value ?? 0} change={k?.newCustomers.change} icon={LuUserPlus} hint={`${k?.totalCustomers ?? 0} total`} />
                    </>
                )}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <div className="card p-5 xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold">Revenue</h3>
                            <p className="text-xs text-muted">Last {days} days, excluding cancelled orders</p>
                        </div>
                    </div>
                    <div className="h-72">
                        {isLoading ? (
                            <Skeleton className="h-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.series || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { month: 'short', day: 'numeric' })} tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} minTickGap={24} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={50} />
                                    <Tooltip content={<ChartTooltip money={money} />} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#rev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card p-5">
                    <h3 className="font-bold">Orders by status</h3>
                    <p className="mb-4 text-xs text-muted">All time</p>
                    {isLoading ? (
                        <Skeleton className="h-56" />
                    ) : (
                        <>
                            <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-soft">
                                {(data?.byStatus || []).map((s) => (
                                    <span key={s.status} style={{ width: `${(s.count / statusTotal) * 100}%`, background: STATUS_COLORS[s.status] || '#999' }} />
                                ))}
                            </div>
                            <ul className="space-y-2.5">
                                {(data?.byStatus || []).sort((a, b) => b.count - a.count).map((s) => (
                                    <li key={s.status} className="flex items-center gap-2.5 text-sm">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] || '#999' }} />
                                        <Link to={`/admin/orders?status=${s.status}`} className="flex-1 hover:underline">{ORDER_STATUS[s.status]?.label || s.status}</Link>
                                        <span className="font-semibold tabular-nums">{s.count}</span>
                                    </li>
                                ))}
                                {!data?.byStatus?.length && <p className="text-sm text-muted">No orders yet.</p>}
                            </ul>
                        </>
                    )}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
                        <Link to="/admin/reviews" className="rounded-xl bg-soft p-3 transition hover:bg-line">
                            <LuStar className="mb-1 h-4 w-4 text-amber-500" />
                            <p className="text-lg font-bold">{k?.pendingReviews ?? '—'}</p>
                            <p className="text-xs text-muted">New reviews</p>
                        </Link>
                        <Link to="/admin/messages" className="rounded-xl bg-soft p-3 transition hover:bg-line">
                            <LuInbox className="mb-1 h-4 w-4 text-accent" />
                            <p className="text-lg font-bold">{k?.newMessages ?? '—'}</p>
                            <p className="text-xs text-muted">Unread messages</p>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="card p-5">
                    <h3 className="mb-4 font-bold">Top products</h3>
                    {isLoading ? (
                        <Skeleton className="h-60" />
                    ) : data?.topProducts?.length ? (
                        <ul className="space-y-3">
                            {data.topProducts.map((p, i) => (
                                <li key={p._id} className="flex items-center gap-3">
                                    <span className="w-4 text-xs font-bold text-muted">{i + 1}</span>
                                    <img src={p.image} alt="" className="h-11 w-11 rounded-lg bg-soft object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <Link to={`/admin/products/${p._id}`} className="block truncate text-sm font-semibold hover:underline">{p.title}</Link>
                                        <p className="text-xs text-muted">{p.qty} sold</p>
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums">{money(p.revenue)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted">No sales in this period yet.</p>
                    )}
                </div>
                <div className="card p-5">
                    <h3 className="mb-4 font-bold">Revenue by category</h3>
                    {isLoading ? (
                        <Skeleton className="h-60" />
                    ) : data?.byCategory?.length ? (
                        <ul className="space-y-3.5">
                            {data.byCategory.map((c) => (
                                <li key={c.category}>
                                    <div className="mb-1 flex justify-between text-sm">
                                        <span className="font-medium capitalize">{c.category.replace(/-/g, ' ')}</span>
                                        <span className="font-semibold tabular-nums">{money(c.revenue)}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-soft">
                                        <div className="h-full rounded-full bg-ink" style={{ width: `${(c.revenue / catMax) * 100}%` }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted">No sales in this period yet.</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <div className="card overflow-hidden xl:col-span-2">
                    <div className="flex items-center justify-between p-5">
                        <h3 className="font-bold">Recent orders</h3>
                        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
                            View all <LuArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Order</Th>
                                <Th>Customer</Th>
                                <Th>Date</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Total</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.recentOrders || []).map((o) => (
                                <tr key={o._id} className="hover:bg-soft/40">
                                    <Td><Link to={`/admin/orders/${o._id}`} className="font-semibold hover:underline">{o.orderNumber}</Link></Td>
                                    <Td><p className="font-medium">{o.customerName}</p><p className="text-xs text-muted">{o.email}</p></Td>
                                    <Td className="text-muted">{formatDate(o.createdAt)}</Td>
                                    <Td><OrderStatusBadge status={o.status} /></Td>
                                    <Td className="text-right font-semibold tabular-nums">{money(o.total)}</Td>
                                </tr>
                            ))}
                            {!isLoading && !data?.recentOrders?.length && (
                                <tr><Td colSpan={5} className="py-10 text-center text-muted">No orders yet.</Td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
                <div className="card overflow-hidden">
                    <div className="flex items-center gap-2 p-5">
                        <LuTriangleAlert className="h-4.5 w-4.5 text-warning" />
                        <h3 className="font-bold">Low stock</h3>
                    </div>
                    <ul className="divide-y divide-line border-t border-line">
                        {(data?.lowStock || []).map((p) => (
                            <li key={p._id}>
                                <Link to={`/admin/products/${p._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-soft/40">
                                    <img src={p.images?.[0]} alt="" className="h-9 w-9 rounded-lg bg-soft object-cover" />
                                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                                    <Badge tone={p.stock === 0 ? 'danger' : 'warning'}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</Badge>
                                </Link>
                            </li>
                        ))}
                        {!isLoading && !data?.lowStock?.length && <li className="px-5 py-8 text-center text-sm text-muted">All products are well stocked.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}
