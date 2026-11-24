import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LuArrowRight, LuHeart, LuMapPin, LuPackage } from 'react-icons/lu';
import { get } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Button, Empty, Skeleton } from '../../components/ui';
import { OrderStatusBadge } from '../../components/order';
import { formatDate } from '../../lib/utils';
import { useTitle } from '../../hooks/useCommon';

export function OrderRow({ o }) {
    const { money } = useStore();
    return (
        <Link to={`/account/orders/${o._id}`} className="flex items-center gap-4 p-4 transition hover:bg-soft/60 sm:p-5">
            <div className="flex -space-x-3">
                {o.items.slice(0, 3).map((i) => (
                    <img key={i.productId + (i.color || '') + (i.size || '')} src={i.image} alt="" className="h-12 w-12 rounded-xl border-2 border-surface bg-soft object-contain p-1" />
                ))}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-muted">{formatDate(o.createdAt)} · {o.itemCount} item{o.itemCount !== 1 && 's'}</p>
            </div>
            <OrderStatusBadge status={o.status} />
            <p className="hidden w-24 text-right text-sm font-bold sm:block">{money(o.total)}</p>
        </Link>
    );
}

export default function Overview() {
    const { profile } = useAuth();
    const { wishlist } = useStore();
    useTitle('My account');
    const { data, isLoading } = useQuery({ queryKey: ['my-orders', 1, ''], queryFn: () => get('/orders/mine', { limit: 5 }) });
    const stats = [
        [LuPackage, 'Orders', data?.total ?? '—', '/account/orders'],
        [LuHeart, 'Wishlist', wishlist.length, '/wishlist'],
        [LuMapPin, 'Addresses', profile?.addresses?.length ?? 0, '/account/addresses'],
    ];
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold">Hi, {profile?.name?.split(' ')[0] || 'there'} 👋</h1>
                <p className="mt-1 text-muted">Manage your orders, addresses and preferences.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map(([Icon, l, v, to]) => (
                    <Link key={l} to={to} className="card group p-5 transition hover:border-ink/30">
                        <Icon className="h-5 w-5 text-accent" />
                        <p className="mt-4 font-display text-3xl font-bold">{v}</p>
                        <p className="flex items-center justify-between text-sm text-muted">{l} <LuArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" /></p>
                    </Link>
                ))}
            </div>
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line p-5">
                    <h2 className="font-bold">Recent orders</h2>
                    <Button to="/account/orders" variant="link" size="sm">View all</Button>
                </div>
                {isLoading ? (
                    <div className="space-y-3 p-5">{[1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
                ) : data?.items?.length ? (
                    <div className="divide-y divide-line">{data.items.map((o) => <OrderRow key={o._id} o={o} />)}</div>
                ) : (
                    <Empty icon={LuPackage} title="No orders yet" text="When you place an order it will show up here." action={<Button to="/shop">Start shopping</Button>} />
                )}
            </div>
        </div>
    );
}
