import React from 'react';
import { Link } from 'react-router';
import Prologo from '../Prologo/Prologo';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import { IoHomeSharp, IoInformationCircle } from 'react-icons/io5';
import { BiSolidMap } from 'react-icons/bi';
import { RiPriceTag3Fill } from 'react-icons/ri';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { path: '/', label: 'Home', icon: <IoHomeSharp size={16} /> },
        { path: '/coverage', label: 'Coverage', icon: <BiSolidMap size={16} /> },
        { path: '/about', label: 'About Us', icon: <IoInformationCircle size={16} /> },
        { path: '/sendParcel', label: 'Pricing', icon: <RiPriceTag3Fill size={16} /> },
    ];

    const services = [
        { path: '/services/express', label: 'Express Delivery' },
        { path: '/services/same-day', label: 'Same Day Delivery' },
        { path: '/services/international', label: 'International Shipping' },
        { path: '/services/bulk', label: 'Bulk Orders' },
    ];

    const support = [
        { path: '/help', label: 'Help Center' },
        { path: '/tracking', label: 'Track Package' },
        { path: '/faq', label: 'FAQ' },
        { path: '/contact', label: 'Contact Us' },
    ];

    const socialLinks = [
        { icon: <FaFacebookF size={18} />, url: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
        { icon: <FaTwitter size={18} />, url: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
        { icon: <FaInstagram size={18} />, url: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
        { icon: <FaLinkedinIn size={18} />, url: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    ];

    return (
        <footer className="bg-base-200 text-white mt-20">
            {/* Call to Action Section */}
            <div className="bg-secondary py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-bold text-base-200 mb-2">
                                Ready to Start Delivering?
                            </h3>
                            <p className="text-base-200/80 font-semibold">
                                Join thousands of satisfied customers using our delivery service
                            </p>
                        </div>
                        <Link to="/beARider">
                            <button className="flex items-center gap-2 px-8 py-4 bg-base-300 text-white rounded-lg font-bold hover:bg-base-300/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                <MdLocalShipping size={24} />
                                <span>Become a Rider</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="w-40">
                            <Prologo />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted partner for fast, reliable, and secure delivery services.
                            We deliver excellence with every package.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    aria-label={social.label}
                                    className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110`}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-secondary mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="flex items-center gap-2 text-gray-300 hover:text-secondary transition-colors duration-300 group"
                                    >
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                                            {link.icon}
                                        </span>
                                        <span className="font-semibold">{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-bold text-secondary mb-4">Our Services</h4>
                        <ul className="space-y-3">
                            {services.map((service) => (
                                <li key={service.path}>
                                    <Link
                                        to={service.path}
                                        className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold block hover:translate-x-1 transform transition-transform"
                                    >
                                        {service.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-secondary mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-300">
                                <FaMapMarkerAlt size={18} className="text-secondary mt-1 flex-shrink-0" />
                                <span className="text-sm font-semibold">
                                    123 Delivery Street, Dhaka 1000, Bangladesh
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FaPhoneAlt size={16} className="text-secondary flex-shrink-0" />
                                <a href="tel:+8801234567890" className="text-sm font-semibold hover:text-secondary transition-colors">
                                    +880 123 456 7890
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FaEnvelope size={16} className="text-secondary flex-shrink-0" />
                                <a href="mailto:support@delivery.com" className="text-sm font-semibold hover:text-secondary transition-colors">
                                    support@delivery.com
                                </a>
                            </li>
                        </ul>

                        {/* Support Links */}
                        <div className="mt-6">
                            <h5 className="text-sm font-bold text-secondary mb-3">Support</h5>
                            <ul className="space-y-2">
                                {support.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className="text-sm text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-400 font-semibold text-center md:text-left">
                            © {currentYear} GO Parcel Delivery Service. All rights reserved.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Link
                                to="/privacy"
                                className="text-sm text-gray-400 hover:text-secondary transition-colors font-semibold"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="text-sm text-gray-400 hover:text-secondary transition-colors font-semibold"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                to="/cookies"
                                className="text-sm text-gray-400 hover:text-secondary transition-colors font-semibold"
                            >
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
