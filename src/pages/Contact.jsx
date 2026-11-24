import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuMail, LuMapPin, LuPhone } from 'react-icons/lu';
import { api, errorMessage } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Button, Field } from '../components/ui';
import { useTitle } from '../hooks/useCommon';

export default function Contact() {
    const { settings } = useStore();
    const { user, profile } = useAuth();
    useTitle('Contact us');
    const [f, setF] = useState({ name: profile?.name || '', email: user?.email || '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/contact', f);
            toast.success(data.message);
            setSent(true);
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-x pt-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Contact</p>
                    <h1 className="mt-3 text-5xl font-extrabold">We'd love to hear from you</h1>
                    <p className="mt-4 max-w-md text-lg text-muted">Questions about an order, a product or a partnership? Send us a note and we'll reply within one business day.</p>
                    <ul className="mt-10 space-y-5">
                        {[
                            [LuMail, 'Email', settings.contactEmail, settings.contactEmail && `mailto:${settings.contactEmail}`],
                            [LuPhone, 'Phone', settings.contactPhone, settings.contactPhone && `tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`],
                            [LuMapPin, 'Studio', settings.address],
                        ]
                            .filter(([, , v]) => v)
                            .map(([Icon, l, v, href]) => (
                                <li key={l} className="flex items-center gap-4">
                                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft"><Icon className="h-5 w-5 text-accent" /></span>
                                    <span>
                                        <span className="block text-xs font-semibold uppercase tracking-wider text-muted">{l}</span>
                                        {href ? <a href={href} className="font-semibold hover:text-accent">{v}</a> : <span className="font-semibold">{v}</span>}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
                <div className="card p-6 sm:p-8">
                    {sent ? (
                        <div className="py-16 text-center">
                            <h2 className="text-2xl font-bold">Message sent ✓</h2>
                            <p className="mt-2 text-muted">Thanks, {f.name.split(' ')[0]}. We'll be in touch at {f.email}.</p>
                            <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setF((x) => ({ ...x, subject: '', message: '' })); }}>Send another</Button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name" required minLength={2} value={f.name} onChange={set('name')} />
                            <Field label="Email" type="email" required value={f.email} onChange={set('email')} />
                            <Field className="sm:col-span-2" label="Subject" value={f.subject} onChange={set('subject')} />
                            <Field className="sm:col-span-2" label="Message">
                                <textarea className="input" rows={6} required minLength={10} maxLength={3000} value={f.message} onChange={set('message')} />
                            </Field>
                            <Button type="submit" size="lg" loading={loading} className="sm:col-span-2">Send message</Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
