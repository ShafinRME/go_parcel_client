import { useState, useEffect } from 'react';
import useAxiosSecure from './useAxiosSecure';

const useTracking = (parcelId) => {
    const [trackingData, setTrackingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (!parcelId) {
            setLoading(false);
            return;
        }

        const fetchTracking = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosSecure.get(`/trackings/parcel/${parcelId}`);
                setTrackingData(response.data);
            } catch (err) {
                console.error('Error fetching tracking data:', err);
                setError(err.message || 'Failed to fetch tracking data');
            } finally {
                setLoading(false);
            }
        };

        fetchTracking();
    }, [parcelId, axiosSecure]);

    const refetch = async () => {
        if (!parcelId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await axiosSecure.get(`/trackings/parcel/${parcelId}`);
            setTrackingData(response.data);
        } catch (err) {
            console.error('Error refetching tracking data:', err);
            setError(err.message || 'Failed to refetch tracking data');
        } finally {
            setLoading(false);
        }
    };

    return { trackingData, loading, error, refetch };
};

export default useTracking;
