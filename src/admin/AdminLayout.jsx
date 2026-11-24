import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
    LuFolderTree, LuImage, LuInbox, LuLayoutDashboard, LuLogOut, LuMail, LuMenu, LuMoon, LuPackage, LuPanelLeftClose,
    LuPanelLeftOpen, LuSearch, LuSettings, LuShoppingBag, LuStar, LuStore, LuSun, LuTicketPercent, LuUser, LuUsers, LuX,
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { get } from '../lib/api';
import { cn, initials, safeStorage } from '../lib/utils';

const NAV = [
    { group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LuLayoutDashboard, end: true }] },
    {
        group: 'Catalog',
        items: [
            { to: '/admin/products', label: 'Products', icon: LuPackage },
            { to: '/admin/categories', label: 'Categories', icon: LuFolderTree },
            { to: '/admin/reviews', label: 'Reviews', icon: LuStar },
        ],
    },
    {
        group: 'Sales',
        items: [
            { to: '/admin/orders', label: 'Orders', icon: LuShoppingBag },
            { to: '/admin/customers', label: 'Customers', icon: LuUsers },
            { to: '/admin/coupons', label: 'Coupons', icon: LuTicketPercent },
        ],
    },
    {
        group: 'Content',
        items: [
            { to: '/admin/banners', label: 'Banners', icon: LuImage },
            { to: '/admin/messages', label: 'Messages', icon: LuInbox, badge: 'messages' },
            { to: '/admin/subscribers', label: 'Subscribers', icon: LuMail },
        ],
    },
    { group: 'System', items: [{ to: '/admin/settings', label: 'Settings', icon: LuSettings }] },
];

const TITLES = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/products/new': 'New product',
    '/admin/categories': 'Categories',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/reviews': 'Reviews',
    '/admin/coupons': 'Coupons',
    '/admin/banners': 'Banners',
    '/admin/messages': 'Messages',
    '/admin/subscribers': 'Subscribers',
    '/admin/settings': 'Settings',
};

function Sidebar({ collapsed, onNavigate, newMessages, storeName }) {
    return (
        <div className="flex h-full flex-col">
            <Link to="/admin" onClick={onNavigate} className={cn('flex h-16 items-center gap-2.5 border-b border-line px-5', collapsed && 'justify-center px-0')}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink">
                    <span className="h-3.5 w-3.5 rounded-full border-[3px] border-accent" />
                </span>
                {!collapsed && (
                    <span className="min-w-0">
                        <span className="block truncate font-display text-base leading-tight font-bold">{storeName}</span>
                        <span className="block text-[11px] font-medium tracking-wider text-muted uppercase">Admin</span>
                    </span>
                )}
            </Link>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
                {NAV.map((g) => (
                    <div key={g.group}>
                        {!collapsed && <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">{g.group}</p>}
                        <ul className="space-y-0.5">
                            {g.items.map((it) => {
                                const count = it.badge === 'messages' ? newMessages : 0;
                                return (
                                    <li key={it.to}>
                                        <NavLink
                                            to={it.to}
                                            end={it.end}
                                            onClick={onNavigate}
                                            title={collapsed ? it.label : undefined}
                                            className={({ isActive }) =>
                                                cn(
                                                    'relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition',
                                                    isActive ? 'bg-ink text-bg' : 'text-muted hover:bg-soft hover:text-ink',
                                                    collapsed && 'justify-center px-0'
                                                )
                                            }
                                        >
                                            <it.icon className="h-4.5 w-4.5 shrink-0" />
                                            {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                                            {count > 0 &&
                                                (collapsed ? (
                                                    <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-accent" />
                                                ) : (
                                                    <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-ink">{count}</span>
                                                ))}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="border-t border-line p-3">
                <Link to="/" onClick={onNavigate} className={cn('flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted hover:bg-soft hover:text-ink', collapsed && 'justify-center px-0')}>
                    <LuStore className="h-4.5 w-4.5" />
                    {!collapsed && 'View store'}
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const { profile, user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const { settings } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(() => safeStorage.get('admin.collapsed', false));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [q, setQ] = useState('');
    const menuRef = useRef(null);

    const { data: messages = [] } = useQuery({ queryKey: ['admin', 'messages', 'new'], queryFn: () => get('/admin/messages', { status: 'new' }), refetchInterval: 60000 });

    useEffect(() => safeStorage.set('admin.collapsed', collapsed), [collapsed]);
    useEffect(() => {
        const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);
    useEffect(() => {
        const prev = document.title;
        const t = TITLES[location.pathname] || (location.pathname.includes('/orders/') ? 'Order' : location.pathname.includes('/products/') ? 'Edit product' : 'Admin');
        document.title = `${t} · Admin`;
        return () => {
            document.title = prev;
        };
    }, [location.pathname]);

    const title = TITLES[location.pathname] || (location.pathname.includes('/orders/') ? 'Order details' : location.pathname.includes('/products/') ? 'Edit product' : 'Admin');
    const name = profile?.name || user?.displayName || user?.email || 'Admin';
    const storeName = settings?.storeName || 'Lumen & Co.';

    return (
        <div className="min-h-screen bg-bg">
            {/* Desktop sidebar */}
            <aside className={cn('no-print fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-surface transition-[width] duration-200 lg:block', collapsed ? 'w-[72px]' : 'w-64')}>
                <Sidebar collapsed={collapsed} newMessages={messages.length} storeName={storeName} />
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="no-print fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface shadow-2xl">
                        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 grid h-8 w-8 place-items-center rounded-full hover:bg-soft" aria-label="Close menu">
                            <LuX className="h-4 w-4" />
                        </button>
                        <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} newMessages={messages.length} storeName={storeName} />
                    </aside>
                </div>
            )}

            <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-64')}>
                <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
                    <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-soft lg:hidden" aria-label="Open menu">
                        <LuMenu className="h-5 w-5" />
                    </button>
                    <button onClick={() => setCollapsed((c) => !c)} className="hidden h-9 w-9 place-items-center rounded-lg text-muted hover:bg-soft hover:text-ink lg:grid" aria-label="Toggle sidebar">
                        {collapsed ? <LuPanelLeftOpen className="h-5 w-5" /> : <LuPanelLeftClose className="h-5 w-5" />}
                    </button>
                    <h2 className="truncate font-display text-lg font-bold">{title}</h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (q.trim()) navigate(`/admin/orders?search=${encodeURIComponent(q.trim())}`);
                            setQ('');
                        }}
                        className="relative ml-auto hidden md:block"
                    >
                        <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders, emails…" className="input h-9 w-64 pl-9" />
                    </form>

                    <div className="ml-auto flex items-center gap-1 md:ml-0">
                        <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-soft hover:text-ink" aria-label="Toggle theme">
                            {theme === 'dark' ? <LuSun className="h-4.5 w-4.5" /> : <LuMoon className="h-4.5 w-4.5" />}
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-soft" aria-label="Account menu">
                                {profile?.photo || user?.photoURL ? (
                                    <img src={profile?.photo || user?.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-bg">{initials(name)}</span>
                                )}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
                                    <div className="border-b border-line px-4 py-3">
                                        <p className="truncate text-sm font-semibold">{name}</p>
                                        <p className="truncate text-xs text-muted">{user?.email}</p>
                                    </div>
                                    <div className="p-1.5">
                                        <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-soft">
                                            <LuUser className="h-4 w-4" /> My account
                                        </Link>
                                        <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-soft">
                                            <LuStore className="h-4 w-4" /> View store
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                await logout();
                                                navigate('/login');
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                                        >
                                            <LuLogOut className="h-4 w-4" /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
