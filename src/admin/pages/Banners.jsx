import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowRight, LuImage, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { cn } from '../../lib/utils';
import { Badge, Button, Confirm, Empty, Field, Modal, Skeleton, Toggle } from '../../components/ui';
import { fieldErrors, PageHeader, SingleImageInput } from '../components/shared';

const EMPTY = { eyebrow: '', title: '', subtitle: '', image: '', ctaText: 'Shop now', ctaLink: '/shop', theme: 'dark', active: true, order: 0 };

function BannerPreview({ b, compact }) {
    const dark = b.theme !== 'light';
    return (
        <div className={cn('relative overflow-hidden rounded-xl bg-soft', compact ? 'aspect-[21/9]' : 'aspect-[16/7]')}>
            {b.image && <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <div className={cn('absolute inset-0', dark ? 'bg-gradient-to-r from-black/75 via-black/40 to-transparent' : 'bg-gradient-to-r from-white/85 via-white/50 to-transparent')} />
            <div className={cn('relative flex h-full max-w-[70%] flex-col justify-center p-5', dark ? 'text-white' : 'text-neutral-900')}>
                {b.eyebrow && <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] uppercase opacity-80">{b.eyebrow}</p>}
                <p className={cn('font-display leading-tight font-bold', compact ? 'text-lg' : 'text-2xl')}>{b.title || 'Banner title'}</p>
                {!compact && b.subtitle && <p className="mt-1 line-clamp-2 text-xs opacity-80">{b.subtitle}</p>}
                <span className={cn('mt-3 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', dark ? 'bg-white text-black' : 'bg-black text-white')}>
                    {b.ctaText || 'Shop now'} <LuArrowRight className="h-3 w-3" />
                </span>
            </div>
        </div>
    );
}

export default function Banners() {
    const qc = useQueryClient();
    const { data: banners = [], isLoading } = useQuery({ queryKey: ['admin', 'banners'], queryFn: () => get('/admin/banners') });
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [toDelete, setToDelete] = useState(null);

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
        qc.invalidateQueries({ queryKey: ['banners'] });
    };
    const open = (b) => {
        setErrors({});
        setEditing(b || {});
        setForm(b ? { ...EMPTY, ...b } : { ...EMPTY, order: banners.length });
    };
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
    const bodyOf = (f) => {
        const { eyebrow, title, subtitle, image, ctaText, ctaLink, theme, active, order } = f;
        return { eyebrow, title, subtitle, image, ctaText, ctaLink, theme, active, order: Number(order) || 0 };
    };

    const save = useMutation({
        mutationFn: () => (editing?._id ? api.put(`/admin/banners/${editing._id}`, bodyOf(form)) : api.post('/admin/banners', bodyOf(form))),
        onSuccess: () => {
            toast.success('Banner saved');
            refresh();
            setEditing(null);
        },
        onError: (e) => {
            setErrors(fieldErrors(e));
            toast.error(errorMessage(e));
        },
    });
    const toggle = useMutation({
        mutationFn: (b) => api.put(`/admin/banners/${b._id}`, bodyOf({ ...b, active: !b.active })),
        onSuccess: refresh,
        onError: (e) => toast.error(errorMessage(e)),
    });
    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/banners/${id}`),
        onSuccess: () => {
            toast.success('Banner deleted');
            refresh();
            setToDelete(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    return (
        <div>
            <PageHeader title="Hero banners" description="Slides shown at the top of the home page, in order." actions={<Button onClick={() => open(null)}><LuPlus className="h-4 w-4" /> New banner</Button>} />

            {isLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
            ) : banners.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    {banners.map((b) => (
                        <div key={b._id} className={cn('card p-3', !b.active && 'opacity-70')}>
                            <BannerPreview b={b} />
                            <div className="flex flex-wrap items-center gap-3 px-2 pt-3 pb-1">
                                <span className="text-xs font-semibold text-muted">#{b.order}</span>
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{b.title}</span>
                                {b.active ? <Badge tone="success">Live</Badge> : <Badge>Hidden</Badge>}
                                <Toggle checked={b.active} onChange={() => toggle.mutate(b)} />
                                <Button variant="ghost" size="iconSm" onClick={() => open(b)} aria-label="Edit"><LuPencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="iconSm" className="text-danger hover:!bg-danger/10" onClick={() => setToDelete(b)} aria-label="Delete"><LuTrash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card"><Empty icon={LuImage} title="No banners" text="Add a hero banner to feature a collection on the home page." action={<Button onClick={() => open(null)}>New banner</Button>} /></div>
            )}

            <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit banner' : 'New banner'} size="max-w-3xl">
                <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <Field label="Image" error={errors.image}>
                            <SingleImageInput value={form.image} onChange={set('image')} />
                        </Field>
                        <Field label="Eyebrow" value={form.eyebrow} onChange={set('eyebrow')} placeholder="e.g. New season" />
                        <Field label="Title" value={form.title} onChange={set('title')} error={errors.title} required />
                        <Field label="Subtitle" error={errors.subtitle}>
                            <textarea rows={2} value={form.subtitle} onChange={set('subtitle')} className="input" />
                        </Field>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Button text" value={form.ctaText} onChange={set('ctaText')} error={errors.ctaText} />
                            <Field label="Button link" value={form.ctaLink} onChange={set('ctaLink')} error={errors.ctaLink} placeholder="/shop?category=…" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Text theme">
                                <select value={form.theme} onChange={set('theme')} className="input">
                                    <option value="dark">Light text on dark</option>
                                    <option value="light">Dark text on light</option>
                                </select>
                            </Field>
                            <Field label="Order" type="number" min="0" value={form.order} onChange={set('order')} />
                        </div>
                        <Toggle checked={form.active} onChange={set('active')} label="Active" description="Show on the home page" />
                        <div>
                            <p className="label">Preview</p>
                            <BannerPreview b={form} compact />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            <Button type="submit" loading={save.isPending}>Save banner</Button>
                        </div>
                    </div>
                </form>
            </Modal>
            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title="Delete banner?" message={`"${toDelete?.title}" will be removed from the home page.`} confirmText="Delete" />
        </div>
    );
}
