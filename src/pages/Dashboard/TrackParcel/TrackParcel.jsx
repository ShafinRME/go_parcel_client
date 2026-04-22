// src/pages/Dashboard/TrackParcel/TrackParcel.jsx
import React, { useState } from 'react';
import { FaSearch, FaBox, FaMapMarkerAlt, FaCheckCircle, FaTruck, FaWarehouse, FaSpinner } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useTracking from '../../../hooks/useTracking';
import { format } from 'date-fns';

const TrackParcel = () => {
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParcelId, setSelectedParcelId] = useState(null);
    const [parcelDetails, setParcelDetails] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const { trackingData, loading: trackingLoading, error: trackingError, refetch } = useTracking(selectedParcelId);

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setSearchError('Please enter a tracking ID');
            return;
        }

        setIsSearching(true);
        setSearchError('');
        setParcelDetails(null);
        setSelectedParcelId(null);

        try {
            // Search for the parcel by ID
            const response = await axiosSecure.get(`/parcels/${searchQuery.trim()}`);

            if (response.data) {
                setParcelDetails(response.data);
                setSelectedParcelId(response.data._id);
            }
        } catch (error) {
            console.error('Error searching parcel:', error);
            setSearchError('Parcel not found. Please check the tracking ID.');
        } finally {
            setIsSearching(false);
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const statusMap = {
            'not_collected': <FaBox className="text-gray-500" size={24} />,
            'rider_assigned': <MdLocalShipping className="text-blue-500" size={24} />,
            'in_transit': <FaTruck className="text-orange-500" size={24} />,
            'delivered': <FaCheckCircle className="text-green-500" size={24} />,
            'service_center_delivered': <FaWarehouse className="text-teal-500" size={24} />,
        };
        return statusMap[status] || <FaBox className="text-gray-500" size={24} />;
    };

    // Get status color
    const getStatusColor = (status) => {
        const colorMap = {
            'not_collected': 'bg-gray-100 text-gray-700',
            'rider_assigned': 'bg-blue-100 text-blue-700',
            'in_transit': 'bg-orange-100 text-orange-700',
            'delivered': 'bg-green-100 text-green-700',
            'service_center_delivered': 'bg-teal-100 text-teal-700',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-700';
    };

    // Format status text
    const formatStatus = (status) => {
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Track Your Parcel
                    </h1>
                    <p className="text-gray-600">
                        Enter your tracking ID to see real-time updates
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter tracking ID (e.g., 67890abcdef12345)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSearching ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <FaSearch />
                                    Search
                                </>
                            )}
                        </button>
                    </form>

                    {searchError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {searchError}
                        </div>
                    )}
                </div>

                {/* Parcel Details */}
                {parcelDetails && (
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Left Column - Parcel Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaBox className="text-blue-600" />
                                Parcel Details
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Tracking ID</p>
                                    <p className="font-semibold text-gray-800">{parcelDetails._id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Current Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(parcelDetails.delivery_status)}`}>
                                        {formatStatus(parcelDetails.delivery_status)}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Recipient Name</p>
                                    <p className="font-semibold text-gray-800">{parcelDetails.receiver_name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                    <p className="font-semibold text-gray-800">
                                        {parcelDetails.receiver_address}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="font-semibold text-gray-800">{parcelDetails.receiver_phone}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p className="font-semibold text-gray-800">{parcelDetails.weight} KG</p>
                                </div>

                                {parcelDetails.assigned_rider_name && (
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned Rider</p>
                                        <p className="font-semibold text-gray-800">{parcelDetails.assigned_rider_name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Quick Stats */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-md p-6 text-white">
                            <h2 className="text-xl font-bold mb-4">Delivery Progress</h2>

                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-sm opacity-90">Created Date</p>
                                    <p className="text-lg font-bold">
                                        {parcelDetails.createdAt
                                            ? format(new Date(parcelDetails.createdAt), 'MMM dd, yyyy HH:mm')
                                            : 'N/A'}
                                    </p>
                                </div>

                                {parcelDetails.picked_at && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-sm opacity-90">Picked Up</p>
                                        <p className="text-lg font-bold">
                                            {format(new Date(parcelDetails.picked_at), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                )}

                                {parcelDetails.delivered_at && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-sm opacity-90">Delivered</p>
                                        <p className="text-lg font-bold">
                                            {format(new Date(parcelDetails.delivered_at), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                )}

                                {parcelDetails.last_location && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-sm opacity-90">Last Known Location</p>
                                        <p className="text-lg font-bold">{parcelDetails.last_location}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tracking Timeline */}
                {selectedParcelId && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-red-500" />
                                Tracking Updates
                            </h2>
                            <button
                                onClick={refetch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Refresh
                            </button>
                        </div>

                        {trackingLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <FaSpinner className="animate-spin text-blue-600 text-4xl" />
                            </div>
                        ) : trackingError ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                Error loading tracking data: {trackingError}
                            </div>
                        ) : trackingData.length === 0 ? (
                            <div className="text-center py-12">
                                <FaBox className="mx-auto text-gray-300 text-6xl mb-4" />
                                <p className="text-gray-500 text-lg">No tracking updates available yet</p>
                                <p className="text-gray-400 text-sm mt-2">Updates will appear here once the parcel is processed</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                {/* Timeline items */}
                                <div className="space-y-6">
                                    {trackingData.map((update, index) => (
                                        <div key={update._id || index} className="relative flex gap-6">
                                            {/* Timeline dot */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className="w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                    {getStatusIcon(update.status)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 bg-gray-50 rounded-lg p-5 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {formatStatus(update.status)}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">
                                                        {format(new Date(update.timestamp), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {format(new Date(update.timestamp), 'hh:mm a')}
                                                </p>
                                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                                    <FaMapMarkerAlt className="text-red-500" />
                                                    <span className="font-semibold">{update.location}</span>
                                                </div>
                                                {update.details && (
                                                    <p className="text-gray-600 text-sm mt-2">
                                                        {update.details}
                                                    </p>
                                                )}
                                                {update.updated_by && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Updated by: {update.updated_by}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!parcelDetails && !isSearching && !searchError && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FaSearch className="mx-auto text-gray-300 text-6xl mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Search for Your Parcel
                        </h3>
                        <p className="text-gray-500">
                            Enter your tracking ID above to see real-time updates
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackParcel;
