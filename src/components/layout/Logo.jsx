import { Link } from 'react-router';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export default function Logo({ className, to = '/' }) {
    const { settings } = useStore();
    const name = settings.storeName || 'Lumen & Co.';
    return (
        <Link to={to} className={cn('group inline-flex items-center gap-2', className)} aria-label={`${name} home`}>
            <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-ink">
                <span className="h-4 w-4 rounded-full border-[3px] border-accent transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-bg" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">{name}</span>
        </Link>
    );
}
