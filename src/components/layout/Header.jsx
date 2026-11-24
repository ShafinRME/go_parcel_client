import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LuChevronDown, LuHeart, LuLayoutDashboard, LuLogOut, LuMenu, LuMoon, LuPackage, LuSearch, LuShoppingBag, LuSun, LuUser, LuX } from 'react-icons/lu';
import Logo from './Logo';
import SearchBox from './SearchBox';
import { Drawer } from '../ui';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { get } from '../../lib/api';
import { cn, initials } from '../../lib/utils';

const NAV = [
    { to: '/shop', label: 'Shop all' },
    { to: '/shop?onSale=true', label: 'Deals' },
    { to: '/shop?sort=newest', label: 'New in' },
    { to: '/about', label: 'Our story' },
];

function IconBtn({ children, label, badge, ...rest }) {
    const Comp = rest.to ? Link : 'button';
    return (
        <Comp aria-label={label} className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-soft" {...rest}>
            {children}
            {badge > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Comp>
    );
}

function AccountMenu() {
    const { user, profile, logout, isAdmin } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    if (!user)
        return (
            <IconBtn to="/login" label="Sign in">
                <LuUser className="h-5 w-5" />
            </IconBtn>
        );

    const name = profile?.name || user.displayName || user.email;
    const photo = profile?.photo || user.photoURL;
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft" aria-label="Account menu">
                {photo ? (
                    <img src={photo} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-bg">{initials(name)}</span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-2xl animate-fade-up" onClick={() => setOpen(false)}>
                    <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-line" />
                    {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-accent hover:bg-soft">
                            <LuLayoutDashboard className="h-4 w-4" /> Admin dashboard
                        </Link>
                    )}
                    <Link to="/account" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-soft"><LuUser className="h-4 w-4" /> My account</Link>
                    <Link to="/account/orders" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-soft"><LuPackage className="h-4 w-4" /> Orders</Link>
                    <Link to="/wishlist" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-soft"><LuHeart className="h-4 w-4" /> Wishlist</Link>
                    <div className="my-1 h-px bg-line" />
                    <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger hover:bg-soft"><LuLogOut className="h-4 w-4" /> Sign out</button>
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const { count, wishlist, setCartOpen, settings } = useStore();
    const { theme, toggle } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menu, setMenu] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [catsOpen, setCatsOpen] = useState(false);
    const location = useLocation();
    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories'), staleTime: 5 * 60 * 1000 });

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    // close any open menus when the route changes (state adjusted during render, no effect needed)
    const routeKey = location.pathname + location.search;
    const [lastRoute, setLastRoute] = useState(routeKey);
    if (lastRoute !== routeKey) {
        setLastRoute(routeKey);
        setMenu(false);
        setSearchOpen(false);
        setCatsOpen(false);
    }

    return (
        <>
            {settings.announcement && (
                <div className="bg-ink text-bg">
                    <p className="container-x py-2 text-center text-xs font-medium tracking-wide">{settings.announcement}</p>
                </div>
            )}
            <header className={cn('sticky top-0 z-40 border-b transition-all duration-300', scrolled ? 'border-line bg-bg/85 backdrop-blur-xl' : 'border-transparent bg-bg')}>
                <div className="container-x flex h-16 items-center gap-4 lg:h-[72px]">
                    <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
                        <LuMenu className="h-5 w-5" />
                    </button>
                    <Logo className="shrink-0" />

                    <nav className="ml-4 hidden items-center gap-1 lg:flex">
                        <div className="relative" onMouseEnter={() => setCatsOpen(true)} onMouseLeave={() => setCatsOpen(false)}>
                            <button className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold hover:bg-soft" onClick={() => setCatsOpen((o) => !o)}>
                                Categories <LuChevronDown className={cn('h-4 w-4 transition', catsOpen && 'rotate-180')} />
                            </button>
                            {catsOpen && (
                                <div className="absolute left-0 top-full z-50 pt-2">
                                    <div className="grid w-[560px] grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-2 shadow-2xl animate-fade-up">
                                        {categories.map((c) => (
                                            <Link key={c._id} to={`/shop?category=${c.slug}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-soft">
                                                <img src={c.image} alt="" className="h-11 w-11 rounded-lg bg-soft object-contain p-1" loading="lazy" />
                                                <span>
                                                    <span className="block text-sm font-semibold">{c.name}</span>
                                                    <span className="block text-xs text-muted">{c.productCount} products</span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {NAV.map((n) => (
                            <NavLink key={n.to} to={n.to} className="hidden whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-ink/80 hover:bg-soft hover:text-ink xl:block">
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>

                    <SearchBox className="ml-auto hidden w-full max-w-xs md:block xl:max-w-sm" />

                    <div className="ml-auto flex items-center gap-0.5 md:ml-2">
                        <IconBtn label="Search" onClick={() => setSearchOpen((s) => !s)} className="md:hidden">
                            {searchOpen ? <LuX className="h-5 w-5" /> : <LuSearch className="h-5 w-5" />}
                        </IconBtn>
                        <IconBtn label="Toggle dark mode" onClick={toggle}>
                            {theme === 'dark' ? <LuSun className="h-5 w-5" /> : <LuMoon className="h-5 w-5" />}
                        </IconBtn>
                        <span className="hidden sm:block">
                            <IconBtn to="/wishlist" label="Wishlist" badge={wishlist.length}>
                                <LuHeart className="h-5 w-5" />
                            </IconBtn>
                        </span>
                        <AccountMenu />
                        <IconBtn label="Open bag" badge={count} onClick={() => setCartOpen(true)}>
                            <LuShoppingBag className="h-5 w-5" />
                        </IconBtn>
                    </div>
                </div>
                {searchOpen && (
                    <div className="container-x pb-3 md:hidden">
                        <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
                    </div>
                )}
            </header>

            <Drawer open={menu} onClose={() => setMenu(false)} title="Menu" side="left" width="max-w-xs">
                <div className="p-3">
                    {NAV.map((n) => (
                        <Link key={n.to} to={n.to} className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-soft">{n.label}</Link>
                    ))}
                    <Link to="/wishlist" className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-soft">Wishlist</Link>
                    <Link to="/track" className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-soft">Track order</Link>
                    <p className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-muted">Categories</p>
                    {categories.map((c) => (
                        <Link key={c._id} to={`/shop?category=${c.slug}`} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-soft">
                            <img src={c.image} alt="" className="h-8 w-8 rounded-lg bg-soft object-contain" loading="lazy" />
                            {c.name}
                        </Link>
                    ))}
                </div>
            </Drawer>
        </>
    );
}
