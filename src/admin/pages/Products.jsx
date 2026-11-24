import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuPackage, LuPencil, LuPlus, LuSearch, LuStar, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { useDebounce } from '../../hooks/useCommon';
import { cn } from '../../lib/utils';
import { Badge, Button, Confirm, Empty, Pagination } from '../../components/ui';
import { PageHeader, Select, SkeletonRows, Table, Td, Th } from '../components/shared';

export default function Products() {
    const { money, settings } = useStore();
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [sp] = useSearchParams();
    const [category, setCategory] = useState(sp.get('category') || '');
    const [status, setStatus] = useState('');
    const [stock, setStock] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const [bulkDelete, setBulkDelete] = useState(false);
    const q = useDebounce(search, 350);

    const params = { search: q, category, status, stock, sort, page, limit: 15 };
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['admin', 'products', params],
        queryFn: () => get('/admin/products', params),
        placeholderData: keepPreviousData,
    });
    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories') });
    const catName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ['admin', 'products'] });
        qc.invalidateQueries({ queryKey: ['products'] });
    };

    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/products/${id}`),
        onSuccess: () => {
            toast.success('Product deleted');
            setToDelete(null);
            refresh();
        },
        onError: (e) => toast.error(errorMessage(e)),
    });
    const bulk = useMutation({
        mutationFn: (action) => api.post('/admin/products/bulk', { ids: selected, action }),
        onSuccess: (r) => {
            toast.success(r.data.message);
            setSelected([]);
            setBulkDelete(false);
            refresh();
        },
        onError: (e) => toast.error(errorMessage(e)),
    });
    const quick = useMutation({
        // bulk endpoint only $sets the status field, so other fields are never touched
        mutationFn: ({ id, action }) => api.post('/admin/products/bulk', { ids: [id], action }),
        onSuccess: refresh,
        onError: (e) => toast.error(errorMessage(e)),
    });

    const items = data?.items || [];
    const allChecked = items.length > 0 && items.every((p) => selected.includes(p._id));
    const set = (fn) => (v) => {
        fn(v);
        setPage(1);
    };

    return (
        <div>
            <PageHeader
                title="Products"
                description={data ? `${data.total} products in your catalog` : 'Manage your catalog'}
                actions={<Button to="/admin/products/new"><LuPlus className="h-4 w-4" /> New product</Button>}
            />

            <div className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title, SKU or brand" className="input h-10 pl-9" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select value={category} onChange={set(setCategory)} options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]} />
                        <Select value={status} onChange={set(setStatus)} options={[{ value: '', label: 'Any status' }, { value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }]} />
                        <Select value={stock} onChange={set(setStock)} options={[{ value: '', label: 'Any stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} />
                        <Select value={sort} onChange={set(setSort)} options={[{ value: 'newest', label: 'Newest' }, { value: 'title', label: 'Title A–Z' }, { value: 'price', label: 'Price high–low' }, { value: 'stock', label: 'Stock low–high' }, { value: 'sales', label: 'Best selling' }]} />
                    </div>
                </div>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-soft/60 px-4 py-2.5 text-sm">
                        <span className="mr-2 font-semibold">{selected.length} selected</span>
                        <Button size="sm" variant="outline" onClick={() => bulk.mutate('activate')}>Activate</Button>
                        <Button size="sm" variant="outline" onClick={() => bulk.mutate('draft')}>Set draft</Button>
                        <Button size="sm" variant="outline" onClick={() => bulk.mutate('feature')}>Feature</Button>
                        <Button size="sm" variant="outline" onClick={() => bulk.mutate('unfeature')}>Unfeature</Button>
                        <Button size="sm" variant="danger" onClick={() => setBulkDelete(true)}>Delete</Button>
                        <button onClick={() => setSelected([])} className="ml-auto text-xs font-semibold text-muted hover:text-ink">Clear</button>
                    </div>
                )}

                <div className={cn('transition-opacity', isFetching && !isLoading && 'opacity-60')}>
                    <Table className="min-w-[860px]">
                        <thead>
                            <tr>
                                <Th className="w-10">
                                    <input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? selected.filter((id) => !items.some((p) => p._id === id)) : [...new Set([...selected, ...items.map((p) => p._id)])])} className="h-4 w-4 accent-[var(--ink)]" aria-label="Select all" />
                                </Th>
                                <Th>Product</Th>
                                <Th>Category</Th>
                                <Th>Price</Th>
                                <Th>Stock</Th>
                                <Th>Sold</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <SkeletonRows cols={8} />
                        ) : (
                            <tbody>
                                {items.map((p) => {
                                    const low = p.stock > 0 && p.stock <= (settings.lowStockThreshold ?? 10);
                                    return (
                                        <tr key={p._id} className={cn('hover:bg-soft/40', selected.includes(p._id) && 'bg-soft/50')}>
                                            <Td>
                                                <input type="checkbox" checked={selected.includes(p._id)} onChange={() => setSelected((s) => (s.includes(p._id) ? s.filter((x) => x !== p._id) : [...s, p._id]))} className="h-4 w-4 accent-[var(--ink)]" aria-label={`Select ${p.title}`} />
                                            </Td>
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <img src={p.images?.[0]} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-soft object-cover" />
                                                    <div className="min-w-0">
                                                        <Link to={`/admin/products/${p._id}`} className="flex items-center gap-1.5 font-semibold hover:underline">
                                                            <span className="max-w-[260px] truncate">{p.title}</span>
                                                            {p.featured && <LuStar className="h-3.5 w-3.5 shrink-0 text-amber-500" fill="currentColor" />}
                                                        </Link>
                                                        <p className="text-xs text-muted">{p.sku || '—'}{p.brand ? ` · ${p.brand}` : ''}</p>
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td className="text-muted">{catName(p.category)}</Td>
                                            <Td>
                                                <p className="font-semibold tabular-nums">{money(p.price)}</p>
                                                {p.compareAtPrice > p.price && <p className="text-xs text-muted line-through">{money(p.compareAtPrice)}</p>}
                                            </Td>
                                            <Td>
                                                <Badge tone={p.stock === 0 ? 'danger' : low ? 'warning' : 'neutral'}>{p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}</Badge>
                                            </Td>
                                            <Td className="tabular-nums text-muted">{p.soldCount || 0}</Td>
                                            <Td>
                                                <button
                                                    onClick={() => quick.mutate({ id: p._id, action: p.status === 'active' ? 'draft' : 'activate' })}
                                                    title="Click to toggle"
                                                    className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition', p.status === 'active' ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-soft text-muted hover:bg-line')}
                                                >
                                                    <span className={cn('h-1.5 w-1.5 rounded-full', p.status === 'active' ? 'bg-success' : 'bg-muted')} />
                                                    {p.status === 'active' ? 'Active' : 'Draft'}
                                                </button>
                                            </Td>
                                            <Td className="text-right">
                                                <div className="inline-flex gap-1">
                                                    <Button to={`/admin/products/${p._id}`} variant="ghost" size="iconSm" aria-label="Edit"><LuPencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="iconSm" onClick={() => setToDelete(p)} aria-label="Delete" className="hover:!bg-danger/10 hover:!text-danger"><LuTrash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        )}
                    </Table>
                    {!isLoading && !items.length && (
                        <Empty icon={LuPackage} title="No products found" text="Try a different search or filter, or add your first product." action={<Button to="/admin/products/new"><LuPlus className="h-4 w-4" /> New product</Button>} />
                    )}
                </div>
                {data?.pages > 1 && (
                    <div className="border-t border-line p-4">
                        <Pagination page={page} pages={data.pages} onChange={setPage} />
                    </div>
                )}
            </div>

            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title="Delete product?" message={`"${toDelete?.title}" and its reviews will be permanently removed.`} confirmText="Delete" />
            <Confirm open={bulkDelete} onClose={() => setBulkDelete(false)} onConfirm={() => bulk.mutate('delete')} loading={bulk.isPending} title={`Delete ${selected.length} products?`} message="This cannot be undone." confirmText="Delete all" />
        </div>
    );
}
