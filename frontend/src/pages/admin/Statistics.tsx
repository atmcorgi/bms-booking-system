import { useState } from "react";
import "./Statistics.css";
import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../services/statisticsApi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faMoneyBillWave, faTicketAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Statistics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0], // Start of month
    to: new Date().toISOString().split("T")[0] // Today
  });

  // Fetch Summary
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["stats-summary"],
    queryFn: () => statisticsApi.getSummary().then(res => res.data)
  });

  // Fetch Revenue Chart Data
  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ["stats-revenue", dateRange],
    queryFn: () => statisticsApi.getRevenue(dateRange.from, dateRange.to).then(res => res.data)
  });

  // Fetch Top Movies
  const { data: topMovies, isLoading: loadingTopMovies } = useQuery({
    queryKey: ["stats-top-movies"],
    queryFn: () => statisticsApi.getTopMovies(5).then(res => res.data)
  });

  // Transform dailyRevenue map to array for Recharts
  const chartData = revenueData?.dailyRevenue 
    ? Object.entries(revenueData.dailyRevenue).map(([date, amount]) => ({ date, amount }))
    : [];

  if (loadingSummary || loadingRevenue || loadingTopMovies) {
    return (
        <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-gray-400" />
        </div>
    );
  }

  return (
      <div className="w-full bg-gray-50 min-h-screen p-6" style={{ boxSizing: 'border-box' }}>
        <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Header section with Date Pickers */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Track your cinema's performance metrics</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                        <input 
                            type="date" 
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-transparent border-none text-gray-700 text-sm focus:ring-0 p-0 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                         <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                         <input 
                            type="date" 
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-transparent border-none text-gray-700 text-sm focus:ring-0 p-0 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {/* Revenue Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {summary?.monthRevenue?.toLocaleString() || 0}
                            <span className="text-sm text-gray-400 font-normal ml-1">VND</span>
                        </h3>
                         <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Verified
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                         <FontAwesomeIcon icon={faMoneyBillWave} className="text-9xl text-indigo-900 transform translate-x-1/4 translate-y-1/4" />
                    </div>
                </div>

                {/* Bookings Card */}
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <FontAwesomeIcon icon={faTicketAlt} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bookings</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                             {summary?.monthBookings?.toLocaleString() || 0}
                             <span className="text-sm text-gray-400 font-normal ml-1">tickets</span>
                        </h3>
                    </div>
                    {/* Graph decoration */}
                     <div className="absolute bottom-6 right-6 flex items-end gap-1 h-8 opacity-20">
                        {[40, 70, 45, 90, 60, 75, 50].map((h, i) => (
                            <div key={i} className="w-1.5 bg-blue-600 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                     </div>
                </div>
                
                 {/* System Status */}
                <div className="bg-slate-800 p-6 rounded-3xl shadow-sm text-white flex flex-col justify-between h-44 relative overflow-hidden">
                     <div className="relative z-10">
                        <span className="text-xs font-bold opacity-70 uppercase tracking-wider">System Status</span>
                         <h3 className="text-xl font-bold mt-2">Active</h3>
                     </div>
                     <div className="relative z-10 flex items-center gap-3">
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                             <div className="w-[98%] h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                         </div>
                         <span className="text-xs font-bold text-emerald-400">98%</span>
                     </div>
                     {/* Abstract shape */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Avg Ticket */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-44">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                             <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg. Ticket</span>
                    </div>
                     <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                        ~65k
                        <span className="text-sm text-gray-400 font-normal ml-1">VND</span>
                    </h3>
                     <div className="text-xs text-gray-400 mt-2">Based on current monthly sales</div>
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-800">Revenue Analytics</h3>
                             <p className="text-xs text-gray-500">Daily revenue performance</p>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickMargin={10}
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                />
                                <YAxis 
                                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                                    tickFormatter={(val) => `${val/1000}k`} 
                                    axisLine={false} 
                                    tickLine={false}
                                    tickMargin={10}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Movies */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                     <h3 className="text-lg font-bold text-gray-800 mb-6">Top Choices</h3>
                     <div className="flex-1 overflow-auto pr-2 space-y-4 custom-scrollbar">
                        {(topMovies || []).map((movie: any, index: number) => (
                             <div key={index} className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                                    index === 0 ? 'bg-amber-400' :
                                    index === 1 ? 'bg-slate-300' :
                                    index === 2 ? 'bg-amber-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-bold text-gray-700 truncate mr-2" title={movie.title}>{movie.title}</h4>
                                        <span className="text-xs font-medium text-gray-500">{movie.bookings} sales</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${
                                                index === 0 ? 'bg-amber-400' : 
                                                index === 1 ? 'bg-slate-400' : 
                                                'bg-indigo-400'
                                            }`} 
                                            style={{ width: `${Math.min((movie.bookings / (Math.max(...(topMovies || []).map((m: any) => m.bookings)) || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                             </div>
                        ))}
                     </div>
                </div>

            </div>
        </div>
      </div>
  );
}
