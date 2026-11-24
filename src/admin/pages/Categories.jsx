import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuFolderTree, LuPencil, LuPlus, LuStar, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { Button, Confirm, Empty, Field, Modal, Skeleton, Toggle } from '../../components/ui';
import { fieldErrors, PageHeader, SingleImageInput } from '../components/shared';

const EMPTY = { name: '', slug: '', description: '', image: '', featured: false, order: 0 };

export default function Categories() {
    const qc = useQueryClient();
    const { data: cats = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories') });
    const [editing, setEditing] = useState(null); // null | {} (new) | category
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [toDelete, setToDelete] = useState(null);

    const open = (c) => {
        setEditing(c || {});
        setErrors({});
        setForm(c ? { name: c.name, slug: c.slug, description: c.description || '', image: c.image || '', featured: !!c.featured, order: c.order || 0 } : EMPTY);
    };
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

    const save = useMutation({
        mutationFn: () => {
            const body = { ...form, order: Number(form.order) || 0, slug: form.slug.trim() || undefined };
            return editing?._id ? api.patch(`/admin/categories/${editing._id}`, body) : api.post('/admin/categories', body);
        },
        onSuccess: () => {
            toast.success(editing?._id ? 'Category updated' : 'Category created');
            qc.invalidateQueries({ queryKey: ['categories'] });
            setEditing(null);
        },
        onError: (e) => {
            setErrors(fieldErrors(e));
            toast.error(errorMessage(e));
        },
    });
    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            toast.success('Category deleted');
            qc.invalidateQueries({ queryKey: ['categories'] });
            setToDelete(null);
        },
        onError: (e) => {
            toast.error(errorMessage(e));
            setToDelete(null);
        },
    });

    return (
        <div>
            <PageHeader title="Categories" description="Organise products into collections shown across the store." actions={<Button onClick={() => open(null)}><LuPlus className="h-4 w-4" /> New category</Button>} />

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-60" />)}
                </div>
            ) : cats.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {cats.map((c) => (
                        <div key={c._id} className="card group overflow-hidden">
                            <div className="relative aspect-[4/3] bg-soft">
                                {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
                                {c.featured && (
                                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-bg">
                                        <LuStar className="h-3 w-3" fill="currentColor" /> Featured
                                    </span>
                                )}
                                <div className="absolute top-3 right-3 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                    <button onClick={() => open(c)} className="grid h-8 w-8 place-items-center rounded-full bg-surface shadow" aria-label="Edit"><LuPencil className="h-4 w-4" /></button>
                                    <button onClick={() => setToDelete(c)} className="grid h-8 w-8 place-items-center rounded-full bg-surface text-danger shadow" aria-label="Delete"><LuTrash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold">{c.name}</h3>
                                    <span className="text-xs text-muted">#{c.order ?? 0}</span>
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-sm text-muted">{c.description || '—'}</p>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <Link to={`/admin/products?category=${c.slug}`} className="font-semibold hover:underline">{c.productCount} products</Link>
                                    <span className="font-mono text-muted">/{c.slug}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card"><Empty icon={LuFolderTree} title="No categories yet" text="Create your first category to start organising products." action={<Button onClick={() => open(null)}>New category</Button>} /></div>
            )}

            <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit category' : 'New category'}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save.mutate();
                    }}
                    className="space-y-4"
                >
                    <SingleImageInput value={form.image} onChange={set('image')} aspect="aspect-[16/9]" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name" value={form.name} onChange={set('name')} error={errors.name} required />
                        <Field label="Slug" value={form.slug} onChange={set('slug')} error={errors.slug} placeholder="auto" hint={editing?._id ? 'Changing it updates all its products' : undefined} />
                    </div>
                    <Field label="Description" value={form.description} onChange={set('description')} error={errors.description} />
                    <div className="grid items-end gap-4 sm:grid-cols-2">
                        <Field label="Sort order" type="number" min="0" value={form.order} onChange={set('order')} />
                        <div className="pb-2"><Toggle checked={form.featured} onChange={set('featured')} label="Featured" description="Highlight on home page" /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button type="submit" loading={save.isPending}>Save</Button>
                    </div>
                </form>
            </Modal>

            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title="Delete category?" message={toDelete?.productCount ? `"${toDelete.name}" still has ${toDelete.productCount} products. Move them first.` : `"${toDelete?.name}" will be removed.`} confirmText="Delete" />
        </div>
    );
}
