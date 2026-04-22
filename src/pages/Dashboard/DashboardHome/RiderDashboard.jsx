import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
    FaMotorcycle,
    FaCheckCircle,
    FaClipboardList,
    FaWallet,
    FaRoute,
    FaClock,
    FaStar,
    FaTrophy,
} from 'react-icons/fa';
import { MdTrendingUp, MdDeliveryDining } from 'react-icons/md';
import { BiPackage } from 'react-icons/bi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

const RiderDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    // Fetch rider's parcels (assigned to them)
    const { data: riderParcels = [], isLoading } = useQuery({
        queryKey: ['riderParcels', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/parcels?rider_email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Fetch rider's completed deliveries
    const { data: completedDeliveries = [] } = useQuery({
        queryKey: ['riderCompletedDeliveries', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/parcels?rider_email=${user.email}&delivery_status=delivered`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Fetch rider's pending deliveries
    const { data: pendingDeliveries = [] } = useQuery({
        queryKey: ['riderPendingDeliveries', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/parcels?rider_email=${user.email}&delivery_status=rider_assigned`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Fetch rider's in-transit deliveries
    const { data: inTransitDeliveries = [] } = useQuery({
        queryKey: ['riderInTransitDeliveries', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/parcels?rider_email=${user.email}&delivery_status=in_transit`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // Calculate statistics
    const calculateStats = () => {
        const now = new Date();
        
        // Today's deliveries
        const todayDeliveries = completedDeliveries.filter(p => {
            const deliveryDate = new Date(p.updated_at || p.createdAt);
            return deliveryDate.toDateString() === now.toDateString();
        }).length;

        // This week's deliveries
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekDeliveries = completedDeliveries.filter(p => {
            const deliveryDate = new Date(p.updated_at || p.createdAt);
            return deliveryDate >= weekStart;
        }).length;

        // This month's deliveries
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthDeliveries = completedDeliveries.filter(p => {
            const deliveryDate = new Date(p.updated_at || p.createdAt);
            return deliveryDate >= monthStart;
        }).length;

        // Calculate earnings (assuming each delivery earns based on price)
        const todayEarnings = completedDeliveries
            .filter(p => {
                const deliveryDate = new Date(p.updated_at || p.createdAt);
                return deliveryDate.toDateString() === now.toDateString();
            })
            .reduce((sum, p) => sum + (p.price * 0.15 || 0), 0); // 15% commission

        const weekEarnings = completedDeliveries
            .filter(p => {
                const deliveryDate = new Date(p.updated_at || p.createdAt);
                return deliveryDate >= weekStart;
            })
            .reduce((sum, p) => sum + (p.price * 0.15 || 0), 0);

        const totalEarnings = completedDeliveries
            .reduce((sum, p) => sum + (p.price * 0.15 || 0), 0);

        // Calculate on-time rate (assuming delivered = on time for now)
        const onTimeRate = completedDeliveries.length > 0 
            ? ((completedDeliveries.length / (completedDeliveries.length + pendingDeliveries.length)) * 100).toFixed(0)
            : 100;

        return {
            todayDeliveries,
            weekDeliveries,
            monthDeliveries,
            totalEarnings: Math.round(totalEarnings),
            todayEarnings: Math.round(todayEarnings),
            weekEarnings: Math.round(weekEarnings),
            pendingDeliveries: pendingDeliveries.length + inTransitDeliveries.length,
            completedDeliveries: completedDeliveries.length,
            rating: 4.8, // This would come from a ratings collection
            onTimeRate: parseInt(onTimeRate),
        };
    };

    const stats = calculateStats();

    // Calculate weekly earnings trend
    const calculateWeeklyEarnings = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayEarnings = completedDeliveries
                .filter(p => {
                    const deliveryDate = new Date(p.updated_at || p.createdAt);
                    return deliveryDate >= date && deliveryDate < nextDate;
                })
                .reduce((sum, p) => sum + (p.price * 0.15 || 0), 0);

            weekData.push({
                day: days[date.getDay()],
                earnings: Math.round(dayEarnings),
            });
        }

        return weekData;
    };

    // Calculate delivery trend
    const calculateDeliveryTrend = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const trendData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const dayDeliveries = completedDeliveries.filter(p => {
                const deliveryDate = new Date(p.updated_at || p.createdAt);
                return deliveryDate >= date && deliveryDate < nextDate;
            }).length;

            trendData.push({
                day: days[date.getDay()],
                deliveries: dayDeliveries,
            });
        }

        return trendData;
    };

    const weeklyEarnings = calculateWeeklyEarnings();
    const deliveryTrend = calculateDeliveryTrend();

    const quickStats = [
        {
            title: "Today's Deliveries",
            value: stats.todayDeliveries,
            icon: <MdDeliveryDining size={28} />,
            bgColor: "bg-blue-500",
            subtext: "Active today",
        },
        {
            title: "Today's Earnings",
            value: `৳${stats.todayEarnings}`,
            icon: <FaWallet size={28} />,
            bgColor: "bg-green-500",
            subtext: "Total earned",
        },
        {
            title: "Pending Tasks",
            value: stats.pendingDeliveries,
            icon: <FaClipboardList size={28} />,
            bgColor: "bg-yellow-500",
            subtext: "To complete",
        },
        {
            title: "Rating",
            value: stats.rating,
            icon: <FaStar size={28} />,
            bgColor: "bg-purple-500",
            subtext: "Average score",
        },
    ];

    const performanceCards = [
        {
            title: "This Week",
            deliveries: stats.weekDeliveries,
            earnings: stats.weekEarnings,
            icon: <FaRoute size={24} />,
            color: "text-blue-500",
        },
        {
            title: "This Month",
            deliveries: stats.monthDeliveries,
            earnings: stats.totalEarnings,
            icon: <BiPackage size={24} />,
            color: "text-green-500",
        },
        {
            title: "Total Completed",
            deliveries: stats.completedDeliveries,
            earnings: stats.totalEarnings,
            icon: <FaCheckCircle size={24} />,
            color: "text-purple-500",
        },
    ];

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
            <div className="bg-gradient-to-r from-base-300 to-blue-600 rounded-lg p-6 shadow-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FaMotorcycle className="text-secondary text-4xl" />
                            <h1 className="text-3xl font-bold text-white">Rider Dashboard</h1>
                        </div>
                        <p className="text-gray-100">Track your deliveries and earnings in real-time</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
                        <p className="text-sm text-gray-200 mb-1">On-Time Delivery Rate</p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">{stats.onTimeRate}%</span>
                            <FaTrophy className="text-secondary text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bgColor} p-3 rounded-lg text-white`}>
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

            {/* Performance Overview */}
            <div>
                <h2 className="text-xl font-bold text-base-200 mb-4">Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {performanceCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-base-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={card.color}>{card.icon}</div>
                                <h3 className="text-lg font-bold text-gray-700">{card.title}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-semibold">Deliveries:</span>
                                    <span className="text-2xl font-bold text-base-200">{card.deliveries}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-semibold">Earnings:</span>
                                    <span className="text-xl font-bold text-green-600">৳{card.earnings}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-base-200">Weekly Earnings</h2>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <MdTrendingUp />
                            <span>This Week</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={weeklyEarnings}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="earnings"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorEarnings)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Delivery Trend Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-base-200">Delivery Trend</h2>
                        <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold">
                            <MdTrendingUp />
                            <span>Last 7 Days</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={deliveryTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="deliveries"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: '#3B82F6', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-base-200 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/dashboard/pending-deliveries">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-base-300 text-white rounded-lg font-semibold hover:bg-base-300/90 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaClipboardList size={20} />
                            <span>View Pending ({stats.pendingDeliveries})</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/completed-deliveries">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-secondary text-base-200 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaCheckCircle size={20} />
                            <span>Completed ({stats.completedDeliveries})</span>
                        </button>
                    </Link>
                    <Link to="/dashboard/my-earnings">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-sm hover:shadow-md">
                            <FaWallet size={20} />
                            <span>View Earnings</span>
                        </button>
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md">
                        <FaClock size={20} />
                        <span>Work Hours</span>
                    </button>
                </div>
            </div>

            {/* Achievement Badge */}
            {stats.completedDeliveries > 10 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <FaTrophy className="text-white text-5xl" />
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {stats.completedDeliveries > 50 ? 'Top Performer!' : 'Great Work!'}
                                </h3>
                                <p className="text-white/90">
                                    You've completed {stats.completedDeliveries} deliveries. Keep it up!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderDashboard;
