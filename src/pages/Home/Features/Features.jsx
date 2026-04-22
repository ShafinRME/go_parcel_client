import React from 'react';
import { FaShieldAlt, FaClock, FaMobileAlt, FaHeadset, FaChartLine, FaLock } from 'react-icons/fa';

const Features = () => {
    const features = [
        {
            icon: FaShieldAlt,
            title: "100% Safe & Secure",
            description: "Your parcels are fully insured and handled with care. We use advanced tracking systems and secure packaging to ensure your items arrive safely. Every delivery is monitored in real-time for maximum security.",
            imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop",
            color: "from-green-500 to-green-600",
            reverse: false
        },
        {
            icon: FaClock,
            title: "Real-Time Tracking",
            description: "Track your parcel every step of the way with live GPS updates. Get instant notifications when your package is picked up, in transit, out for delivery, and delivered. Know exactly where your parcel is at all times.",
            imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
            color: "from-blue-500 to-blue-600",
            reverse: true
        },
        {
            icon: FaMobileAlt,
            title: "Easy Mobile App",
            description: "Book, track, and manage all your deliveries from our user-friendly mobile app. Schedule pickups, view delivery history, download invoices, and get instant customer support - all from your smartphone.",
            imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
            color: "from-purple-500 to-purple-600",
            reverse: false
        },
        {
            icon: FaHeadset,
            title: "24/7 Customer Support",
            description: "Our dedicated support team is available round the clock to assist you. Whether you have questions about delivery status, pricing, or need help with bookings, we're just a call or message away.",
            imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
            color: "from-orange-500 to-red-500",
            reverse: true
        },
        {
            icon: FaChartLine,
            title: "Business Analytics",
            description: "For business customers, access detailed analytics and reports. Track shipping costs, delivery performance, customer satisfaction, and optimize your logistics with data-driven insights.",
            imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
            color: "from-indigo-500 to-indigo-600",
            reverse: false
        },
        {
            icon: FaLock,
            title: "Secure Payments",
            description: "Multiple secure payment options including mobile banking, cards, and COD. All transactions are encrypted and PCI-DSS compliant. Your financial information is completely safe with us.",
            imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
            color: "from-yellow-500 to-yellow-600",
            reverse: true
        }
    ];

    return (
        <div className="w-full bg-white py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div 
                    className="text-center mb-16"
                    data-aos="fade-up"
                    data-aos-duration="800"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-base-200 mb-4">
                        Why Choose Us
                    </h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Experience the perfect blend of speed, security, and reliability with our comprehensive delivery solutions
                    </p>
                </div>

                {/* Features List */}
                <div className="space-y-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            data-aos={feature.reverse ? "fade-left" : "fade-right"}
                            data-aos-duration="800"
                            data-aos-delay={index * 100}
                        >
                            <div className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary`}>
                                {/* Image Section */}
                                <div className="w-full lg:w-5/12 relative group">
                                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                                        <img 
                                            src={feature.imageUrl} 
                                            alt={feature.title}
                                            className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                                    </div>
                                    {/* Floating Icon */}
                                    <div className={`absolute -bottom-6 ${feature.reverse ? '-right-6' : '-left-6'} w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                        <feature.icon className="text-white text-3xl" />
                                    </div>
                                </div>

                                {/* Divider - Desktop Only */}
                                <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                                {/* Content Section */}
                                <div className="w-full lg:w-7/12 mt-8 lg:mt-0">
                                    <h3 className="text-3xl font-bold text-base-200 mb-4 flex items-center gap-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                                        {feature.description}
                                    </p>
                                    
                                    {/* Feature Benefits */}
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-4 py-2 bg-white border border-secondary text-secondary rounded-full text-sm font-semibold shadow-sm hover:bg-secondary hover:text-white transition-all duration-300 cursor-default">
                                            ✓ Reliable
                                        </span>
                                        <span className="px-4 py-2 bg-white border border-secondary text-secondary rounded-full text-sm font-semibold shadow-sm hover:bg-secondary hover:text-white transition-all duration-300 cursor-default">
                                            ✓ Fast
                                        </span>
                                        <span className="px-4 py-2 bg-white border border-secondary text-secondary rounded-full text-sm font-semibold shadow-sm hover:bg-secondary hover:text-white transition-all duration-300 cursor-default">
                                            ✓ Secure
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div 
                    className="my-16"
                    data-aos="fade-up"
                    data-aos-duration="800"
                >
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                {/* Bottom Stats */}
                <div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
                    data-aos="fade-up"
                    data-aos-duration="800"
                    data-aos-delay="200"
                >
                    {[
                        { number: "50K+", label: "Happy Customers" },
                        { number: "100K+", label: "Parcels Delivered" },
                        { number: "64", label: "Districts Covered" },
                        { number: "99%", label: "On-Time Delivery" }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                                {stat.number}
                            </div>
                            <div className="text-gray-600 font-semibold">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
