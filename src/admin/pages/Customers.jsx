import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuBan, LuMail, LuPhone, LuSearch, LuShield, LuUserCheck, LuUsers } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useCommon';
import { cn, formatDate, initials } from '../../lib/utils';
import { Badge, Button, Confirm, Drawer, Empty, Pagination, Spinner } from '../../components/ui';
import { OrderStatusBadge, PageHeader, Select, SkeletonRows, Table, Td, Th } from '../components/shared';

const Avatar = ({ u, size = 'h-9 w-9' }) =>
    u.photo ? (
        <img src={u.photo} alt="" className={cn(size, 'rounded-full object-cover')} referrerPolicy="no-referrer" />
    ) : (
        <span className={cn(size, 'grid shrink-0 place-items-center rounded-full bg-soft text-xs font-bold')}>{initials(u.name || u.email)}</span>
    );

export default function Customers() {
    const { money } = useStore();
    const { profile } = useAuth();
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [openId, setOpenId] = useState(null);
    const [action, setAction] = useState(null); // { user, body, title, message }
    const q = useDebounce(search, 350);

    const params = { search: q, role, status, page, limit: 15 };
    const { data, isLoading, isFetching } = useQuery({ queryKey: ['admin', 'users', params], queryFn: () => get('/admin/users', params), placeholderData: keepPreviousData });
    const { data: detail, isLoading: detailLoading } = useQuery({ queryKey: ['admin', 'user', openId], queryFn: () => get(`/admin/users/${openId}`), enabled: !!openId });

    const mut = useMutation({
        mutationFn: ({ user, body }) => api.patch(`/admin/users/${user._id}`, body),
        onSuccess: () => {
            toast.success('Customer updated');
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
            qc.invalidateQueries({ queryKey: ['admin', 'user'] });
            setAction(null);
        },
        onError: (e) => {
            toast.error(errorMessage(e));
            setAction(null);
        },
    });

    const ask = (user, kind) => {
        const map = {
            admin: { body: { role: 'admin' }, title: 'Make this user an admin?', message: `${user.email} will get full access to the admin dashboard.`, tone: 'primary', confirmText: 'Make admin' },
            customer: { body: { role: 'customer' }, title: 'Remove admin access?', message: `${user.email} will become a regular customer.`, tone: 'danger', confirmText: 'Remove access' },
            block: { body: { status: 'blocked' }, title: 'Block this account?', message: `${user.email} will be signed out and unable to log in or place orders.`, tone: 'danger', confirmText: 'Block' },
            unblock: { body: { status: 'active' }, title: 'Unblock this account?', message: `${user.email} will be able to sign in again.`, tone: 'primary', confirmText: 'Unblock' },
        };
        setAction({ user, ...map[kind] });
    };

    const renderActions = (u) => {
        if (u.email === profile?.email) return <span className="text-xs text-muted">You</span>;
        return (
            <div className="flex flex-wrap gap-2">
                {u.role === 'admin' ? (
                    <Button size="sm" variant="outline" onClick={() => ask(u, 'customer')}>Remove admin</Button>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => ask(u, 'admin')}><LuShield className="h-3.5 w-3.5" /> Make admin</Button>
                )}
                {u.status === 'blocked' ? (
                    <Button size="sm" variant="outline" onClick={() => ask(u, 'unblock')}><LuUserCheck className="h-3.5 w-3.5" /> Unblock</Button>
                ) : (
                    <Button size="sm" variant="outline" className="text-danger" onClick={() => ask(u, 'block')}><LuBan className="h-3.5 w-3.5" /> Block</Button>
                )}
            </div>
        );
    };

    const items = data?.items || [];

    return (
        <div>
            <PageHeader title="Customers" description={data ? `${data.total} accounts` : 'Everyone who has signed up'} />
            <div className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email or phone" className="input h-10 pl-9" />
                    </div>
                    <div className="flex gap-2">
                        <Select value={role} onChange={(v) => { setRole(v); setPage(1); }} options={[{ value: '', label: 'All roles' }, { value: 'customer', label: 'Customers' }, { value: 'admin', label: 'Admins' }]} />
                        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: '', label: 'Any status' }, { value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }]} />
                    </div>
                </div>
                <div className={cn('transition-opacity', isFetching && !isLoading && 'opacity-60')}>
                    <Table className="min-w-[820px]">
                        <thead>
                            <tr>
                                <Th>Customer</Th>
                                <Th>Role</Th>
                                <Th>Joined</Th>
                                <Th>Orders</Th>
                                <Th>Total spent</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <SkeletonRows cols={6} />
                        ) : (
                            <tbody>
                                {items.map((u) => (
                                    <tr key={u._id} onClick={() => setOpenId(u._id)} className="cursor-pointer hover:bg-soft/40">
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <Avatar u={u} />
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{u.name || '—'}</p>
                                                    <p className="truncate text-xs text-muted">{u.email}</p>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>{u.role === 'admin' ? <Badge tone="dark"><LuShield className="h-3 w-3" /> Admin</Badge> : <Badge>Customer</Badge>}</Td>
                                        <Td className="text-muted">{formatDate(u.createdAt)}</Td>
                                        <Td className="tabular-nums">{u.orderCount}</Td>
                                        <Td className="font-semibold tabular-nums">{money(u.totalSpent)}</Td>
                                        <Td>{u.status === 'blocked' ? <Badge tone="danger">Blocked</Badge> : <Badge tone="success">Active</Badge>}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </Table>
                    {!isLoading && !items.length && <Empty icon={LuUsers} title="No customers found" text="Try a different search." />}
                </div>
                {data?.pages > 1 && (
                    <div className="border-t border-line p-4">
                        <Pagination page={page} pages={data.pages} onChange={setPage} />
                    </div>
                )}
            </div>

            <Drawer open={!!openId} onClose={() => setOpenId(null)} title="Customer details" width="max-w-lg">
                {detailLoading || !detail ? (
                    <div className="grid h-40 place-items-center"><Spinner /></div>
                ) : (
                    <div className="space-y-6 p-5">
                        <div className="flex items-center gap-4">
                            <Avatar u={detail} size="h-14 w-14" />
                            <div className="min-w-0">
                                <p className="truncate text-lg font-bold">{detail.name || '—'}</p>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                    {detail.role === 'admin' ? <Badge tone="dark">Admin</Badge> : <Badge>Customer</Badge>}
                                    {detail.status === 'blocked' ? <Badge tone="danger">Blocked</Badge> : <Badge tone="success">Active</Badge>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 text-sm">
                            <a href={`mailto:${detail.email}`} className="flex items-center gap-2 text-muted hover:text-ink"><LuMail className="h-4 w-4" /> {detail.email}</a>
                            {detail.phone && <p className="flex items-center gap-2 text-muted"><LuPhone className="h-4 w-4" /> {detail.phone}</p>}
                            <p className="text-xs text-muted">Joined {formatDate(detail.createdAt)} · Last seen {formatDate(detail.lastLoginAt)}</p>
                        </div>
                        {renderActions(detail)}
                        {detail.addresses?.length > 0 && (
                            <div>
                                <p className="label">Addresses</p>
                                <div className="space-y-2">
                                    {detail.addresses.map((a) => (
                                        <div key={a._id} className="rounded-xl border border-line p-3 text-sm">
                                            <p className="font-semibold">{a.label} {a.isDefault && <Badge className="ml-1">Default</Badge>}</p>
                                            <p className="text-muted">{a.line1}, {a.city} {a.postalCode}, {a.country}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="label">Recent orders</p>
                            {detail.orders?.length ? (
                                <ul className="divide-y divide-line rounded-xl border border-line">
                                    {detail.orders.map((o) => (
                                        <li key={o._id}>
                                            <Link to={`/admin/orders/${o._id}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-soft/50">
                                                <span>
                                                    <span className="font-semibold">{o.orderNumber}</span>
                                                    <span className="block text-xs text-muted">{formatDate(o.createdAt)}</span>
                                                </span>
                                                <OrderStatusBadge status={o.status} />
                                                <span className="font-semibold tabular-nums">{money(o.total)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted">No orders yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            <Confirm
                open={!!action}
                onClose={() => setAction(null)}
                onConfirm={() => mut.mutate(action)}
                loading={mut.isPending}
                title={action?.title}
                message={action?.message}
                confirmText={action?.confirmText}
                tone={action?.tone}
            />
        </div>
    );
}
