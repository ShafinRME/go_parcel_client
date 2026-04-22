import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "How fast is your delivery service?",
            answer: "We offer same-day delivery for parcels booked before 12 PM within the same city. For inter-city deliveries, we guarantee delivery within 24-48 hours. Our express service can deliver urgent parcels within 3-6 hours in major cities."
        },
        {
            question: "How can I track my parcel?",
            answer: "You can track your parcel in real-time using your unique tracking ID. Simply enter the tracking number on our website or mobile app, and you'll see live updates including pickup, transit, and delivery status with estimated arrival times."
        },
        {
            question: "What areas do you cover?",
            answer: "We provide nationwide coverage across Bangladesh, serving all 64 districts. Our extensive network includes major cities, towns, and remote areas. We have pickup and delivery points in every district to ensure comprehensive service."
        },
        {
            question: "Is my parcel insured during delivery?",
            answer: "Yes, all parcels are automatically insured up to ৳10,000 at no extra cost. For higher-value items, you can purchase additional insurance coverage during booking. We take full responsibility for any loss or damage during transit."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept multiple payment methods including Cash on Delivery (COD), bKash, Nagad, Rocket, credit/debit cards, and bank transfers. For business accounts, we also offer monthly invoicing options."
        },
        {
            question: "Can I schedule a pickup from my location?",
            answer: "Absolutely! You can schedule a pickup at your preferred time and location through our website or mobile app. Our riders will come to your doorstep to collect the parcel. Pickup services are available 7 days a week from 9 AM to 9 PM."
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div
            className="w-full bg-gradient-to-b from-gray-50 to-white py-16 px-4"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-once="true"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
                        <FaQuestionCircle className="text-3xl text-base-200" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-base-200 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Get answers to common questions about our delivery service, pricing, and coverage areas
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${openIndex === index ? 'border-secondary' : 'border-transparent'
                                }`}
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                            >
                                <span className="text-lg font-semibold text-base-200 pr-4">
                                    {faq.question}
                                </span>
                                <FaChevronDown
                                    className={`text-secondary flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                    size={20}
                                />
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-5 pt-2 animate-fadeIn">
                                    <div className="h-px bg-gradient-to-r from-transparent via-secondary to-transparent mb-4"></div>
                                    <p className="text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-12 text-center bg-gradient-to-r from-base-200 to-base-300 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Still have questions?
                    </h3>
                    <p className="text-gray-200 mb-6">
                        Our support team is here to help you 24/7
                    </p>
                    <button className="px-8 py-3 bg-secondary text-base-200 rounded-lg font-bold hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                        Contact Support
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default FAQ;