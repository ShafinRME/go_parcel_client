import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { LuArrowRight, LuFacebook, LuInstagram, LuTwitter, LuYoutube } from 'react-icons/lu';
import Logo from './Logo';
import { useStore } from '../../context/StoreContext';
import { api, errorMessage } from '../../lib/api';

const COLS = [
    { title: 'Shop', links: [['All products', '/shop'], ['New arrivals', '/shop?sort=newest'], ['Best sellers', '/shop?sort=popular'], ['Deals', '/shop?onSale=true']] },
    { title: 'Help', links: [['Track an order', '/track'], ['FAQ', '/faq'], ['Contact us', '/contact'], ['My account', '/account']] },
    { title: 'Company', links: [['Our story', '/about'], ['Wishlist', '/wishlist'], ['Shipping & returns', '/faq'], ['Privacy', '/faq']] },
];

export function Newsletter({ dark }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/subscribe', { email });
            toast.success(data.message);
            setEmail('');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={submit} className={`flex w-full max-w-md items-center rounded-full border p-1.5 ${dark ? 'border-white/15 bg-white/5' : 'border-line bg-surface'}`}>
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                className={`h-10 flex-1 bg-transparent px-4 text-sm outline-none ${dark ? 'text-white placeholder:text-white/50' : 'placeholder:text-muted'}`}
            />
            <button disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-60">
                {loading ? 'Joining…' : 'Subscribe'} <LuArrowRight className="h-4 w-4" />
            </button>
        </form>
    );
}

export default function Footer() {
    const { settings } = useStore();
    const social = [
        [settings.social?.instagram, LuInstagram, 'Instagram'],
        [settings.social?.facebook, LuFacebook, 'Facebook'],
        [settings.social?.x, LuTwitter, 'X'],
        [settings.social?.youtube, LuYoutube, 'YouTube'],
    ].filter(([u]) => u);

    return (
        <footer className="mt-24 border-t border-line bg-surface">
            <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr]">
                <div>
                    <Logo />
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{settings.tagline}. Shop thoughtfully designed products, delivered quickly, with returns that are actually easy.</p>
                    <div className="mt-6">
                        <p className="mb-3 text-sm font-semibold">Get early access to drops & offers</p>
                        <Newsletter />
                    </div>
                    {social.length > 0 && (
                        <div className="mt-6 flex gap-2">
                            {social.map(([href, Icon, label]) => (
                                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-soft">
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                    {COLS.map((c) => (
                        <div key={c.title}>
                            <p className="mb-4 text-sm font-bold">{c.title}</p>
                            <ul className="space-y-2.5">
                                {c.links.map(([label, to]) => (
                                    <li key={label}>
                                        <Link to={to} className="text-sm text-muted transition hover:text-ink">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div>
                        <p className="mb-4 text-sm font-bold">Contact</p>
                        <ul className="space-y-2.5 text-sm text-muted">
                            {settings.contactEmail && <li><a href={`mailto:${settings.contactEmail}`} className="hover:text-ink">{settings.contactEmail}</a></li>}
                            {settings.contactPhone && <li>{settings.contactPhone}</li>}
                            {settings.address && <li>{settings.address}</li>}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-line">
                <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
                    <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        {['VISA', 'Mastercard', 'AMEX', 'Apple Pay', 'COD'].map((p) => (
                            <span key={p} className="rounded-md border border-line px-2 py-1 font-semibold">{p}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
