import { useQuery } from '@tanstack/react-query';
import { LuLeaf, LuSparkles, LuHeadphones, LuArrowRight } from 'react-icons/lu';
import { get } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui';
import { useTitle } from '../hooks/useCommon';

export default function About() {
    const { settings } = useStore();
    useTitle('Our story');
    const { data: cats = [] } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories'), staleTime: 5 * 60 * 1000 });
    const { data: products } = useQuery({ queryKey: ['products', 'about'], queryFn: () => get('/products', { limit: 1 }) });
    const stats = [
        [products?.total ?? '—', 'Curated products'],
        [cats.length || '—', 'Categories'],
        ['4.8★', 'Average rating'],
        ['48h', 'Average dispatch'],
    ];
    return (
        <div className="container-x pt-10">
            <section className="grid items-end gap-10 lg:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Our story</p>
                    <h1 className="mt-3 text-5xl font-extrabold leading-[0.95] sm:text-7xl">Fewer, better things.</h1>
                </div>
                <p className="text-lg leading-relaxed text-muted">
                    {settings.storeName} started with a simple idea: shopping online should feel as considered as the products themselves. We hand-pick every item, test it, and only stock what we'd happily use every day.
                </p>
            </section>

            <section className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map(([v, l]) => (
                    <div key={l} className="card p-6">
                        <p className="font-display text-4xl font-bold">{v}</p>
                        <p className="mt-1 text-sm text-muted">{l}</p>
                    </div>
                ))}
            </section>

            <section className="mt-20 grid gap-6 md:grid-cols-3">
                {[
                    [LuSparkles, 'Curated, not cluttered', 'A tight edit of products that earn their place — so you spend less time scrolling and more time enjoying.'],
                    [LuLeaf, 'Made to last', 'We favour durable materials, repairable designs and brands that stand behind their work.'],
                    [LuHeadphones, 'People who care', 'Questions about sizing, specs or delivery? Our team replies within a business day, every day.'],
                ].map(([Icon, t, s]) => (
                    <div key={t} className="rounded-3xl bg-soft p-8">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface"><Icon className="h-5 w-5 text-accent" /></span>
                        <h3 className="mt-6 text-xl font-bold">{t}</h3>
                        <p className="mt-2 leading-relaxed text-muted">{s}</p>
                    </div>
                ))}
            </section>

            <section className="mt-20 rounded-[28px] bg-ink p-10 text-bg sm:p-16 dark:bg-surface dark:text-ink">
                <h2 className="max-w-2xl text-3xl font-bold sm:text-5xl">Ready to find your next favourite thing?</h2>
                <Button to="/shop" variant="accent" size="lg" className="mt-8">Start shopping <LuArrowRight className="h-5 w-5" /></Button>
            </section>
        </div>
    );
}
