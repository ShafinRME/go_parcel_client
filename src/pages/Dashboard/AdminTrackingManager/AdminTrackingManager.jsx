// src/pages/Dashboard/AdminTrackingManager/AdminTrackingManager.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useTracking from '../../../hooks/useTracking';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const AdminTrackingManager = () => {
    const axiosSecure = useAxiosSecure();
    const [parcels, setParcels] = useState([]);
    const [selectedParcelId, setSelectedParcelId] = useState('');
    const [selectedParcel, setSelectedParcel] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);

    const { trackingData, loading: trackingLoading, refetch } = useTracking(selectedParcelId);

    // Form state for new tracking update
    const [newUpdate, setNewUpdate] = useState({
        status: '',
        location: '',
        details: ''
    });

    // Edit mode state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        status: '',
        location: '',
        details: ''
    });

    // Fetch all parcels on mount
    useEffect(() => {
        fetchParcels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchParcels = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/parcels');
            setParcels(response.data);
        } catch (error) {
            console.error('Error fetching parcels:', error);
            Swal.fire('Error', 'Failed to load parcels', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle parcel selection
    const handleParcelSelect = (e) => {
        const parcelId = e.target.value;
        setSelectedParcelId(parcelId);

        const parcel = parcels.find(p => p._id === parcelId);
        setSelectedParcel(parcel);

        // Reset forms
        setNewUpdate({ status: '', location: '', details: '' });
        setEditingId(null);
    };

    // Handle create new tracking update
    const handleCreateUpdate = async (e) => {
        e.preventDefault();

        if (!newUpdate.status || !newUpdate.location) {
            Swal.fire('Error', 'Status and Location are required', 'error');
            return;
        }

        try {
            const response = await axiosSecure.post('/trackings/admin', {
                parcel_id: selectedParcelId,
                status: newUpdate.status,
                location: newUpdate.location,
                details: newUpdate.details
            });

            if (response.data) {
                Swal.fire('Success', 'Tracking update created successfully', 'success');
                setNewUpdate({ status: '', location: '', details: '' });
                refetch();
                fetchParcels(); // Refresh to get updated parcel status
            }
        } catch (error) {
            console.error('Error creating tracking update:', error);
            Swal.fire('Error', 'Failed to create tracking update', 'error');
        }
    };

    // Handle edit tracking update
    const startEdit = (update) => {
        setEditingId(update._id);
        setEditForm({
            status: update.status,
            location: update.location,
            details: update.details || ''
        });
    };

    const handleUpdateEdit = async (trackingId) => {
        try {
            const response = await axiosSecure.patch(`/trackings/${trackingId}`, editForm);

            if (response.data) {
                Swal.fire('Success', 'Tracking update modified successfully', 'success');
                setEditingId(null);
                refetch();
            }
        } catch (error) {
            console.error('Error updating tracking:', error);
            Swal.fire('Error', 'Failed to update tracking', 'error');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ status: '', location: '', details: '' });
    };

    // Handle delete tracking update
    const handleDelete = async (trackingId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This tracking update will be deleted",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axiosSecure.delete(`/trackings/${trackingId}`);
                Swal.fire('Deleted!', 'Tracking update has been deleted.', 'success');
                refetch();
            } catch (error) {
                console.error('Error deleting tracking:', error);
                Swal.fire('Error', 'Failed to delete tracking update', 'error');
            }
        }
    };

    // Status options
    const statusOptions = [
        { value: 'not_collected', label: 'Not Collected' },
        { value: 'rider_assigned', label: 'Rider Assigned' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'service_center_delivered', label: 'Service Center Delivered' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Tracking Manager</h1>
                    <p className="text-gray-600 mt-2">Manage parcel tracking updates</p>
                </div>

                {/* Parcel Selection */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Parcel
                    </label>
                    <select
                        value={selectedParcelId}
                        onChange={handleParcelSelect}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select a Parcel --</option>
                        {parcels.map(parcel => (
                            <option key={parcel._id} value={parcel._id}>
                                {parcel._id} - {parcel.receiver_name} ({parcel.delivery_status})
                            </option>
                        ))}
                    </select>

                    {selectedParcel && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Selected Parcel Details:</h3>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Receiver:</span>{' '}
                                    <span className="font-semibold">{selectedParcel.receiver_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Phone:</span>{' '}
                                    <span className="font-semibold">{selectedParcel.receiver_phone}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Current Status:</span>{' '}
                                    <span className="font-semibold">{selectedParcel.delivery_status}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Weight:</span>{' '}
                                    <span className="font-semibold">{selectedParcel.weight} KG</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create New Tracking Update */}
                {selectedParcelId && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaPlus className="text-green-600" />
                            Add New Tracking Update
                        </h2>

                        <form onSubmit={handleCreateUpdate} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={newUpdate.status}
                                        onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">-- Select Status --</option>
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={newUpdate.location}
                                        onChange={(e) => setNewUpdate({ ...newUpdate, location: e.target.value })}
                                        placeholder="e.g., Dhaka Hub, Chittagong Station"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Details (Optional)
                                </label>
                                <textarea
                                    value={newUpdate.details}
                                    onChange={(e) => setNewUpdate({ ...newUpdate, details: e.target.value })}
                                    placeholder="Additional information about this update..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaPlus />
                                Create Tracking Update
                            </button>
                        </form>
                    </div>
                )}

                {/* Tracking History */}
                {selectedParcelId && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-500" />
                            Tracking History
                        </h2>

                        {trackingLoading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : trackingData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No tracking updates yet. Create one above.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trackingData.map((update) => (
                                    <div key={update._id} className="border border-gray-200 rounded-lg p-4">
                                        {editingId === update._id ? (
                                            // Edit Mode
                                            <div className="space-y-3">
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                            Status
                                                        </label>
                                                        <select
                                                            value={editForm.status}
                                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        >
                                                            {statusOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                            Location
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editForm.location}
                                                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Details
                                                    </label>
                                                    <textarea
                                                        value={editForm.details}
                                                        onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                                                        rows="2"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    ></textarea>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateEdit(update._id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                                    >
                                                        <FaSave />
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                                                    >
                                                        <FaTimes />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {update.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {format(new Date(update.timestamp), 'MMM dd, yyyy - hh:mm a')}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEdit(update)}
                                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(update._id)}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                                    <FaMapMarkerAlt className="text-red-500" />
                                                    <span className="font-semibold">{update.location}</span>
                                                </div>

                                                {update.details && (
                                                    <p className="text-gray-600 text-sm">{update.details}</p>
                                                )}

                                                {update.updated_by && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Updated by: {update.updated_by}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTrackingManager;
