import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
    FaBoxOpen,
    FaShippingFast,
    FaCheckCircle,
    FaClock,
    FaMoneyBillWave,
    FaMapMarkerAlt,
    FaPlus,
    FaHistory,
    FaChartBar,
} from 'react-icons/fa';
import { MdLocalShipping, MdPending } from 'react-icons/md';
import { BiPackage } from 'react-icons/bi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const UserDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    // Fetch user's parcels
    const { data: userParcels = [], isLoading } = useQuery({
        queryKey: ['userParcels', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/parcels?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Fetch user's payments
    const { data: userPayments = [] } = useQuery({
        queryKey: ['userPayments', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/payments?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Calculate statistics
    const calculateStats = () => {
        const totalParcels = userParcels.length;
        const delivered = userParcels.filter(p => p.delivery_status === 'delivered').length;
        const inTransit = userParcels.filter(p => p.delivery_status === 'in_transit').length;
        const pending = userParcels.filter(p => p.delivery_status === 'not_collected' || p.delivery_status === 'rider_assigned').length;
        
        const totalSpent = userPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // Calculate this month's spending
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthSpent = userPayments
            .filter(payment => {
                const paymentDate = new Date(payment.paid_at);
                return paymentDate >= monthStart;
            })
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Get recent parcels (last 3)
        const recentParcels = userParcels
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map(parcel => ({
                id: parcel.tracking_id || parcel._id,
                status: parcel.delivery_status,
                destination: `${parcel.receiver_district}, ${parcel.receiver_address}`,
                date: new Date(parcel.createdAt).toLocaleDateString(),
                amount: parcel.price,
            }));

        return {
            totalParcels,
            delivered,
            inTransit,
            pending,
            totalSpent,
            thisMonthSpent,
            recentParcels,
        };
    };

    const stats = calculateStats();

    // Calculate monthly spending for the last 4 months
    const calculateMonthlyData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const monthlyData = [];

        for (let i = 3; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            
            const monthSpent = userPayments
                .filter(payment => {
                    const paymentDate = new Date(payment.paid_at);
                    return paymentDate >= date && paymentDate < nextMonth;
                })
                .reduce((sum, payment) => sum + (payment.amount || 0), 0);

            monthlyData.push({
                month: months[date.getMonth()],
                amount: monthSpent,
            });
        }

        return monthlyData;
    };

    const monthlyData = calculateMonthlyData();

    // Status distribution data
    const statusData = [
        { name: 'Delivered', value: stats.delivered },
        { name: 'In Transit', value: stats.inTransit },
        { name: 'Pending', value: stats.pending },
    ].filter(item => item.value > 0); // Only show statuses with parcels

    const quickStats = [
        {
            title: 'Total Parcels',
            value: stats.totalParcels,
            icon: <BiPackage size={28} />,
            bgColor: 'bg-blue-500',
            subtext: 'All time',
        },
        {
            title: 'In Transit',
            value: stats.inTransit,
            icon: <FaShippingFast size={28} />,
            bgColor: 'bg-yellow-500',
            subtext: 'On the way',
        },
        {
            title: 'Delivered',
            value: stats.delivered,
            icon: <FaCheckCircle size={28} />,
            bgColor: 'bg-green-500',
            subtext: 'Successfully',
        },
        {
            title: 'Total Spent',
            value: `৳${stats.totalSpent}`,
            icon: <FaMoneyBillWave size={28} />,
            bgColor: 'bg-purple-500',
            subtext: 'All time',
        },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            delivered: 'bg-green-100 text-green-700 border-green-300',
            in_transit: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            pending: 'bg-blue-100 text-blue-700 border-blue-300',
            not_collected: 'bg-red-100 text-red-700 border-red-300',
            rider_assigned: 'bg-blue-100 text-blue-700 border-blue-300',
        };
        const labels = {
            delivered: 'Delivered',
            in_transit: 'In Transit',
            pending: 'Pending',
            not_collected: 'Not Collected',
            rider_assigned: 'Rider Assigned',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[status] || badges.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh]">
                <span className="loading loading-spinner loading-lg text-secondary"></span>
                <p className="mt-4 text-gray-600 font-semibold">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-base-200 to-base-300 rounded-lg p-6 shadow-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
                        <p className="text-gray-200">Manage your parcels and track deliveries</p>
                    </div>
                    <Link to="/sendParcel">
                        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-base-200 rounded-lg font-bold hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                            <FaPlus size={20} />
                            <span>Send New Parcel</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`${stat.bgColor} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-semibold mb-1">{stat.title}</h3>
                            <p className="text-3xl font-bold text-base-200 mb-1">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Parcels & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Parcels */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-base-200">Recent Parcels</h2>
                        <Link to="/dashboard/myParcels">
                            <button className="text-sm text-base-300 hover:text-base-300/80 font-semibold">
                                View All →
                            </button>
                        </Link>
                    </div>
                    {stats.recentParcels.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentParcels.map((parcel, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    <div className="flex items-start gap-4 mb-3 md:mb-0">
                                        <div className="p-3 bg-base-300 rounded-lg text-white">
                                            <MdLocalShipping size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base-200 mb-1">{parcel.id}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                <FaMapMarkerAlt size={12} />
                                                <span>{parcel.destination}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FaClock size={12} />
                                                <span>{parcel.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3">
                                        {getStatusBadge(parcel.status)}
                                        <span className="font-bold text-base-200">৳{parcel.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaBoxOpen className="mx-auto text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-500 font-semibold">No parcels yet</p>
                            <Link to="/sendParcel">
                                <button className="mt-4 px-6 py-2 bg-secondary text-base-200 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300">
                                    Send Your First Parcel
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-base-200 mb-4">Status Overview</h2>
                    {statusData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {statusData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            ></div>
                                            <span className="font-semibold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-base-200">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Spending Chart */}
            {monthlyData.some(m => m.amount > 0) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-base-200 mb-4">Monthly Spending</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Bar dataKey="amount" fill="#018790" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-base-200 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/dashboard/myParcels">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-base-300 text-white rounded-lg font-semibold hover:bg-base-300/90 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaBoxOpen size={20} />
                            <span>My Parcels</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/track">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-secondary text-base-200 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaMapMarkerAlt size={20} />
                            <span>Track Parcel</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/paymentHistory">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaHistory size={20} />
                            <span>Payment History</span>
                        </button>
                    </Link>
                    <Link to="/sendParcel">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaPlus size={20} />
                            <span>Send Parcel</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spending Info Card */}
                {stats.thisMonthSpent > 0 && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 shadow-lg text-white">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <FaChartBar size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Track Your Spending</h3>
                                <p className="text-blue-100">
                                    You've spent ৳{stats.thisMonthSpent} this month. View detailed analytics to
                                    optimize your delivery costs.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Promo Card */}
                <div className="bg-gradient-to-r from-secondary to-green-400 rounded-lg p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <MdLocalShipping size={24} className="text-base-200" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-base-200 mb-2">Need Help?</h3>
                            <p className="text-base-200/90">
                                Track your parcels in real-time and get instant updates on delivery status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
