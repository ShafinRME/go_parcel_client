import { useQuery } from '@tanstack/react-query';
import { get } from '../../lib/api';

export default function AuthShell({ title, subtitle, children }) {
    const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: () => get('/banners') });
    const b = banners[0];
    return (
        <div className="container-x py-10">
            <div className="grid overflow-hidden rounded-[28px] border border-line bg-surface lg:grid-cols-2">
                <div className="p-7 sm:p-12 lg:p-16">
                    <h1 className="text-4xl font-extrabold">{title}</h1>
                    {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                </div>
                <div className="relative hidden overflow-hidden bg-ink p-12 text-bg lg:block dark:bg-soft dark:text-ink">
                    <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
                    {b?.image && <img src={b.image} alt="" className="absolute inset-x-0 bottom-0 mx-auto h-[70%] object-contain drop-shadow-2xl" />}
                    <p className="relative max-w-sm font-display text-3xl font-bold leading-tight">Members get early access, faster checkout and order tracking in one place.</p>
                </div>
            </div>
        </div>
    );
}
