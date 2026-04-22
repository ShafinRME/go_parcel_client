import React from 'react';
import { FaRegCalendarAlt, FaMoneyBillAlt, FaShippingFast, FaCheckCircle } from 'react-icons/fa';

const HowWorks = () => {
    const steps = [
        {
            icon: FaRegCalendarAlt,
            title: "Book Your Delivery",
            description: "Schedule a pickup online or via our app. Enter sender and receiver details with parcel information.",
            color: "from-blue-500 to-blue-600",
            delay: 0
        },
        {
            icon: FaMoneyBillAlt,
            title: "Choose Payment",
            description: "Select your preferred payment method - pay now or choose cash on delivery for convenience.",
            color: "from-green-500 to-green-600",
            delay: 100
        },
        {
            icon: FaShippingFast,
            title: "We Deliver Fast",
            description: "Our riders pick up and deliver your parcel safely. Track in real-time from pickup to doorstep.",
            color: "from-yellow-500 to-orange-500",
            delay: 200
        },
        {
            icon: FaCheckCircle,
            title: "Delivered Successfully",
            description: "Receive instant confirmation when delivered. Rate your experience and help us improve.",
            color: "from-purple-500 to-purple-600",
            delay: 300
        }
    ];

    return (
        <div className="w-full bg-white py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div 
                    className="text-center mb-16"
                    data-aos="fade-down"
                    data-aos-duration="800"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-base-200 mb-4">
                        How It Works
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Simple, fast, and reliable delivery in just 4 easy steps
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connection Line - Desktop Only */}
                    <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-green-200 via-yellow-200 to-purple-200 -z-10"></div>

                    {steps.map((step, index) => (
                        <div
                            key={index}
                            data-aos="fade-up"
                            data-aos-duration="800"
                            data-aos-delay={step.delay}
                            className="relative"
                        >
                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-secondary group">
                                {/* Step Number */}
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-base-200 to-base-300 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">{index + 1}</span>
                                </div>

                                {/* Icon */}
                                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <step.icon className="text-white text-3xl" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-base-200 text-center mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-center leading-relaxed">
                                    {step.description}
                                </p>

                                {/* Hover Effect Border */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>

                            {/* Arrow for Mobile */}
                            {index < steps.length - 1 && (
                                <div className="lg:hidden flex justify-center my-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div 
                    className="mt-16 text-center"
                    data-aos="fade-up"
                    data-aos-duration="800"
                    data-aos-delay="400"
                >
                    <div className="bg-gradient-to-r from-base-200 to-base-300 rounded-2xl p-8 md:p-12">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Ready to Send Your Parcel?
                        </h3>
                        <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust us for fast, reliable delivery
                        </p>
                        <button className="px-8 py-4 bg-secondary text-base-200 rounded-lg font-bold hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                            Book Delivery Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowWorks;
