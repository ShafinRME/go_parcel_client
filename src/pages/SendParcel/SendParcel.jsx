import { useForm } from "react-hook-form";
import Swal from 'sweetalert2';
import { useLoaderData, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useTrackingLogger from "../../hooks/useTrackingLogger";

const generateTrackingID = () => {
    const date = new Date();
    const datePart = date.toISOString().split("T")[0].replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `PCL-${datePart}-${rand}`;
};

const SendParcel = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const { logTracking } = useTrackingLogger();

    const serviceCenters = useLoaderData();
    // Extract unique regions
    const uniqueRegions = [...new Set(serviceCenters.map((w) => w.region))];
    // Get districts by region
    const getDistrictsByRegion = (region) =>
        serviceCenters.filter((w) => w.region === region).map((w) => w.district);

    const parcelType = watch("type");
    const senderRegion = watch("sender_region");
    const receiverRegion = watch("receiver_region");

    const onSubmit = (data) => {
        const weight = parseFloat(data.weight) || 0;
        const isSameDistrict = data.sender_center === data.receiver_center;

        let baseCost = 0;
        let extraCost = 0;
        let breakdown = "";

        if (data.type === "document") {
            baseCost = isSameDistrict ? 60 : 80;
            breakdown = `Document delivery ${isSameDistrict ? "within" : "outside"} the district.`;
        } else {
            if (weight <= 3) {
                baseCost = isSameDistrict ? 110 : 150;
                breakdown = `Non-document up to 3kg ${isSameDistrict ? "within" : "outside"} the district.`;
            } else {
                const extraKg = weight - 3;
                const perKgCharge = extraKg * 40;
                const districtExtra = isSameDistrict ? 0 : 40;
                baseCost = isSameDistrict ? 110 : 150;
                extraCost = perKgCharge + districtExtra;

                breakdown = `
        Non-document over 3kg ${isSameDistrict ? "within" : "outside"} the district.<br/>
        Extra charge: ৳40 x ${extraKg.toFixed(1)}kg = ৳${perKgCharge}<br/>
        ${districtExtra ? "+ ৳40 extra for outside district delivery" : ""}
      `;
            }
        }

        const totalCost = baseCost + extraCost;

        Swal.fire({
            title: "Delivery Cost Breakdown",
            icon: "info",
            html: `
      <div class="text-left text-base space-y-2">
        <p><strong>Parcel Type:</strong> ${data.type}</p>
        <p><strong>Weight:</strong> ${weight} kg</p>
        <p><strong>Delivery Zone:</strong> ${isSameDistrict ? "Within Same District" : "Outside District"}</p>
        <hr class="my-2"/>
        <p><strong>Base Cost:</strong> ৳${baseCost}</p>
        ${extraCost > 0 ? `<p><strong>Extra Charges:</strong> ৳${extraCost}</p>` : ""}
        <div class="text-gray-500 text-sm">${breakdown}</div>
        <hr class="my-2"/>
        <p class="text-xl font-bold text-green-600">Total Cost: ৳${totalCost}</p>
      </div>
    `,
            showDenyButton: true,
            confirmButtonText: "💳 Proceed to Payment",
            denyButtonText: "✏️ Continue Editing",
            confirmButtonColor: "#16a34a",
            denyButtonColor: "#d3d3d3",
            customClass: {
                popup: "rounded-xl shadow-md px-6 py-6",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const tracking_id = generateTrackingID();
                const parcelData = {
                    ...data,
                    cost: totalCost,
                    created_by: user.email,
                    payment_status: 'unpaid',
                    delivery_status: 'not_collected',
                    creation_date: new Date().toISOString(),
                    tracking_id: tracking_id,
                };

                console.log("Ready for payment:", parcelData);

                axiosSecure.post('/parcels', parcelData)
                    .then(async (res) => {
                        console.log(res.data);
                        if (res.data.insertedId) {
                            // TODO: redirect to a payment page 
                            Swal.fire({
                                title: "Redirecting...",
                                text: "Proceeding to payment gateway.",
                                icon: "success",
                                timer: 1500,
                                showConfirmButton: false,
                            });
                            await logTracking({
                                tracking_id: parcelData.tracking_id,
                                status: "parcel_created",
                                details: `Created by ${user.displayName}`,
                                updated_by: user.email,
                            });
                            navigate('/dashboard/myParcels');
                        }
                    })

            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EAECED] via-[#f5f5f5] to-[#e0e7ea] py-8 px-4 font-urbanist">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <svg width="400" height="100" viewBox="0 0 400 100" className="text-[#018790]">
                            <path d="M50 50 L100 30 L150 50 L100 70 Z" fill="currentColor"/>
                            <path d="M200 50 L250 30 L300 50 L250 70 Z" fill="currentColor"/>
                            <rect x="320" y="40" width="60" height="20" fill="currentColor"/>
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-[#001F3D] mb-2 tracking-tight relative">
                        Send a Parcel
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#018790] to-[#CAEB66] mx-auto mb-3"></div>
                    <p className="text-[#706f6f] text-lg">Fill in the details below to ship your package</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Parcel Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl border-l-4 border-[#018790] p-8 transform transition-all duration-300 hover:shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#018790] to-[#CAEB66] rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[#001F3D]">Parcel Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Parcel Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                    Parcel Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("title", { required: true })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all duration-200"
                                    placeholder="e.g., Electronics, Documents, Clothing"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <span>⚠</span> Parcel name is required
                                    </p>
                                )}
                            </div>

                            {/* Type */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#001F3D] mb-3">
                                    Parcel Type <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="document"
                                            {...register("type", { required: true })}
                                            className="peer sr-only"
                                        />
                                        <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl peer-checked:border-[#018790] peer-checked:bg-[#018790]/5 transition-all duration-200 hover:border-[#018790]/50">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-[#018790] peer-checked:bg-[#018790] flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full hidden peer-checked:block"></div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#001F3D]">Document</p>
                                                <p className="text-xs text-[#706f6f]">Papers, certificates, letters</p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="non-document"
                                            {...register("type", { required: true })}
                                            className="peer sr-only"
                                        />
                                        <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl peer-checked:border-[#018790] peer-checked:bg-[#018790]/5 transition-all duration-200 hover:border-[#018790]/50">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-[#018790] peer-checked:bg-[#018790] flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full hidden peer-checked:block"></div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#001F3D]">Non-Document</p>
                                                <p className="text-xs text-[#706f6f]">Products, packages, goods</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {errors.type && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <span>⚠</span> Parcel type is required
                                    </p>
                                )}
                            </div>

                            {/* Weight */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#001F3D] mb-2">
                                    Weight (kg) {parcelType !== "non-document" && <span className="text-[#706f6f] font-normal text-xs">(Not applicable for documents)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register("weight")}
                                        disabled={parcelType !== "non-document"}
                                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 ${
                                            parcelType !== "non-document" 
                                                ? "bg-gray-50 cursor-not-allowed text-gray-400" 
                                                : "focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20"
                                        }`}
                                        placeholder="Enter weight in kilograms"
                                    />
                                    <span className="absolute right-4 top-3 text-[#706f6f]">kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sender & Receiver Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sender Info */}
                        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-[#CAEB66] p-8 transform transition-all duration-300 hover:shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#CAEB66] to-[#018790] rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#001F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[#001F3D]">Sender Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("sender_name", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CAEB66] focus:ring-2 focus:ring-[#CAEB66]/20 outline-none transition-all"
                                        placeholder="Enter sender's name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Contact Number <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("sender_contact", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CAEB66] focus:ring-2 focus:ring-[#CAEB66]/20 outline-none transition-all"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Region <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("sender_region", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CAEB66] focus:ring-2 focus:ring-[#CAEB66]/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select Region</option>
                                        {uniqueRegions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Service Center <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("sender_center", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CAEB66] focus:ring-2 focus:ring-[#CAEB66]/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select Service Center</option>
                                        {getDistrictsByRegion(senderRegion).map((district) => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Address <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("sender_address", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CAEB66] focus:ring-2 focus:ring-[#CAEB66]/20 outline-none transition-all"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Pickup Instructions <span className="text-red-500">*</span></label>
                                    <textarea
                                        {...register("pickup_instruction", { required: true })}
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#CAEB66] focus:ring-2 focus:ring-[#CAEB66]/20 outline-none transition-all resize-none"
                                        placeholder="Special instructions for pickup..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Receiver Info */}
                        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-[#018790] p-8 transform transition-all duration-300 hover:shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#018790] to-[#001F3D] rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-[#001F3D]">Receiver Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("receiver_name", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        placeholder="Enter receiver's name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Contact Number <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("receiver_contact", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Region <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("receiver_region", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select Region</option>
                                        {uniqueRegions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Service Center <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("receiver_center", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select Service Center</option>
                                        {getDistrictsByRegion(receiverRegion).map((district) => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Address <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("receiver_address", { required: true })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#001F3D] mb-2">Delivery Instructions <span className="text-red-500">*</span></label>
                                    <textarea
                                        {...register("delivery_instruction", { required: true })}
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/20 outline-none transition-all resize-none"
                                        placeholder="Special instructions for delivery..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center pt-4">
                        <button 
                            type="submit"
                            className="group relative px-12 py-4 bg-gradient-to-r from-[#018790] to-[#CAEB66] text-[#001F3D] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2 justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Send Parcel
                            </span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendParcel;
