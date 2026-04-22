import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router';
import Prologo from '../shared/Prologo/Prologo';
import {
    FaHome,
    FaBoxOpen,
    FaMoneyCheckAlt,
    FaUserEdit,
    FaSearchLocation,
    FaUserCheck,
    FaUserClock,
    FaUserShield,
    FaMotorcycle,
    FaTasks,
    FaCheckCircle,
    FaWallet,
    FaTimes,
    FaBars,
    FaSignOutAlt,
    FaChevronDown,
    FaMapMarkedAlt,
    FaSearch
} from 'react-icons/fa';
import { MdDashboard, MdAdminPanelSettings } from 'react-icons/md';
import { BiPackage } from 'react-icons/bi';
import useUserRole from '../hooks/useUserRole';
import useAuth from '../hooks/useAuth';

const DashboardLayout = () => {
    const { role, roleLoading } = useUserRole();
    const { user, logOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRiderMenuOpen, setIsRiderMenuOpen] = useState(true);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Base navigation links for all users
    const baseNavLinks = [
        {
            path: '/dashboard',
            label: 'Dashboard Home',
            icon: <MdDashboard size={20} />,
            end: true
        },
        {
            path: '/dashboard/myParcels',
            label: 'My Parcels',
            icon: <FaBoxOpen size={20} />
        },
        {
            path: '/dashboard/paymentHistory',
            label: 'Payment History',
            icon: <FaMoneyCheckAlt size={20} />
        },
        {
            path: '/dashboard/track',
            label: 'Track Package',
            icon: <FaSearchLocation size={20} />
        },
        {
            path: '/dashboard/profile',
            label: 'Update Profile',
            icon: <FaUserEdit size={20} />
        },

    ];

    // Rider specific links
    const riderLinks = [
        {
            path: '/dashboard/pending-deliveries',
            label: 'Pending Deliveries',
            icon: <FaTasks size={20} />
        },
        {
            path: '/dashboard/completed-deliveries',
            label: 'Completed Deliveries',
            icon: <FaCheckCircle size={20} />
        },
        {
            path: '/dashboard/my-earnings',
            label: 'My Earnings',
            icon: <FaWallet size={20} />
        },
    ];

    // Admin specific links
    const adminLinks = [
        {
            path: '/dashboard/assign-rider',
            label: 'Assign Rider',
            icon: <FaMotorcycle size={20} />
        },
        {
            path: '/dashboard/active-riders',
            label: 'Active Riders',
            icon: <FaUserCheck size={20} />
        },
        {
            path: '/dashboard/pending-riders',
            label: 'Pending Riders',
            icon: <FaUserClock size={20} />
        },
        {
            path: '/dashboard/makeAdmin',
            label: 'Make Admin',
            icon: <FaUserShield size={20} />
        },
        {
            path: '/dashboard/admin-tracking',
            label: 'Manage Tracking',
            icon: <FaMapMarkedAlt size={20} />,
            adminOnly: true
        }
    ];

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "flex items-center gap-3 px-4 py-3 bg-secondary text-base-200 rounded-lg font-bold transition-all duration-300 shadow-md"
            : "flex items-center gap-3 px-4 py-3 text-white font-semibold hover:bg-white/10 rounded-lg transition-all duration-300";

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-base-300 shadow-xl">
                {/* Sidebar Header */}
                <div className="p-6 bg-base-200">
                    <Link to="/">
                        <div className="w-40 ">
                            <Prologo />
                        </div>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-6 bg-base-200/50 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-base-200 font-bold text-lg">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-sm text-gray-300 truncate">
                                {user?.email}
                            </p>
                            {!roleLoading && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-secondary text-base-200 text-xs font-bold rounded-full capitalize">
                                    {role || 'User'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {/* Base Navigation */}
                    {baseNavLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.end}
                            className={navLinkClass}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}

                    {/* Rider Section */}
                    {!roleLoading && role === 'rider' && (
                        <div className="pt-6">
                            <button
                                onClick={() => setIsRiderMenuOpen(!isRiderMenuOpen)}
                                className="flex items-center justify-between w-full px-4 py-2 text-secondary font-bold text-sm uppercase tracking-wide"
                            >
                                <span className="flex items-center gap-2">
                                    <BiPackage size={18} />
                                    Rider Operations
                                </span>
                                <FaChevronDown
                                    className={`transition-transform duration-300 ${isRiderMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isRiderMenuOpen && (
                                <div className="space-y-1 mt-2">
                                    {riderLinks.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            className={navLinkClass}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Section */}
                    {!roleLoading && role === 'admin' && (
                        <div className="pt-6">
                            <button
                                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                className="flex items-center justify-between w-full px-4 py-2 text-secondary font-bold text-sm uppercase tracking-wide"
                            >
                                <span className="flex items-center gap-2">
                                    <MdAdminPanelSettings size={18} />
                                    Admin Panel
                                </span>
                                <FaChevronDown
                                    className={`transition-transform duration-300 ${isAdminMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isAdminMenuOpen && (
                                <div className="space-y-1 mt-2">
                                    {adminLinks.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            className={navLinkClass}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10">
                    {/* <Link to="/">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 mb-2">
                            <FaHome size={18} />
                            <span>Back to Home</span>
                        </button>
                    </Link> */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300"
                    >
                        <FaSignOutAlt size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-base-300 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between p-4 bg-base-200">
                    <div className="w-32">
                        <Prologo />
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <FaTimes size={24} className="text-white" />
                    </button>
                </div>

                {/* User Info Mobile */}
                <div className="p-4 bg-base-200/50 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-base-200 font-bold text-lg">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-300 truncate">
                                {user?.email}
                            </p>
                            {!roleLoading && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-secondary text-base-200 text-xs font-bold rounded-full capitalize">
                                    {role || 'User'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 h-[calc(100vh-280px)]">
                    {baseNavLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.end}
                            className={navLinkClass}
                            onClick={closeSidebar}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}

                    {/* Rider Section Mobile */}
                    {!roleLoading && role === 'rider' && (
                        <div className="pt-6">
                            <button
                                onClick={() => setIsRiderMenuOpen(!isRiderMenuOpen)}
                                className="flex items-center justify-between w-full px-4 py-2 text-secondary font-bold text-sm uppercase tracking-wide"
                            >
                                <span className="flex items-center gap-2">
                                    <BiPackage size={18} />
                                    Rider Operations
                                </span>
                                <FaChevronDown
                                    className={`transition-transform duration-300 ${isRiderMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isRiderMenuOpen && (
                                <div className="space-y-1 mt-2">
                                    {riderLinks.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            className={navLinkClass}
                                            onClick={closeSidebar}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Section Mobile */}
                    {!roleLoading && role === 'admin' && (
                        <div className="pt-6">
                            <button
                                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                className="flex items-center justify-between w-full px-4 py-2 text-secondary font-bold text-sm uppercase tracking-wide"
                            >
                                <span className="flex items-center gap-2">
                                    <MdAdminPanelSettings size={18} />
                                    Admin Panel
                                </span>
                                <FaChevronDown
                                    className={`transition-transform duration-300 ${isAdminMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isAdminMenuOpen && (
                                <div className="space-y-1 mt-2">
                                    {adminLinks.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            className={navLinkClass}
                                            onClick={closeSidebar}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Mobile Sidebar Footer */}
                <div className="p-4 border-t border-white/10">
                    <Link to="/" onClick={closeSidebar}>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 mb-2">
                            <FaHome size={18} />
                            <span>Back to Home</span>
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            handleLogout();
                            closeSidebar();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300"
                    >
                        <FaSignOutAlt size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar - Mobile */}
                <header className="lg:hidden bg-white shadow-md sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 py-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaBars size={24} className="text-base-200" />
                        </button>
                        <h1 className="text-lg font-bold text-base-200">Dashboard</h1>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-base-200 font-bold">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-4 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
