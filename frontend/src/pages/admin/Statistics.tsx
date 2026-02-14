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
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header section with Date Pickers */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Overview of your cinema performance</p>
                </div>
                
                <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-2">
                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">From</label>
                        <input 
                            type="date" 
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-transparent border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 block w-full pl-3 p-2.5 outline-none transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">To</label>
                         <input 
                            type="date" 
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-transparent border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 block w-full pl-3 p-2.5 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Revenue Card - mimicking "Earnings" style */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-yellow-50 rounded-full text-yellow-600">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Revenue</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 tracking-tight mt-4">
                            {summary?.monthRevenue?.toLocaleString() || 0}
                            <span className="text-lg text-gray-400 font-normal ml-1">VND</span>
                        </h3>
                         <p className="text-xs text-green-500 flex items-center gap-1 mt-2 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Verified
                        </p>
                    </div>
                    {/* Decorative background shape */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-yellow-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
                </div>

                {/* Bookings Card - mimicking "New Clients" style */}
                 <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="z-10">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-blue-50 rounded-full text-blue-600">
                                <FontAwesomeIcon icon={faTicketAlt} />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Bookings</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 tracking-tight mt-4">
                             {summary?.monthBookings?.toLocaleString() || 0}
                             <span className="text-lg text-gray-400 font-normal ml-1">tickets</span>
                        </h3>
                    </div>
                     {/* Mini Chart Decoration (Simulated with div bars) */}
                     <div className="flex items-end gap-1 h-12 mt-4 opacity-50">
                        <div className="w-2 bg-blue-200 rounded-t-sm h-[40%]"></div>
                        <div className="w-2 bg-blue-200 rounded-t-sm h-[70%]"></div>
                        <div className="w-2 bg-blue-500 rounded-t-sm h-[100%]"></div>
                        <div className="w-2 bg-blue-200 rounded-t-sm h-[60%]"></div>
                        <div className="w-2 bg-blue-200 rounded-t-sm h-[30%]"></div>
                        <div className="w-2 bg-blue-200 rounded-t-sm h-[50%]"></div>
                     </div>
                </div>
                
                 {/* Placeholder for future stats - mimicking "Activity" */}
                <div className="bg-[#4a5f5c] p-6 rounded-3xl shadow-lg text-white flex flex-col justify-between h-48 relative overflow-hidden">
                     <div>
                        <span className="text-sm font-medium opacity-80 uppercase tracking-wider">System Status</span>
                         <h3 className="text-2xl font-bold mt-2">Active</h3>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                             <div className="w-3/4 h-full bg-white/80 rounded-full"></div>
                         </div>
                         <span className="text-sm font-bold">98%</span>
                     </div>
                     {/* Decorative wave */}
                     <svg className="absolute bottom-0 left-0 right-0 opacity-20" viewBox="0 0 1440 320">
                        <path fill="#fff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1440,149L1440,320L1344,320C1248,320,1152,320,1056,320C960,320,864,320,768,320C672,320,576,320,480,320C384,320,288,320,192,320C96,320,0,320,0,320Z"></path>
                     </svg>
                </div>

                {/* Placeholder 4 - e.g. Average Price */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-48">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-purple-50 rounded-full text-purple-600">
                             <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg. Ticket</span>
                    </div>
                     <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
                        ~65k
                        <span className="text-lg text-gray-400 font-normal ml-1">VND</span>
                    </h3>
                     <div className="text-sm text-gray-400 mt-2">Based on current sales</div>
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Revenue Chart (Span 2 cols) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                         <div>
                            <h3 className="text-xl font-bold text-gray-800">Revenue Analytics</h3>
                             <p className="text-sm text-gray-500">Daily revenue performance</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-200 transition">Monthly</span>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 11, fill: '#9CA3AF'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickMargin={10}
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                />
                                <YAxis 
                                    tick={{fontSize: 11, fill: '#9CA3AF'}} 
                                    tickFormatter={(val) => `${val/1000}k`} 
                                    axisLine={false} 
                                    tickLine={false}
                                    tickMargin={10}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#4F46E5" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Movies (Sidebar style) */}
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                     <h3 className="text-xl font-bold text-gray-800 mb-6">Top Movies</h3>
                     <div className="space-y-6">
                        {(topMovies || []).map((movie: any, index: number) => (
                             <div key={index} className="flex items-center gap-4 group cursor-default">
                                <div className="flex-shrink-0 w-12 h-16 bg-gray-200 rounded-lg overflow-hidden shadow-sm relative">
                                    {/* Placeholder for movie poster or just color */}
                                    <div className={`absolute inset-0 ${['bg-pink-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500'][index % 5]} opacity-20`}></div>
                                    <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-500 text-lg">#{index+1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{movie.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500" 
                                                style={{ width: `${Math.min((movie.bookings / (Math.max(...(topMovies || []).map((m: any) => m.bookings)) || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500">{movie.bookings}</span>
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
