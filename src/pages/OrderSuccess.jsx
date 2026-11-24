import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuCircleCheck, LuPackage } from 'react-icons/lu';
import { get } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { Button, PageLoader } from '../components/ui';
import { useTitle } from '../hooks/useCommon';

export default function OrderSuccess() {
    const { id } = useParams();
    const { money } = useStore();
    const { data: o, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => get(`/orders/${id}`) });
    useTitle('Thank you');
    if (isLoading || !o) return <PageLoader />;
    return (
        <div className="container-x max-w-2xl pt-12 text-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15">
                <LuCircleCheck className="h-10 w-10 text-success" />
            </motion.div>
            <h1 className="mt-6 text-4xl font-extrabold">Thank you for your order!</h1>
            <p className="mt-3 text-muted">
                Order <b className="text-ink">{o.orderNumber}</b> is confirmed. We've sent the details to {o.email}.
            </p>
            <div className="card mt-8 p-6 text-left">
                <ul className="divide-y divide-line">
                    {o.items.map((l) => (
                        <li key={`${l.productId}-${l.color}-${l.size}`} className="flex items-center gap-3 py-3">
                            <img src={l.image} alt="" className="h-14 w-14 rounded-xl bg-soft object-contain p-1" />
                            <span className="flex-1 text-sm font-semibold">{l.title} <span className="font-normal text-muted">× {l.qty}</span></span>
                            <span className="text-sm font-semibold">{money(l.lineTotal)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-line pt-4">
                    <span className="text-muted">{o.paymentMethod === 'cod' ? 'Pay on delivery' : 'Paid by card'}</span>
                    <span className="text-xl font-bold">{money(o.total)}</span>
                </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button to={`/account/orders/${o._id}`} size="lg"><LuPackage className="h-4 w-4" /> Track this order</Button>
                <Button to="/shop" variant="outline" size="lg">Continue shopping</Button>
            </div>
        </div>
    );
}
