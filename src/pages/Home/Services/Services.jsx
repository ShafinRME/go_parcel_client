import React from 'react';
import { FaShippingFast, FaMapMarkedAlt, FaBoxes, FaMoneyBillAlt, FaBuilding, FaUndoAlt } from 'react-icons/fa';

const Services = () => {
    const services = [
        {
            icon: FaShippingFast,
            title: "Express Delivery",
            description: "Same-day and next-day delivery options for urgent parcels. Get your packages delivered in record time with our express service.",
            color: "from-blue-500 to-blue-600",
            delay: 0
        },
        {
            icon: FaMapMarkedAlt,
            title: "Nationwide Coverage",
            description: "Complete coverage across all 64 districts of Bangladesh. From major cities to remote villages, we deliver everywhere.",
            color: "from-green-500 to-green-600",
            delay: 100
        },
        {
            icon: FaBoxes,
            title: "Bulk Shipping",
            description: "Special rates and dedicated support for businesses shipping multiple parcels. Volume discounts available for regular customers.",
            color: "from-purple-500 to-purple-600",
            delay: 200
        },
        {
            icon: FaMoneyBillAlt,
            title: "Cash on Delivery",
            description: "Flexible payment options including COD service. Your customers pay when they receive their orders, we transfer funds to you.",
            color: "from-yellow-500 to-orange-500",
            delay: 0
        },
        {
            icon: FaBuilding,
            title: "Corporate Solutions",
            description: "Dedicated account managers, priority pickup, and customized solutions for enterprises and growing businesses.",
            color: "from-red-500 to-red-600",
            delay: 100
        },
        {
            icon: FaUndoAlt,
            title: "Easy Returns",
            description: "Hassle-free return pickup service. Schedule return pickups with a single click and process refunds quickly.",
            color: "from-indigo-500 to-indigo-600",
            delay: 200
        }
    ];

    return (
        <div className="w-full bg-gradient-to-b from-white to-gray-50 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div 
                    className="text-center mb-16"
                    data-aos="fade-up"
                    data-aos-duration="800"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-base-200 mb-4">
                        Our Services
                    </h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Enjoy fast, reliable parcel delivery with real-time tracking and zero hassle. From personal packages to business shipments — we deliver on time, every time.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            data-aos="fade-up"
                            data-aos-duration="800"
                            data-aos-delay={service.delay}
                            className="group"
                        >
                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border border-gray-100 hover:border-secondary relative overflow-hidden">
                                {/* Background Gradient Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                                {/* Icon */}
                                <div className="relative">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                        <service.icon className="text-white text-3xl" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-base-200 mb-3 group-hover:text-base-300 transition-colors duration-300">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>

                                {/* Hover Arrow */}
                                <div className="mt-6 flex items-center text-secondary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                                    <span className="font-semibold mr-2">Learn More</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div 
                    className="mt-16 text-center"
                    data-aos="fade-up"
                    data-aos-duration="800"
                    data-aos-delay="300"
                >
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-2xl shadow-lg p-6 border-2 border-secondary">
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-base-200 mb-2">
                                Need a Custom Solution?
                            </h3>
                            <p className="text-gray-600">
                                Contact our team for personalized delivery plans
                            </p>
                        </div>
                        <button className="px-8 py-3 bg-secondary text-base-200 rounded-lg font-bold hover:bg-secondary/90 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap">
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;
