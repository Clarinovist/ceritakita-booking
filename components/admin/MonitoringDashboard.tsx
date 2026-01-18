'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Activity, Clock, AlertCircle, RefreshCw, Lightbulb, CheckCircle } from 'lucide-react';

interface MetricStat {
    operation: string;
    count: number;
    avg_time: number;
    max_time: number;
    min_time: number;
}

interface Recommendation {
    type: 'warning' | 'success' | 'info';
    message: string;
}

export const MonitoringDashboard: React.FC = () => {
    const [stats, setStats] = useState<MetricStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/monitoring?module=leads&days=${days}`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading && stats.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Generate recommendations based on stats
    const getRecommendations = (): Recommendation[] => {
        const recommendations: Recommendation[] = [];
        if (stats.length === 0) return recommendations;

        const slowOperations = stats.filter(s => s.avg_time > 100);
        const moderateOperations = stats.filter(s => s.avg_time > 50 && s.avg_time <= 100);
        const avgOverall = stats.reduce((acc, curr) => acc + curr.avg_time, 0) / stats.length;

        if (slowOperations.length > 0) {
            recommendations.push({
                type: 'warning',
                message: `${slowOperations.length} operation(s) have high latency (>100ms). Consider optimizing query logic or adding database indexes.`
            });
        }

        if (moderateOperations.length > 0) {
            recommendations.push({
                type: 'info',
                message: `${moderateOperations.length} operation(s) have moderate latency (50-100ms). Monitor these and consider caching if they become slower.`
            });
        }

        if (avgOverall < 30 && stats.length > 0) {
            recommendations.push({
                type: 'success',
                message: 'Overall performance is excellent! Average latency is under 30ms.'
            });
        }

        if (stats.length === 0) {
            recommendations.push({
                type: 'info',
                message: 'No metrics data yet. Use the leads features to start collecting performance data.'
            });
        }

        return recommendations;
    };

    const recommendations = getRecommendations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Performance Monitoring</h2>
                    <p className="text-sm text-gray-500">Real-time database operation performance for Leads module</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>Last 24 Hours</option>
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                    </select>
                    <button
                        onClick={fetchStats}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Operations</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {stats.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Latency</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {stats.length > 0
                                    ? (stats.reduce((acc, curr) => acc + curr.avg_time, 0) / stats.length).toFixed(2)
                                    : '0'} ms
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Slowest Operation</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {stats.length > 0
                                    ? Math.max(...stats.map(s => s.max_time)).toFixed(2)
                                    : '0'} ms
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Latency Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Execution Latency by Operation (ms)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="operation"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar dataKey="avg_time" name="Avg Time" radius={[4, 4, 0, 0]}>
                                {stats.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.avg_time > 100 ? '#ef4444' : entry.avg_time > 50 ? '#f59e0b' : '#3b82f6'}
                                    />
                                ))}
                            </Bar>
                            <Bar dataKey="max_time" name="Max Time" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Operation</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Count</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Avg (ms)</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Max (ms)</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Min (ms)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {stats.sort((a, b) => b.avg_time - a.avg_time).map((stat) => (
                            <tr key={stat.operation} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{stat.operation}</td>
                                <td className="px-6 py-4 text-right text-gray-600">{stat.count.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-mono">
                                    <span className={stat.avg_time > 100 ? 'text-red-600 font-bold' : stat.avg_time > 50 ? 'text-amber-600' : 'text-green-600'}>
                                        {stat.avg_time.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600 font-mono">{stat.max_time.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-gray-600 font-mono">{stat.min_time.toFixed(2)}</td>
                            </tr>
                        ))}
                        {stats.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                    No performance data collected yet for this period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Recommendations Panel */}
            {recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Recommendations
                    </h3>
                    <div className="space-y-3">
                        {recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl flex items-start gap-3 text-sm ${rec.type === 'warning'
                                        ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                        : rec.type === 'success'
                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                            : 'bg-blue-50 border border-blue-200 text-blue-800'
                                    }`}
                            >
                                {rec.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                ) : rec.type === 'warning' ? (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <Lightbulb className="w-5 h-5 flex-shrink-0" />
                                )}
                                <p>{rec.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
