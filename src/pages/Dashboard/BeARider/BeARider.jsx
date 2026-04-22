import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLoaderData } from "react-router";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const BeARider = () => {
    const { user } = useAuth();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [selectedRegion, setSelectedRegion] = useState("");
    const axiosSecure = useAxiosSecure();

    const serviceCenters = useLoaderData();

    const regions = [...new Set(serviceCenters.map((s) => s.region))];
    const districts = serviceCenters
        .filter((s) => s.region === selectedRegion)
        .map((s) => s.district);

    const onSubmit = async (data) => {
        const riderData = {
            ...data,
            name: user?.displayName || "",
            email: user?.email || "",
            status: "pending",
            created_at: new Date().toISOString(),
        };

        console.log("Rider Application:", riderData);

        axiosSecure.post('/riders', riderData)
            .then(res => {
                if (res.data.insertedId) {
                    Swal.fire({
                        icon: "success",
                        title: "Application Submitted!",
                        text: "Your application is pending approval.",
                    });
                }
            })

        // Send to your backend here
        reset();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EAECED] via-[#f5f5f5] to-[#e0e7ea] py-12 px-4 font-urbanist">
            <div className="max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-10 relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <svg width="300" height="300" viewBox="0 0 300 300">
                            <circle cx="150" cy="150" r="100" stroke="#018790" strokeWidth="2" fill="none"/>
                            <path d="M150 50 L180 100 L150 90 L120 100 Z" fill="#CAEB66"/>
                            <rect x="120" y="100" width="60" height="80" rx="5" fill="#018790"/>
                            <circle cx="130" cy="190" r="15" fill="#001F3D"/>
                            <circle cx="170" cy="190" r="15" fill="#001F3D"/>
                        </svg>
                    </div>

                    <div className="relative">
                        <h1 className="text-5xl font-bold text-[#001F3D] mb-3 tracking-tight">
                            Become a Rider
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#018790] to-[#CAEB66] mx-auto mb-4"></div>
                        <p className="text-[#706f6f] text-lg max-w-2xl mx-auto">
                            Join our delivery team and earn while you ride. Fill out the application form below to get started.
                        </p>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#CAEB66] transform transition-all hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#CAEB66]/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#018790]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#001F3D]">Flexible Earnings</h3>
                                <p className="text-sm text-[#706f6f]">Work on your schedule</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#018790] transform transition-all hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#018790]/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#018790]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#001F3D]">Insurance Coverage</h3>
                                <p className="text-sm text-[#706f6f]">Protected on the road</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-[#001F3D] transform transition-all hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#001F3D]/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#018790]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#001F3D]">Quick Onboarding</h3>
                                <p className="text-sm text-[#706f6f]">Start within 48 hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border-t-4 border-[#018790]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#018790] to-[#CAEB66] rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#001F3D]">Application Form</h2>
                            <p className="text-sm text-[#706f6f]">All fields marked with * are required</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#001F3D] flex items-center gap-2 pb-2 border-b-2 border-[#CAEB66]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name (read-only) */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={user?.displayName || ""}
                                            readOnly
                                            className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl bg-gray-50 text-[#706f6f] cursor-not-allowed"
                                        />
                                        <svg className="w-5 h-5 text-[#706f6f] absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Email (read-only) */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            readOnly
                                            className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl bg-gray-50 text-[#706f6f] cursor-not-allowed"
                                        />
                                        <svg className="w-5 h-5 text-[#706f6f] absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Age */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Age <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Must be 18 or older"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        {...register("age", { required: true, min: 18 })}
                                    />
                                    {errors.age && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> You must be 18 or older
                                        </span>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g., +880 1712-345678"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        {...register("phone", { required: true })}
                                    />
                                    {errors.phone && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> Phone number is required
                                        </span>
                                    )}
                                </div>

                                {/* National ID */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        National ID Card Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your NID number"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        {...register("nid", { required: true })}
                                    />
                                    {errors.nid && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> NID is required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Service Area Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-[#001F3D] flex items-center gap-2 pb-2 border-b-2 border-[#CAEB66]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Service Area
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Region */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Region <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all bg-white"
                                        {...register("region", { required: true })}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map((region, idx) => (
                                            <option key={idx} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.region && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> Region is required
                                        </span>
                                    )}
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        District <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all ${
                                            !selectedRegion ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                                        }`}
                                        {...register("district", { required: true })}
                                        disabled={!selectedRegion}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map((district, idx) => (
                                            <option key={idx} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.district && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> District is required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Information Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-[#001F3D] flex items-center gap-2 pb-2 border-b-2 border-[#CAEB66]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Vehicle Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Bike Brand */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Bike Brand & Model <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Yamaha FZ, Honda CB150"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        {...register("bike_brand", { required: true })}
                                    />
                                    {errors.bike_brand && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> Bike brand is required
                                        </span>
                                    )}
                                </div>

                                {/* Bike Registration */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                        Registration Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., DHAKA METRO-GA-11-2345"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        {...register("bike_registration", { required: true })}
                                    />
                                    {errors.bike_registration && (
                                        <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠</span> Registration number is required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Section */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-[#001F3D] flex items-center gap-2 pb-2 border-b-2 border-[#CAEB66]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Additional Information
                            </h3>

                            <div>
                                <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                    Tell us about yourself (Optional)
                                </label>
                                <textarea
                                    placeholder="Any relevant experience, availability, or other information you'd like to share..."
                                    rows="4"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all resize-none"
                                    {...register("note")}
                                ></textarea>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button 
                                type="submit" 
                                className="group relative w-full py-4 bg-gradient-to-r from-[#018790] to-[#CAEB66] text-[#001F3D] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Submit Rider Application
                                </span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </button>
                        </div>

                        {/* Info Notice */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-1">Application Review Process</h4>
                                    <p className="text-sm text-blue-700">
                                        Your application will be reviewed within 24-48 hours. We'll contact you via email or phone 
                                        to schedule an orientation session if approved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BeARider;
