import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import Prologo from '../Prologo/Prologo';
import { FaUserCircle, FaTimes, FaBars } from 'react-icons/fa';
import { MdDashboard, MdLocalShipping } from 'react-icons/md';
import { IoHomeSharp, IoInformationCircle } from 'react-icons/io5';
import { BiSolidMap } from 'react-icons/bi';
import { RiPriceTag3Fill } from 'react-icons/ri';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Active / inactive nav link styling for desktop
    const navLinkClass = ({ isActive }) =>
        isActive
            ? "text-secondary font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-secondary transition-all duration-300"
            : "text-base-200 font-semibold hover:text-secondary transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-secondary hover:after:w-full after:transition-all after:duration-300";

    // Mobile nav link styling
    const mobileNavLinkClass = ({ isActive }) =>
        isActive
            ? "flex items-center gap-3 px-4 py-3 bg-secondary text-base-200 rounded-lg font-bold transition-all duration-300"
            : "flex items-center gap-3 px-4 py-3 text-base-200 font-semibold hover:bg-secondary/10 rounded-lg transition-all duration-300";

    const navItems = [
        { path: '/', label: 'Home', icon: <IoHomeSharp size={20} />, end: true },
        { path: '/coverage', label: 'Coverage', icon: <BiSolidMap size={20} /> },
        ...(user ? [{ path: '/dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> }] : []),
        { path: '/about', label: 'About Us', icon: <IoInformationCircle size={20} /> },
        { path: '/sendParcel', label: 'Pricing', icon: <RiPriceTag3Fill size={20} /> },
    ];

    return (
        <>
            {/* Main Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-50  border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-20">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 z-50">
                            <div className="w-32 md:w-40 lg:w-48">
                                <Prologo />
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={navLinkClass}
                                >
                                    <span className="flex items-center gap-2 py-2">
                                        {item.label}
                                    </span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Be a Rider Button */}
                            <Link to="/beARider">
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-base-300 text-white rounded-lg font-semibold hover:bg-base-300/90 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <MdLocalShipping size={20} />
                                    <span>Be a Rider</span>
                                </button>
                            </Link>

                            {/* Auth Buttons */}
                            {!user ? (
                                <Link to="/login">
                                    <button className="px-6 py-2.5 bg-secondary text-base-200 rounded-lg font-bold hover:bg-secondary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                                        Sign In
                                    </button>
                                </Link>
                            ) : (
                                <div className="relative">
                                    {/* Profile Dropdown Trigger */}
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                                    >
                                        <div className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden">
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt="User"
                                                    onError={(e) => (e.target.src = "/defaultUser.png")}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FaUserCircle size={40} className="text-secondary" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-base-200">
                                                {user.displayName || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.email?.substring(0, 20)}...
                                            </p>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileDropdownOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                            ></div>

                                            {/* Dropdown Content */}
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                                <div className="p-4 border-b border-gray-200">
                                                    <p className="font-semibold text-base-200">
                                                        {user.displayName || 'User'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div className="py-2">
                                                    <Link
                                                        to="/dashboard"
                                                        className="block px-4 py-2 text-base-200 hover:bg-gray-100 transition-colors"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2 rounded-lg text-base-200 hover:bg-gray-100 transition-colors z-50"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Mobile Menu Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-base-200">Menu</h2>
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes size={24} className="text-base-200" />
                        </button>
                    </div>

                    {/* User Info (Mobile) */}
                    {user && (
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden">
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="User"
                                            onError={(e) => (e.target.src = "/defaultUser.png")}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUserCircle size={48} className="text-secondary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-base-200">
                                        {user.displayName || 'User'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.end}
                                        className={mobileNavLinkClass}
                                        onClick={closeMobileMenu}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Mobile Menu Footer */}
                    <div className="p-4 border-t border-gray-200 space-y-3">
                        <Link to="/beARider" onClick={closeMobileMenu}>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-base-300 text-white rounded-lg font-semibold hover:bg-base-300/90 transition-all duration-300">
                                <MdLocalShipping size={20} />
                                <span>Be a Rider</span>
                            </button>
                        </Link>

                        {!user ? (
                            <Link to="/login" onClick={closeMobileMenu}>
                                <button className="w-full px-4 py-3 bg-secondary text-base-200 rounded-lg font-bold hover:bg-secondary/90 transition-all duration-300">
                                    Sign In
                                </button>
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    closeMobileMenu();
                                }}
                                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;