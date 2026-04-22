import React from 'react';
import { FaStore, FaTruck, FaChartLine, FaHandshake, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import { Link } from 'react-router';

const BeMerchant = () => {
    const benefits = [
        {
            icon: FaTruck,
            title: "Lowest Delivery Rates",
            description: "Competitive pricing with no hidden fees"
        },
        {
            icon: FaShieldAlt,
            title: "100% Safe Delivery",
            description: "Full insurance on all parcels"
        },
        {
            icon: FaChartLine,
            title: "Business Analytics",
            description: "Track and optimize your shipping"
        },
        {
            icon: FaHandshake,
            title: "Dedicated Support",
            description: "Priority customer service for merchants"
        }
    ];

    const riderBenefits = [
        {
            icon: FaRocket,
            title: "Flexible Hours",
            text: "Work on your schedule"
        },
        {
            icon: MdLocalShipping,
            title: "Daily Earnings",
            text: "Get paid every day"
        },
        {
            icon: FaShieldAlt,
            title: "Insurance",
            text: "Full coverage provided"
        }
    ];

    return (
        <div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Main Merchant Section */}
                <div 
                    className="bg-gradient-to-br from-base-200 to-base-300 rounded-3xl overflow-hidden shadow-2xl mb-12"
                    data-aos="fade-up"
                    data-aos-duration="1000"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div className="p-8 lg:p-12" data-aos="fade-right" data-aos-duration="800" data-aos-delay="200">
                            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
                                <FaStore className="text-base-200" />
                                <span className="text-base-200 font-bold text-sm">FOR BUSINESSES</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Merchant & Customer Satisfaction is Our First Priority
                            </h2>
                            
                            <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                                Join thousands of successful businesses using our platform. We offer the lowest delivery charges with the highest value along with 100% safety of your products. Our courier delivers parcels to every corner of Bangladesh right on time.
                            </p>

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {benefits.map((benefit, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                                        data-aos="fade-up"
                                        data-aos-duration="600"
                                        data-aos-delay={300 + (index * 100)}
                                    >
                                        <benefit.icon className="text-secondary text-2xl mb-2" />
                                        <h4 className="text-white font-bold mb-1">{benefit.title}</h4>
                                        <p className="text-gray-300 text-sm">{benefit.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/beAMerchant">
                                    <button className="px-8 py-4 bg-secondary text-base-200 rounded-xl font-bold hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2">
                                        <FaStore size={20} />
                                        <span>Become a Merchant</span>
                                    </button>
                                </Link>
                                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                                    <FaChartLine size={20} />
                                    <span>View Pricing</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Image/Illustration */}
                        <div className="relative p-8 lg:p-12" data-aos="fade-left" data-aos-duration="800" data-aos-delay="400">
                            <div className="relative">
                                {/* Decorative circles */}
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-secondary rounded-full opacity-20 animate-pulse"></div>
                                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary rounded-full opacity-20 animate-pulse delay-75"></div>
                                
                                {/* Main illustration container */}
                                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                    <div className="aspect-square max-w-md mx-auto flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-40 h-40 bg-gradient-to-br from-secondary to-green-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                                                <FaStore className="text-6xl text-base-200" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Join 10,000+ Merchants</h3>
                                            <p className="text-gray-200">Growing their business with us</p>
                                            
                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="bg-white/10 rounded-lg p-3">
                                                    <div className="text-3xl font-bold text-secondary">99%</div>
                                                    <div className="text-sm text-gray-300">Satisfaction</div>
                                                </div>
                                                <div className="bg-white/10 rounded-lg p-3">
                                                    <div className="text-3xl font-bold text-secondary">24/7</div>
                                                    <div className="text-sm text-gray-300">Support</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rider Section */}
                <div 
                    className="bg-gradient-to-br from-secondary to-green-400 rounded-3xl p-8 md:p-12 shadow-2xl"
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    data-aos-delay="200"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div data-aos="fade-right" data-aos-duration="800" data-aos-delay="400">
                            <div className="inline-flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full mb-6">
                                <MdLocalShipping className="text-secondary" />
                                <span className="text-secondary font-bold text-sm">FOR RIDERS</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-bold text-base-200 mb-4">
                                Earn with Our Courier Service
                            </h2>
                            
                            <p className="text-base-200/80 text-lg mb-6">
                                Become a delivery partner and earn on your own schedule. We provide the best earning opportunities with full support and insurance coverage.
                            </p>

                            {/* Benefits */}
                            <div className="space-y-3 mb-8">
                                {riderBenefits.map((benefit, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4"
                                        data-aos="fade-up"
                                        data-aos-duration="600"
                                        data-aos-delay={500 + (index * 100)}
                                    >
                                        <div className="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="text-secondary text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="text-base-200 font-bold">{benefit.title}</h4>
                                            <p className="text-base-200/70 text-sm">{benefit.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link to="/beARider">
                                <button className="px-8 py-4 bg-base-200 text-secondary rounded-xl font-bold hover:bg-base-200/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                                    <MdLocalShipping size={24} />
                                    <span>Join as Rider</span>
                                </button>
                            </Link>
                        </div>

                        {/* Right Stats */}
                        <div data-aos="fade-left" data-aos-duration="800" data-aos-delay="600">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                                <h3 className="text-2xl font-bold text-base-200 mb-6 text-center">
                                    Average Rider Earnings
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                                        <div className="text-4xl font-bold text-base-200 mb-2">৳800</div>
                                        <div className="text-gray-600 font-semibold">Per Day</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                                        <div className="text-4xl font-bold text-base-200 mb-2">৳24K</div>
                                        <div className="text-gray-600 font-semibold">Per Month</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 text-center shadow-lg col-span-2">
                                        <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                                        <div className="text-gray-600 font-semibold">Active Riders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeMerchant;
