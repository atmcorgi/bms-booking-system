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
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500" />
        </div>
    );
  }

  return (
      <div className="w-full bg-gray-50/50 min-h-screen font-sans stats-layout-padding !p-6 md:!p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 !space-y-8">
            
            {/* Header section with Date Pickers */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100/80 backdrop-blur-xl stats-card-padding !p-6 stats-header-gap !gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Track your cinema's daily performance metrics</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 !gap-4">
                    <div className="group flex items-center gap-3 !gap-3 bg-gray-50 hover:bg-white px-4 py-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">From</span>
                        <input 
                            type="date" 
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-transparent border-none text-gray-700 text-sm font-semibold focus:ring-0 p-0 outline-none cursor-pointer"
                        />
                    </div>
                    <div className="group flex items-center gap-3 !gap-3 bg-gray-50 hover:bg-white px-4 py-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                         <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">To</span>
                         <input 
                            type="date" 
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-transparent border-none text-gray-700 text-sm font-semibold focus:ring-0 p-0 outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 stats-grid-gap !gap-6">
                 {/* Revenue Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 stats-card-padding !p-6">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-4 !gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {summary?.monthRevenue?.toLocaleString() || 0}
                                <span className="text-sm text-gray-400 font-medium ml-1.5">VND</span>
                            </h3>
                            <div className="mt-3 inline-flex items-center gap-1.5 !gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Verified Data
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                         <FontAwesomeIcon icon={faMoneyBillWave} className="text-[10rem] text-indigo-900 transform -rotate-12" />
                    </div>
                </div>

                {/* Bookings Card */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 stats-card-padding !p-6">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                         <div className="flex items-center gap-4 !gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <FontAwesomeIcon icon={faTicketAlt} className="text-lg" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bookings</span>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                             {summary?.monthBookings?.toLocaleString() || 0}
                             <span className="text-sm text-gray-400 font-medium ml-1.5">tickets</span>
                        </h3>
                    </div>
                    {/* Graph decoration */}
                     <div className="absolute bottom-0 right-0 left-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity duration-500 flex items-end justify-between px-6 pb-6 gap-1 !gap-1 !px-6 !pb-6">
                        {[40, 70, 45, 90, 60, 75, 50, 80, 60, 95].map((h, i) => (
                            <div key={i} className="w-full bg-blue-600 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                        ))}
                     </div>
                </div>
                
                 {/* System Status */}
                <div className="bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 border border-slate-800 flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 stats-card-padding !p-6">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 !gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                        </div>
                         <h3 className="text-2xl font-bold text-white mt-1">Operational</h3>
                     </div>
                     <div className="relative z-10">
                         <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                             <span>Uptime</span>
                             <span className="text-emerald-400 font-bold">99.9%</span>
                         </div>
                         <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                             <div className="w-[99.9%] h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                         </div>
                     </div>
                     {/* Abstract shape */}
                     <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
                </div>

                {/* Avg Ticket */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 stats-card-padding !p-6">
                     <div className="relative z-10 flex flex-col h-full justify-between">
                         <div className="flex items-center gap-4 !gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300">
                                <FontAwesomeIcon icon={faChartLine} className="text-lg" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Ticket Value</span>
                        </div>
                        <div>
                             <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                ~65k
                                <span className="text-sm text-gray-400 font-medium ml-1.5">VND</span>
                            </h3>
                             <div className="text-xs text-gray-400 mt-2 font-medium">Based on current monthly sales</div>
                        </div>
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                        <FontAwesomeIcon icon={faChartLine} className="text-9xl text-purple-900" />
                    </div>
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 h-auto lg:h-[420px] stats-grid-gap !gap-6">
                
                {/* Main Revenue Chart */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col stats-card-padding !p-6">
                    <div className="flex justify-between items-start mb-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                             <p className="text-xs text-gray-500 font-medium mt-1">Daily revenue performance over time</p>
                        </div>
                        <div className="flex gap-2 !gap-2">
                            <select className="bg-gray-50 border-none text-xs font-bold text-gray-600 rounded-lg py-1.5 px-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                <option>Daily</option>
                                <option>Weekly</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickMargin={15}
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                />
                                <YAxis 
                                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                                    tickFormatter={(val) => `${val/1000}k`} 
                                    axisLine={false} 
                                    tickLine={false}
                                    tickMargin={15}
                                />
                                <Tooltip 
                                    formatter={(value: number | string | Array<number | string> | undefined) => [
                                        typeof value === 'number' ? `${value.toLocaleString()} VND` : `${value}`, 
                                        "Revenue"
                                    ]}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '13px' }}
                                    labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
                                    cursor={{stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Movies */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden stats-card-padding !p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 !gap-2">
                        Top Performing
                        <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Movies</span>
                    </h3>
                     <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                        {(topMovies || []).map((movie: any, index: number) => (
                             <div key={index} className="group cursor-default">
                                <div className="flex items-center gap-4 !gap-6 mb-2">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                                        index === 0 ? 'bg-amber-100 text-amber-600' :
                                        index === 1 ? 'bg-slate-100 text-slate-600' :
                                        index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-sm font-bold text-gray-700 truncate mr-2 group-hover:text-indigo-600 transition-colors" title={movie.title}>{movie.title}</h4>
                                            <span className="text-xs font-semibold text-gray-500">{movie.bookings} <span className="text-[10px] font-normal text-gray-400">sales</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden ml-12 w-[calc(100%-3rem)]">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                            index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 
                                            index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-300' : 
                                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-300' :
                                            'bg-indigo-100'
                                        }`} 
                                        style={{ width: `${Math.min((movie.bookings / (Math.max(...(topMovies || []).map((m: any) => m.bookings)) || 1)) * 100, 100)}%` }}
                                    ></div>
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
