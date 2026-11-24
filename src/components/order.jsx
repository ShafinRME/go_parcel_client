import { LuCheck, LuX } from 'react-icons/lu';
import { Badge } from './ui';
import { cn, formatDateTime, ORDER_STATUS, PAYMENT_STATUS, STATUS_STEPS } from '../lib/utils';

export const OrderStatusBadge = ({ status }) => <Badge tone={ORDER_STATUS[status]?.tone || 'neutral'}>{ORDER_STATUS[status]?.label || status}</Badge>;
export const PaymentBadge = ({ status }) => <Badge tone={PAYMENT_STATUS[status]?.tone || 'neutral'}>{PAYMENT_STATUS[status]?.label || status}</Badge>;

export function OrderProgress({ status }) {
    if (['cancelled', 'returned', 'awaiting_payment'].includes(status)) return null;
    const idx = STATUS_STEPS.indexOf(status);
    return (
        <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
                <div key={s} className={cn('flex items-center', i < STATUS_STEPS.length - 1 && 'flex-1')}>
                    <div className="flex flex-col items-center gap-2">
                        <span className={cn('grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold transition', i <= idx ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-muted')}>
                            {i < idx || status === 'delivered' ? <LuCheck className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className={cn('hidden whitespace-nowrap text-xs font-semibold sm:block', i <= idx ? 'text-ink' : 'text-muted')}>{ORDER_STATUS[s].label}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={cn('mx-2 mb-0 h-0.5 flex-1 rounded sm:mb-6', i < idx ? 'bg-ink' : 'bg-line')} />}
                </div>
            ))}
        </div>
    );
}

export function OrderTimeline({ timeline = [] }) {
    const items = [...timeline].reverse();
    return (
        <ol className="relative space-y-5 border-l border-line pl-6">
            {items.map((t, i) => (
                <li key={i} className="relative">
                    <span className={cn('absolute -left-[31px] top-0.5 grid h-4 w-4 place-items-center rounded-full ring-4 ring-surface', i === 0 ? (t.status === 'cancelled' ? 'bg-danger' : 'bg-accent') : 'bg-line')}>
                        {t.status === 'cancelled' && <LuX className="h-2.5 w-2.5 text-white" />}
                    </span>
                    <p className="text-sm font-semibold">{t.label}</p>
                    {t.note && <p className="text-sm text-muted">{t.note}</p>}
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(t.at)}</p>
                </li>
            ))}
        </ol>
    );
}
