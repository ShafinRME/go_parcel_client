import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuCopy, LuPencil, LuPlus, LuTicketPercent, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { cn, formatDate } from '../../lib/utils';
import { Badge, Button, Confirm, Empty, Field, Modal, Skeleton, Toggle } from '../../components/ui';
import { fieldErrors, PageHeader } from '../components/shared';

const EMPTY = { code: '', description: '', type: 'percent', value: '', minOrder: 0, maxDiscount: '', maxUses: 0, perUserLimit: 0, startsAt: '', expiresAt: '', active: true };
const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const couponState = (c) => {
    const now = new Date();
    if (!c.active) return { label: 'Disabled', tone: 'neutral' };
    if (c.expiresAt && new Date(c.expiresAt) < now) return { label: 'Expired', tone: 'danger' };
    if (c.startsAt && new Date(c.startsAt) > now) return { label: 'Scheduled', tone: 'info' };
    if (c.maxUses && c.usedCount >= c.maxUses) return { label: 'Used up', tone: 'warning' };
    return { label: 'Active', tone: 'success' };
};

export default function Coupons() {
    const { money } = useStore();
    const qc = useQueryClient();
    const { data: coupons = [], isLoading } = useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => get('/admin/coupons') });
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [toDelete, setToDelete] = useState(null);

    const open = (c) => {
        setErrors({});
        setEditing(c || {});
        setForm(c ? { ...EMPTY, ...c, maxDiscount: c.maxDiscount ?? '', startsAt: toInput(c.startsAt), expiresAt: toInput(c.expiresAt) } : EMPTY);
    };
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

    const save = useMutation({
        mutationFn: () => {
            const body = {
                code: form.code,
                description: form.description,
                type: form.type,
                value: Number(form.value),
                minOrder: Number(form.minOrder) || 0,
                maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
                maxUses: Number(form.maxUses) || 0,
                perUserLimit: Number(form.perUserLimit) || 0,
                startsAt: form.startsAt || null,
                expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59` : null,
                active: form.active,
            };
            return editing?._id ? api.put(`/admin/coupons/${editing._id}`, body) : api.post('/admin/coupons', body);
        },
        onSuccess: () => {
            toast.success(editing?._id ? 'Coupon updated' : 'Coupon created');
            qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
            setEditing(null);
        },
        onError: (e) => {
            setErrors(fieldErrors(e));
            toast.error(errorMessage(e));
        },
    });
    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
        onSuccess: () => {
            toast.success('Coupon deleted');
            qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
            setToDelete(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    return (
        <div>
            <PageHeader title="Coupons" description="Discount codes customers can apply at checkout." actions={<Button onClick={() => open(null)}><LuPlus className="h-4 w-4" /> New coupon</Button>} />

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
            ) : coupons.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {coupons.map((c) => {
                        const st = couponState(c);
                        const pct = c.maxUses ? Math.min(100, (c.usedCount / c.maxUses) * 100) : 0;
                        return (
                            <div key={c._id} className={cn('card relative overflow-hidden p-5', st.label !== 'Active' && 'opacity-80')}>
                                <div className="absolute top-0 right-0 h-full w-1.5 bg-[repeating-linear-gradient(180deg,var(--line)_0_8px,transparent_8px_14px)]" />
                                <div className="flex items-start justify-between gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard?.writeText(c.code);
                                            toast.success('Code copied');
                                        }}
                                        className="group inline-flex items-center gap-2 rounded-lg border border-dashed border-ink/30 px-2.5 py-1 font-mono text-sm font-bold tracking-wider"
                                    >
                                        {c.code}
                                        <LuCopy className="h-3.5 w-3.5 text-muted group-hover:text-ink" />
                                    </button>
                                    <Badge tone={st.tone}>{st.label}</Badge>
                                </div>
                                <p className="mt-4 font-display text-3xl font-bold">{c.type === 'percent' ? `${c.value}% off` : `${money(c.value)} off`}</p>
                                <p className="mt-1 line-clamp-1 text-sm text-muted">{c.description || '—'}</p>
                                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                                    {c.minOrder > 0 && <span>Min {money(c.minOrder)}</span>}
                                    {c.maxDiscount && <span>Max {money(c.maxDiscount)}</span>}
                                    {c.perUserLimit > 0 && <span>{c.perUserLimit}× per customer</span>}
                                    {c.expiresAt && <span>Ends {formatDate(c.expiresAt)}</span>}
                                </div>
                                <div className="mt-4">
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="text-muted">Used</span>
                                        <span className="font-semibold">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                                        <div className="h-full rounded-full bg-ink" style={{ width: c.maxUses ? `${pct}%` : c.usedCount ? '100%' : '0%', opacity: c.maxUses ? 1 : 0.25 }} />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2 border-t border-line pt-4">
                                    <Button size="sm" variant="outline" onClick={() => open(c)}><LuPencil className="h-3.5 w-3.5" /> Edit</Button>
                                    <Button size="sm" variant="ghost" className="text-danger hover:!bg-danger/10" onClick={() => setToDelete(c)}><LuTrash2 className="h-3.5 w-3.5" /> Delete</Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card"><Empty icon={LuTicketPercent} title="No coupons yet" text="Create a discount code to run a promotion." action={<Button onClick={() => open(null)}>New coupon</Button>} /></div>
            )}

            <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit coupon' : 'New coupon'} size="max-w-xl">
                <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Code" value={form.code} onChange={(e) => set('code')(e.target.value.toUpperCase().replace(/\s/g, ''))} error={errors.code} placeholder="SUMMER25" required />
                        <Field label="Type" error={errors.type}>
                            <div className="grid grid-cols-2 gap-2">
                                {[['percent', 'Percent'], ['fixed', 'Fixed amount']].map(([v, l]) => (
                                    <button key={v} type="button" onClick={() => set('type')(v)} className={cn('h-11 rounded-xl border text-sm font-semibold', form.type === v ? 'border-ink bg-ink text-bg' : 'border-line')}>{l}</button>
                                ))}
                            </div>
                        </Field>
                    </div>
                    <Field label="Description" value={form.description} onChange={set('description')} placeholder="Shown to admins" />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field label={form.type === 'percent' ? 'Discount %' : 'Discount amount'} type="number" step="0.01" min="0" value={form.value} onChange={set('value')} error={errors.value} required />
                        <Field label="Minimum order" type="number" step="0.01" min="0" value={form.minOrder} onChange={set('minOrder')} />
                        <Field label="Max discount" type="number" step="0.01" min="0" value={form.maxDiscount} onChange={set('maxDiscount')} hint="Optional cap" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Total uses limit" type="number" min="0" value={form.maxUses} onChange={set('maxUses')} hint="0 = unlimited" />
                        <Field label="Uses per customer" type="number" min="0" value={form.perUserLimit} onChange={set('perUserLimit')} hint="0 = unlimited" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Starts" type="date" value={form.startsAt} onChange={set('startsAt')} />
                        <Field label="Expires" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
                    </div>
                    <Toggle checked={form.active} onChange={set('active')} label="Active" description="Inactive codes are rejected at checkout" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button type="submit" loading={save.isPending}>Save coupon</Button>
                    </div>
                </form>
            </Modal>
            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title={`Delete ${toDelete?.code}?`} message="Customers will no longer be able to use this code." confirmText="Delete" />
        </div>
    );
}
