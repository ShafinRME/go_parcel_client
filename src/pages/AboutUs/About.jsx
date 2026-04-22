import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaRocket, FaEye, FaHeart, FaUsers, FaShieldAlt, FaTruck, FaClock, FaAward } from "react-icons/fa";
import { MdSpeed, MdVerifiedUser, MdLocalShipping } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router";

const About = () => {
    const [activeTab, setActiveTab] = useState("story");

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    // Company values
    const values = [
        {
            icon: <FaShieldAlt className="text-4xl" />,
            title: "Reliability",
            description: "Every parcel matters. We ensure safe, timely delivery every single time."
        },
        {
            icon: <FaHeart className="text-4xl" />,
            title: "Customer First",
            description: "Your satisfaction drives everything we do. We're here to serve you better."
        },
        {
            icon: <MdSpeed className="text-4xl" />,
            title: "Speed",
            description: "Time is precious. We deliver with urgency while maintaining quality."
        },
        {
            icon: <BiSupport className="text-4xl" />,
            title: "Support",
            description: "24/7 customer support because your concerns can't wait."
        }
    ];

    // Statistics
    const stats = [
        { number: "50K+", label: "Deliveries" },
        { number: "98%", label: "On-Time Rate" },
        { number: "10K+", label: "Happy Customers" },
        { number: "24/7", label: "Support" }
    ];

    // Features
    const features = [
        {
            icon: <FaTruck />,
            title: "Real-Time Tracking",
            description: "Track your parcel every step of the way with live updates"
        },
        {
            icon: <MdVerifiedUser />,
            title: "Secure Delivery",
            description: "End-to-end security with verified riders and insurance"
        },
        {
            icon: <FaClock />,
            title: "Fast Shipping",
            description: "Same-day and next-day delivery options available"
        },
        {
            icon: <FaAward />,
            title: "Quality Service",
            description: "Award-winning customer service and satisfaction"
        }
    ];

    // Tab content
    const tabContent = {
        story: {
            title: "Our Story",
            icon: <FaRocket />,
            content: [
                "GO Parcel was born from a simple observation: parcel delivery should be simple, reliable, and stress-free. Founded in 2020, we started with a mission to revolutionize how parcels move across Bangladesh.",
                "What began as a small team with big dreams has grown into a trusted delivery network serving thousands of customers daily. We've built our reputation on three pillars: reliability, speed, and customer care.",
                "Today, we're proud to be one of the fastest-growing delivery services in the country, but we haven't forgotten our roots. Every parcel we deliver carries the same care and attention as our very first delivery.",
                "We believe in the power of connection - connecting businesses to customers, families to loved ones, and communities to opportunities. That's what drives us forward every single day."
            ]
        },
        mission: {
            title: "Our Mission",
            icon: <FaEye />,
            content: [
                "Our mission is clear: to provide the most reliable, efficient, and customer-focused parcel delivery service in Bangladesh.",
                "We're committed to leveraging technology and innovation to make delivery seamless. From our intuitive tracking system to our efficient routing algorithms, everything we build is designed with you in mind.",
                "We aim to be more than just a delivery service - we want to be a partner in your success. Whether you're a business shipping products or an individual sending a gift, we're here to make it happen.",
                "Sustainability and community impact are at the heart of what we do. We're actively working to reduce our carbon footprint and create opportunities for local riders and businesses."
            ]
        },
        vision: {
            title: "Our Vision",
            icon: <FaUsers />,
            content: [
                "We envision a future where delivery is instant, transparent, and accessible to everyone, everywhere in Bangladesh.",
                "Our vision extends beyond just moving parcels. We see GO Parcel as a catalyst for economic growth, enabling businesses of all sizes to reach their customers efficiently and affordably.",
                "We're building towards a smart delivery ecosystem powered by AI, automation, and sustainable practices. Imagine drones, electric vehicles, and intelligent routing - that's where we're headed.",
                "By 2030, we aim to be the undisputed leader in Bangladesh's delivery industry, known not just for speed and reliability, but for innovation, sustainability, and positive social impact."
            ]
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary/5">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-300 to-base-200 text-white"
            >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white to-secondary bg-clip-text text-transparent">
                            About GO Parcel
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto font-light">
                            Delivering more than parcels - we deliver trust, speed, and reliability.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                            >
                                <h3 className="text-4xl lg:text-5xl font-bold text-secondary mb-2">
                                    {stat.number}
                                </h3>
                                <p className="text-gray-200 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Tabs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 mb-16"
                >
                    {/* Tab Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {Object.keys(tabContent).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${activeTab === tab
                                    ? "bg-gradient-to-r from-secondary to-secondary/80 text-base-200 shadow-lg scale-105"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                                    }`}
                            >
                                <span className="text-2xl">{tabContent[tab].icon}</span>
                                <span className="capitalize">{tabContent[tab].title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-secondary/20">
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary text-3xl">
                                {tabContent[activeTab].icon}
                            </div>
                            <h2 className="text-4xl font-bold text-base-200">
                                {tabContent[activeTab].title}
                            </h2>
                        </div>

                        <div className="space-y-5 text-gray-700 leading-relaxed">
                            {tabContent[activeTab].content.map((paragraph, index) => (
                                <motion.p
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="text-lg pl-4 border-l-4 border-secondary/30"
                                >
                                    {paragraph}
                                </motion.p>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Values Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl lg:text-5xl font-bold text-base-200 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary/30 hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {value.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-base-200 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gradient-to-br from-base-200 to-base-300 rounded-3xl p-8 lg:p-16 text-white"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                            Why Choose GO Parcel?
                        </h2>
                        <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                            Experience the difference with our premium features
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                            >
                                <div className="text-5xl text-secondary mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-200 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16 text-center bg-white rounded-3xl shadow-xl p-12 border border-gray-100"
                >
                    <h2 className="text-3xl lg:text-4xl font-bold text-base-200 mb-4">
                        Ready to Experience GO Parcel?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust us with their deliveries
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/sendParcel">
                            <button className="px-10 py-4 bg-gradient-to-r from-secondary to-secondary/90 text-base-200 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                Send a Parcel
                            </button>
                        </Link>
                        <button className="px-10 py-4 bg-base-300 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                            Contact Us
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
