import { NavLink, Outlet } from 'react-router';
import { LuHeart, LuLayoutDashboard, LuLogOut, LuMapPin, LuPackage, LuUser } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { cn, initials } from '../../lib/utils';

const NAV = [
    ['/account', 'Overview', LuLayoutDashboard, true],
    ['/account/orders', 'Orders', LuPackage],
    ['/wishlist', 'Wishlist', LuHeart],
    ['/account/addresses', 'Addresses', LuMapPin],
    ['/account/profile', 'Profile', LuUser],
];

export default function AccountLayout() {
    const { user, profile, logout, isAdmin } = useAuth();
    const name = profile?.name || user?.displayName || user?.email;
    const photo = profile?.photo || user?.photoURL;
    return (
        <div className="container-x pt-8">
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="card p-5">
                        <div className="flex items-center gap-3">
                            {photo ? <img src={photo} alt="" className="h-12 w-12 rounded-full object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-ink font-bold text-bg">{initials(name)}</span>}
                            <div className="min-w-0">
                                <p className="truncate font-semibold">{name}</p>
                                <p className="truncate text-xs text-muted">{user?.email}</p>
                            </div>
                        </div>
                        <nav className="-mx-2 mt-5 flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
                            {NAV.map(([to, label, Icon, end]) => (
                                <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-ink text-bg' : 'hover:bg-soft')}>
                                    <Icon className="h-4 w-4" /> {label}
                                </NavLink>
                            ))}
                            {isAdmin && (
                                <NavLink to="/admin" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-accent hover:bg-soft">
                                    <LuLayoutDashboard className="h-4 w-4" /> Admin
                                </NavLink>
                            )}
                            <button onClick={logout} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-soft">
                                <LuLogOut className="h-4 w-4" /> Sign out
                            </button>
                        </nav>
                    </div>
                </aside>
                <section className="min-w-0">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}
