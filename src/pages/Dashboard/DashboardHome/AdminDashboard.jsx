import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
    FaMotorcycle,
    FaCheckCircle,
    FaShippingFast,
    FaBoxOpen,
    FaUsers,
    FaTruck,
    FaChartLine,
    FaClock,
} from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

const COLORS = {
    not_collected: '#F87171',
    in_transit: '#FBBF24',
    rider_assigned: '#60A5FA',
    delivered: '#34D399',
};

const statusIcons = {
    rider_assigned: <FaMotorcycle className="text-blue-500" />,
    delivered: <FaCheckCircle className="text-green-500" />,
    in_transit: <FaShippingFast className="text-yellow-500" />,
    not_collected: <FaBoxOpen className="text-red-500" />,
};

const statusLabels = {
    rider_assigned: "Assigned to Rider",
    delivered: "Delivered",
    in_transit: "In Transit",
    not_collected: "Not Collected",
};

export default function AdminDashboard() {
    const axiosSecure = useAxiosSecure();

    // Fetch parcel delivery status count
    const { data: deliveryStatus = [], isLoading, isError, error } = useQuery({
        queryKey: ["parcelStatusCount"],
        queryFn: async () => {
            const res = await axiosSecure.get("/parcels/delivery/status-count");
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    // Fetch all parcels for additional statistics
    const { data: allParcels = [] } = useQuery({
        queryKey: ["allParcels"],
        queryFn: async () => {
            const res = await axiosSecure.get("/parcels");
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch active riders
    const { data: activeRiders = [] } = useQuery({
        queryKey: ["activeRiders"],
        queryFn: async () => {
            const res = await axiosSecure.get("/riders/active");
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch pending riders
    const { data: pendingRiders = [] } = useQuery({
        queryKey: ["pendingRiders"],
        queryFn: async () => {
            const res = await axiosSecure.get("/riders/pending");
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const processedPieData = deliveryStatus.map((item) => ({
        name: statusLabels[item.status] || item.status,
        value: item.count,
        status: item.status
    }));

    // Calculate statistics
    const totalParcels = deliveryStatus.reduce((sum, item) => sum + item.count, 0);
    const deliveredCount = deliveryStatus.find(s => s.status === 'delivered')?.count || 0;
    const inTransitCount = deliveryStatus.find(s => s.status === 'in_transit')?.count || 0;
    const deliveryRate = totalParcels > 0 ? ((deliveredCount / totalParcels) * 100).toFixed(1) : 0;

    // Calculate trend
    const calculateTrend = () => {
        const now = new Date();
        const last7Days = allParcels.filter(p => {
            const createdAt = new Date(p.createdAt);
            const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }).length;

        const previous7Days = allParcels.filter(p => {
            const createdAt = new Date(p.createdAt);
            const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
            return diffDays > 7 && diffDays <= 14;
        }).length;

        if (previous7Days === 0) return { trend: "+0%", isPositive: true };
        const percentage = ((last7Days - previous7Days) / previous7Days * 100).toFixed(0);
        return {
            trend: `${percentage > 0 ? '+' : ''}${percentage}%`,
            isPositive: percentage >= 0
        };
    };

    const parcelTrend = calculateTrend();

    const quickStats = [
        {
            title: "Total Parcels",
            value: totalParcels,
            icon: <FaBoxOpen size={28} />,
            bgColor: "bg-blue-500",
            trend: parcelTrend.trend,
            trendUp: parcelTrend.isPositive,
        },
        {
            title: "Delivered",
            value: deliveredCount,
            icon: <FaCheckCircle size={28} />,
            bgColor: "bg-green-500",
            trend: `${deliveryRate}%`,
            trendUp: deliveryRate > 50,
        },
        {
            title: "In Transit",
            value: inTransitCount,
            icon: <FaShippingFast size={28} />,
            bgColor: "bg-yellow-500",
            trend: activeRiders.length > 0 ? `${activeRiders.length} riders` : "No riders",
            trendUp: activeRiders.length > 0,
        },
        {
            title: "Active Riders",
            value: activeRiders.length,
            icon: <FaMotorcycle size={28} />,
            bgColor: "bg-purple-500",
            trend: pendingRiders.length > 0 ? `${pendingRiders.length} pending` : "None pending",
            trendUp: true,
        },
    ];

    if (isLoading)
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh]">
                <span className="loading loading-spinner loading-lg text-secondary"></span>
                <p className="mt-4 text-gray-600 font-semibold">Loading dashboard data...</p>
            </div>
        );

    if (isError)
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h3>
                    <p className="text-red-600">{error?.message || "Failed to load dashboard"}</p>
                </div>
            </div>
        );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-base-200 to-base-300 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-200">Welcome back! Here's your delivery overview</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                        <FaClock className="text-secondary" />
                        <span className="text-white font-semibold">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bgColor} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${
                                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {stat.trendUp ? <MdTrendingUp /> : <MdTrendingDown />}
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-semibold mb-1">{stat.title}</h3>
                            <p className="text-3xl font-bold text-base-200">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Status Cards */}
            <div>
                <h2 className="text-xl font-bold text-base-200 mb-4">Parcel Status Breakdown</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deliveryStatus.map(({ count, status }) => (
                        <div
                            key={status}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4"
                            style={{ borderLeftColor: COLORS[status] }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-5xl">
                                    {statusIcons[status] || <FaBoxOpen />}
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-base-200">{count}</p>
                                    <p className="text-xs text-gray-500 mt-1">parcels</p>
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                {statusLabels[status] || status}
                            </h3>
                            <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: totalParcels > 0 ? `${(count / totalParcels) * 100}%` : '0%',
                                        backgroundColor: COLORS[status]
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-base-200 mb-4">Distribution Overview</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={processedPieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {processedPieData.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.status}`}
                                        fill={COLORS[entry.status] || '#A78BFA'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-base-200 mb-4">Status Comparison</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={processedPieData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-20}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {processedPieData.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.status}`}
                                        fill={COLORS[entry.status] || '#A78BFA'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-base-200 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/dashboard/assign-rider">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-base-300 text-white rounded-lg font-semibold hover:bg-base-300/90 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaMotorcycle size={20} />
                            <span>Assign Rider</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/active-riders">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-secondary text-base-200 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaUsers size={20} />
                            <span>Manage Riders</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/myParcels">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaTruck size={20} />
                            <span>View All Parcels</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/pending-riders">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaChartLine size={20} />
                            <span>Pending Riders ({pendingRiders.length})</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
