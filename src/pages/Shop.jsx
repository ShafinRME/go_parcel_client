import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LuSearchX, LuSlidersHorizontal, LuX } from 'react-icons/lu';
import { get } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { Button, Drawer, Empty, Pagination, Stars } from '../components/ui';
import { ProductGrid } from '../components/product/ProductCard';
import { useTitle } from '../hooks/useCommon';
import { cn } from '../lib/utils';

const SORTS = [
    ['newest', 'Newest'],
    ['popular', 'Best selling'],
    ['rating', 'Top rated'],
    ['price_asc', 'Price: low to high'],
    ['price_desc', 'Price: high to low'],
    ['discount', 'Biggest discount'],
];

const list = (v) => (v ? v.split(',').filter(Boolean) : []);

function Check({ checked, onChange, children, count }) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg py-1.5 text-sm">
            <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-[var(--ink)]" />
            <span className="flex-1">{children}</span>
            {count != null && <span className="text-xs text-muted">{count}</span>}
        </label>
    );
}

function Group({ title, children }) {
    return (
        <div className="border-b border-line py-5 first:pt-0">
            <p className="mb-3 text-sm font-bold">{title}</p>
            {children}
        </div>
    );
}

function PriceForm({ params, set, facets, sym }) {
    const [min, setMin] = useState(params.get('minPrice') || '');
    const [max, setMax] = useState(params.get('maxPrice') || '');
    return (
        <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                set({ minPrice: min, maxPrice: max });
            }}
        >
            <input className="input h-10" inputMode="decimal" placeholder={`${sym}${facets?.price?.min ?? 0}`} value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d.]/g, ''))} aria-label="Minimum price" />
            <span className="text-muted">–</span>
            <input className="input h-10" inputMode="decimal" placeholder={`${sym}${facets?.price?.max ?? ''}`} value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d.]/g, ''))} aria-label="Maximum price" />
            <Button type="submit" size="sm" variant="soft" className="h-10">Go</Button>
        </form>
    );
}

function Filters({ params, set, toggleList, categories, facets }) {
    const { settings } = useStore();
    const cats = list(params.get('category'));
    const brands = list(params.get('brand'));
    const sym = settings.currencySymbol || '$';

    return (
        <div>
            <Group title="Category">
                <div className="max-h-72 overflow-y-auto pr-1">
                    {categories.map((c) => (
                        <Check key={c._id} checked={cats.includes(c.slug)} onChange={() => toggleList('category', c.slug)} count={c.productCount}>
                            {c.name}
                        </Check>
                    ))}
                </div>
            </Group>
            <Group title="Price">
                <PriceForm key={`${params.get('minPrice')}-${params.get('maxPrice')}`} params={params} set={set} facets={facets} sym={sym} />
            </Group>
            <Group title="Rating">
                {[4, 3, 2].map((r) => (
                    <button key={r} onClick={() => set({ rating: params.get('rating') === String(r) ? '' : String(r) })} className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm', params.get('rating') === String(r) ? 'bg-soft font-semibold' : 'hover:bg-soft')}>
                        <Stars value={r} size="h-3.5 w-3.5" /> & up
                    </button>
                ))}
            </Group>
            <Group title="Availability">
                <Check checked={params.get('inStock') === 'true'} onChange={() => set({ inStock: params.get('inStock') === 'true' ? '' : 'true' })}>In stock only</Check>
                <Check checked={params.get('onSale') === 'true'} onChange={() => set({ onSale: params.get('onSale') === 'true' ? '' : 'true' })}>On sale</Check>
            </Group>
            {facets?.brands?.length > 0 && (
                <Group title="Brand">
                    <div className="max-h-64 overflow-y-auto pr-1">
                        {facets.brands.map((b) => (
                            <Check key={b.name} checked={brands.includes(b.name)} onChange={() => toggleList('brand', b.name)} count={b.count}>
                                {b.name}
                            </Check>
                        ))}
                    </div>
                </Group>
            )}
        </div>
    );
}

export default function Shop() {
    const [params, setParams] = useSearchParams();
    const [drawer, setDrawer] = useState(false);
    const page = Number(params.get('page')) || 1;
    const query = useMemo(() => Object.fromEntries([...params.entries()].filter(([, v]) => v)), [params]);

    const set = (patch, keepPage = false) => {
        const next = new URLSearchParams(params);
        Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        if (!keepPage) next.delete('page');
        setParams(next);
    };
    const toggleList = (key, value) => {
        const cur = list(params.get(key));
        set({ [key]: (cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]).join(',') });
    };

    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories'), staleTime: 5 * 60 * 1000 });
    const { data: facets } = useQuery({ queryKey: ['facets', params.get('category') || ''], queryFn: () => get('/products/facets', { category: params.get('category') || undefined }) });
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['products', 'shop', query],
        queryFn: () => get('/products', { limit: 12, ...query }),
        placeholderData: keepPreviousData,
    });

    const cats = list(params.get('category'));
    const single = cats.length === 1 ? categories.find((c) => c.slug === cats[0]) : null;
    const search = params.get('search');
    const title = search ? `Results for “${search}”` : single ? single.name : params.get('onSale') ? 'Deals' : 'Shop all';
    useTitle(title.replace(/[“”]/g, ''));

    const chips = [
        ...cats.map((c) => [`category`, c, categories.find((x) => x.slug === c)?.name || c]),
        ...list(params.get('brand')).map((b) => ['brand', b, b]),
        params.get('minPrice') && ['minPrice', '', `Min ${params.get('minPrice')}`],
        params.get('maxPrice') && ['maxPrice', '', `Max ${params.get('maxPrice')}`],
        params.get('rating') && ['rating', '', `${params.get('rating')}★ & up`],
        params.get('inStock') && ['inStock', '', 'In stock'],
        params.get('onSale') && ['onSale', '', 'On sale'],
        search && ['search', '', `“${search}”`],
    ].filter(Boolean);

    const filterProps = { params, set, toggleList, categories, facets };

    return (
        <div className="container-x pt-8">
            <div className="mb-8 border-b border-line pb-8">
                <p className="text-sm text-muted">Home / Shop{single ? ` / ${single.name}` : ''}</p>
                <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">{title}</h1>
                {single?.description && <p className="mt-2 max-w-xl text-muted">{single.description}</p>}
            </div>

            <div className="flex gap-10">
                <aside className="hidden w-64 shrink-0 lg:block">
                    <div className="sticky top-24">
                        <Filters {...filterProps} />
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                            <LuSlidersHorizontal className="h-4 w-4" /> Filters {chips.length > 0 && `(${chips.length})`}
                        </Button>
                        <p className="text-sm text-muted">
                            {isLoading ? 'Loading…' : `${data?.total ?? 0} products`}
                            {isFetching && !isLoading && ' · updating'}
                        </p>
                        <label className="ml-auto flex items-center gap-2 text-sm">
                            <span className="hidden text-muted sm:inline">Sort by</span>
                            <select value={params.get('sort') || 'newest'} onChange={(e) => set({ sort: e.target.value })} className="input h-9 w-auto pr-8 font-semibold">
                                {SORTS.map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {chips.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            {chips.map(([k, v, label]) => (
                                <button key={`${k}-${v}`} onClick={() => (v ? toggleList(k, v) : set({ [k]: '' }))} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-xs font-semibold hover:bg-line">
                                    {label} <LuX className="h-3 w-3" />
                                </button>
                            ))}
                            <button onClick={() => setParams(params.get('sort') ? { sort: params.get('sort') } : {})} className="text-xs font-semibold text-muted underline underline-offset-4 hover:text-ink">
                                Clear all
                            </button>
                        </div>
                    )}

                    {!isLoading && data?.items?.length === 0 ? (
                        <Empty icon={LuSearchX} title="No products match your filters" text="Try removing some filters or searching for something else." action={<Button onClick={() => setParams({})}>Reset filters</Button>} />
                    ) : (
                        <div className={cn('transition-opacity', isFetching && !isLoading && 'opacity-60')}>
                            <ProductGrid products={data?.items || []} loading={isLoading} count={12} className="xl:grid-cols-3 2xl:grid-cols-4" />
                        </div>
                    )}

                    <div className="mt-12">
                        <Pagination
                            page={page}
                            pages={data?.pages}
                            onChange={(p) => {
                                set({ page: String(p) }, true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                </div>
            </div>

            <Drawer open={drawer} onClose={() => setDrawer(false)} title="Filters" side="left" footer={<Button className="w-full" onClick={() => setDrawer(false)}>Show {data?.total ?? 0} products</Button>}>
                <div className="p-5">
                    <Filters {...filterProps} />
                </div>
            </Drawer>
        </div>
    );
}
