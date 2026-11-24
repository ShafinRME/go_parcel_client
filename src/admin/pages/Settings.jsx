import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuSave } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { Button, Field, PageLoader, Toggle } from '../../components/ui';
import { fieldErrors, PageHeader } from '../components/shared';

const KEYS = ['storeName', 'tagline', 'currencySymbol', 'shippingFee', 'freeShippingThreshold', 'taxRate', 'codEnabled', 'announcement', 'heroBadge', 'contactEmail', 'contactPhone', 'address', 'lowStockThreshold', 'social'];

function Section({ title, description, children }) {
    return (
        <section className="card grid gap-6 p-5 sm:p-6 lg:grid-cols-[260px_1fr]">
            <div>
                <h3 className="font-bold">{title}</h3>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export default function Settings() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ['admin', 'settings'], queryFn: () => get('/admin/settings') });
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data) setForm(Object.fromEntries(KEYS.map((k) => [k, data[k] ?? (k === 'social' ? {} : '')])));
    }, [data]);

    if (isLoading || !form) return <PageLoader />;

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
    const setSocial = (k) => (e) => setForm((f) => ({ ...f, social: { ...f.social, [k]: e.target.value } }));
    const dirty = JSON.stringify(form) !== JSON.stringify(Object.fromEntries(KEYS.map((k) => [k, data[k] ?? (k === 'social' ? {} : '')])));

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        try {
            const body = {
                ...form,
                shippingFee: Number(form.shippingFee),
                freeShippingThreshold: Number(form.freeShippingThreshold),
                taxRate: Number(form.taxRate),
                lowStockThreshold: Number(form.lowStockThreshold),
                social: { instagram: '', facebook: '', x: '', youtube: '', ...form.social },
            };
            const { data: saved } = await api.put('/admin/settings', body);
            qc.setQueryData(['admin', 'settings'], saved);
            qc.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Settings saved');
        } catch (err) {
            setErrors(fieldErrors(err));
            toast.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <PageHeader title="Settings" description="Store details, pricing rules and contact information." actions={<Button type="submit" loading={saving} disabled={!dirty}><LuSave className="h-4 w-4" /> Save changes</Button>} />

            <Section title="Store" description="Shown in the header, footer and emails.">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Store name" value={form.storeName} onChange={set('storeName')} error={errors.storeName} required />
                    <Field label="Tagline" value={form.tagline} onChange={set('tagline')} error={errors.tagline} />
                </div>
                <Field label="Announcement bar" value={form.announcement} onChange={set('announcement')} error={errors.announcement} hint="Leave empty to hide the bar" />
                <Field label="Hero badge" value={form.heroBadge} onChange={set('heroBadge')} error={errors.heroBadge} placeholder="e.g. New season · Autumn edit" />
            </Section>

            <Section title="Pricing & checkout" description="Applied by the server when an order is priced.">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Currency symbol" value={form.currencySymbol} onChange={set('currencySymbol')} error={errors.currencySymbol} required hint="Payments are charged in the server's currency" />
                    <Field label="Tax rate (%)" type="number" step="0.01" min="0" max="50" value={form.taxRate} onChange={set('taxRate')} error={errors.taxRate} />
                    <Field label="Low stock alert at" type="number" min="0" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} error={errors.lowStockThreshold} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Shipping fee" type="number" step="0.01" min="0" value={form.shippingFee} onChange={set('shippingFee')} error={errors.shippingFee} />
                    <Field label="Free shipping over" type="number" step="0.01" min="0" value={form.freeShippingThreshold} onChange={set('freeShippingThreshold')} error={errors.freeShippingThreshold} hint="0 = never free" />
                </div>
                <div className="rounded-xl border border-line p-4">
                    <Toggle checked={!!form.codEnabled} onChange={set('codEnabled')} label="Cash on delivery" description="Let customers pay when the order arrives" />
                </div>
            </Section>

            <Section title="Contact" description="Displayed on the contact page and footer.">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} error={errors.contactEmail} />
                    <Field label="Phone" value={form.contactPhone} onChange={set('contactPhone')} error={errors.contactPhone} />
                </div>
                <Field label="Address" value={form.address} onChange={set('address')} error={errors.address} />
            </Section>

            <Section title="Social links" description="Full URLs to your profiles. Empty links are hidden.">
                <div className="grid gap-4 sm:grid-cols-2">
                    {[['instagram', 'Instagram'], ['facebook', 'Facebook'], ['x', 'X / Twitter'], ['youtube', 'YouTube']].map(([k, l]) => (
                        <Field key={k} label={l} value={form.social?.[k] || ''} onChange={setSocial(k)} error={errors[`social.${k}`]} placeholder="https://" />
                    ))}
                </div>
            </Section>

            <div className="flex justify-end">
                <Button type="submit" loading={saving} disabled={!dirty}><LuSave className="h-4 w-4" /> Save changes</Button>
            </div>
        </form>
    );
}
