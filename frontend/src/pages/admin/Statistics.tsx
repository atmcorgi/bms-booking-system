import { useState, useMemo } from "react";
import "./Statistics.css";
import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../services/statisticsApi";
import { authApi } from "../../services/authApi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faTicketAlt, faSpinner, faTrophy, faCrown, faLightbulb, faBuilding, faFire, faSnowflake, faChartLine, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

export default function Statistics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split("T")[0], // 3 months ago
    to: new Date().toISOString().split("T")[0] // Today
  });
  const [timeGroup, setTimeGroup] = useState<"daily" | "weekly" | "monthly">("daily");

  // Fetch Summary
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["stats-summary", dateRange],
    queryFn: () => statisticsApi.getSummary(dateRange.from, dateRange.to).then(res => res.data)
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

  // Fetch current user role
  const { data: meData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => authApi.me().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });
  const isAdmin = meData?.roles?.some(r => r === "ADMIN" || r === "ROLE_ADMIN") ?? false;
  const isStaff = meData?.roles?.some(r => r === "STAFF" || r === "ROLE_STAFF") ?? false;

  // Fetch Theater Revenue - ADMIN only
  const { data: theaterRevenue } = useQuery({
    queryKey: ["stats-theaters", dateRange],
    queryFn: () => statisticsApi.getTheaterRevenue(dateRange.from, dateRange.to).then(res => res.data),
    enabled: isAdmin,
  });

  // Transform dailyRevenue map to array for Recharts
  const rawChartData = revenueData?.dailyRevenue 
    ? Object.entries(revenueData.dailyRevenue).map(([date, amount]) => ({ date, amount }))
    : [];

  // Group chart data based on selected time interval
  const chartData = useMemo(() => {
    if (!rawChartData.length) return [];
    if (timeGroup === "daily") return rawChartData;

    const grouped = new Map<string, number>();
    
    rawChartData.forEach(item => {
        const dateObj = new Date(item.date);
        let key = "";
        
        if (timeGroup === "weekly") {
            // Get week number
            const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
            key = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
        } else if (timeGroup === "monthly") {
            key = item.date.substring(0, 7); // yyyy-MM
        }
        
        grouped.set(key, (grouped.get(key) || 0) + item.amount);
    });

    return Array.from(grouped.entries()).map(([date, amount]) => ({ date, amount }));
  }, [rawChartData, timeGroup]);

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
                    <div className="group stats-date-input-container bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">From</span>
                        <input 
                            type="date" 
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-transparent border-none text-gray-700 text-sm font-semibold focus:ring-0 p-0 outline-none cursor-pointer"
                        />
                    </div>
                    <div className="group stats-date-input-container bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10">
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
                
                {/* Best Month Card */}
                <div className="bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 border border-slate-800 flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 stats-card-padding !p-6">
                     <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 !gap-2 mb-1">
                            <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <FontAwesomeIcon icon={faTrophy} className="text-amber-400 text-sm" />
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Best Month (Year)</span>
                        </div>
                         
                         <div>
                            <h3 className="text-2xl font-bold text-white mt-1 uppercase tracking-wider">
                                {summary?.bestMonth || "N/A"}
                            </h3>
                            <div className="text-emerald-400 font-bold flex items-baseline gap-1 mt-2">
                                <span className="text-xl">{(summary?.bestMonthRevenue || 0).toLocaleString()}</span>
                                <span className="text-xs text-slate-400">VND</span>
                            </div>
                         </div>
                     </div>
                     {/* Abstract shape */}
                     <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors duration-500"></div>
                </div>

                {/* Best Selling Movie Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/20 border border-indigo-500 flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 stats-card-padding !p-6">
                     <div className="relative z-10 flex flex-col h-full justify-between">
                         <div className="flex items-center gap-2 !gap-2">
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCrown} className="text-yellow-300 text-sm" />
                            </span>
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Top Movie</span>
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2 leading-tight">
                                {summary?.bestMovie || "N/A"}
                            </h3>
                             <div className="text-xs text-indigo-200 mt-2 font-medium flex items-center gap-1.5">
                                 <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-bold">{summary?.bestMovieBookings?.toLocaleString() || 0}</span>
                                 tickets sold
                             </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <FontAwesomeIcon icon={faCrown} className="text-[8rem] text-white transform -rotate-12" />
                    </div>
                </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 h-auto lg:h-[420px] stats-grid-gap !gap-6">
                
                {/* Main Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col stats-card-padding !p-6">
                    <div className="flex justify-between items-start mb-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                             <p className="text-xs text-gray-500 font-medium mt-1">Daily revenue performance over time</p>
                        </div>
                        <div className="flex gap-2 !gap-2">
                            <select 
                                value={timeGroup}
                                onChange={(e) => setTimeGroup(e.target.value as "daily" | "weekly" | "monthly")}
                                className="bg-gray-50 border-none text-xs font-bold text-gray-600 rounded-lg py-1.5 px-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden stats-card-padding !p-6">
                     <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 !gap-2">
                        Top Performing
                        <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Movies</span>
                    </h3>
                     <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                        {(topMovies || []).map((movie: any, index: number) => (
                             <div key={index} className="group cursor-default">
                                <div className="stats-info-row flex items-center mb-2">
                                    <div className={`stats-rank-badge rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                                        index === 0 ? 'bg-amber-100 text-amber-600' :
                                        index === 1 ? 'bg-slate-100 text-slate-600' :
                                        index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="w-6 shrink-0"></div> 
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-sm font-bold text-gray-700 truncate mr-2 group-hover:text-indigo-600 transition-colors" title={movie.title}>{movie.title}</h4>
                                            <span className="text-xs font-semibold text-gray-500">{movie.bookings} <span className="text-[10px] font-normal text-gray-400">sales</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden ml-14 w-[calc(100%-3.5rem)]">
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

            {/* ===== BUSINESS INSIGHTS SECTION ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 stats-card-padding !p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <FontAwesomeIcon icon={faLightbulb} className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Business Insights</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {isAdmin ? "Kết luận tổng quan toàn hệ thống" : "Gợi ý điều chỉnh suất chiếu cho rạp của bạn"}
                  </p>
                </div>
              </div>

              <div className="insights-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 !gap-4">

                {/* === ADMIN INSIGHTS === */}
                {isAdmin && (
                  <>
                    {/* Top Theater Card */}
                    {theaterRevenue && theaterRevenue.length > 0 && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                          <FontAwesomeIcon icon={faBuilding} />
                          Rạp doanh thu cao nhất
                        </div>
                        <p className="text-base font-extrabold text-gray-900">{theaterRevenue[0].theaterName}</p>
                        <p className="text-sm text-gray-600">
                          Doanh thu: <span className="font-bold text-indigo-700">{theaterRevenue[0].revenue.toLocaleString()} VND</span>
                          <span className="ml-2 text-gray-400">({theaterRevenue[0].bookings} vé)</span>
                        </p>
                        {theaterRevenue.length > 1 && (
                          <p className="insights-tip text-xs text-gray-500 bg-white rounded-lg border border-gray-100">
                            💡 <strong>{theaterRevenue[0].theaterName}</strong> đang vượt trội.
                            Xem xét áp dụng mô hình vận hành tương tự cho các rạp còn lại.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Nationwide Hot Movie */}
                    {topMovies && topMovies.length > 0 && (
                      <div className="rounded-xl border border-orange-100 bg-orange-50/60 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider">
                          <FontAwesomeIcon icon={faFire} />
                          Phim hot nhất toàn quốc
                        </div>
                        <p className="text-base font-extrabold text-gray-900">{topMovies[0].title}</p>
                        <p className="text-sm text-gray-600">
                          Tổng <span className="font-bold text-orange-600">{topMovies[0].bookings} vé</span> đã đặt
                        </p>
                        <p className="insights-tip text-xs text-gray-500 bg-white rounded-lg border border-gray-100">
                          💡 Nên thông báo cho các rạp tăng suất chiếu <strong>{topMovies[0].title}</strong>,
                          đặc biệt vào cuối tuần để tối đa hóa doanh thu.
                        </p>
                      </div>
                    )}

                    {/* Best Month Trend */}
                    {summary?.bestMonth && summary.bestMonth !== "N/A" && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                          <FontAwesomeIcon icon={faChartLine} />
                          Xu hướng doanh thu năm
                        </div>
                        <p className="text-base font-extrabold text-gray-900">Tháng {summary.bestMonth}</p>
                        <p className="text-sm text-gray-600">
                          Doanh thu đỉnh: <span className="font-bold text-emerald-700">{(summary.bestMonthRevenue || 0).toLocaleString()} VND</span>
                        </p>
                        <p className="insights-tip text-xs text-gray-500 bg-white rounded-lg border border-gray-100">
                          💡 Tháng {summary.bestMonth} là điểm doanh thu tốt nhất năm.
                          Phân tích lịch chiếu và chiến dịch khuyến mãi tháng đó để nhân rộng.
                        </p>
                      </div>
                    )}

                    {/* All Theaters Ranking */}
                    {theaterRevenue && theaterRevenue.length > 1 && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow col-span-full">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                          <FontAwesomeIcon icon={faBuilding} />
                          Xếp hạng doanh thu các rạp trong kỳ
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {theaterRevenue.slice(0, 6).map((t, i) => (
                            <div key={t.theaterId} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                i === 0 ? 'bg-amber-100 text-amber-600' :
                                i === 1 ? 'bg-slate-100 text-slate-500' :
                                i === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'
                              }`}>{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-700 truncate">{t.theaterName}</p>
                                <p className="text-xs text-gray-400">{t.revenue.toLocaleString()} VND · {t.bookings} vé</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* === STAFF INSIGHTS === */}
                {isStaff && topMovies && topMovies.length > 0 && (
                  <>
                    {/* Hot Movies */}
                    <div className="rounded-xl border border-red-100 bg-red-50/60 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                        <FontAwesomeIcon icon={faFire} />
                        Phim đang hot — nên tăng suất
                      </div>
                      <div className="space-y-2">
                        {topMovies.slice(0, Math.ceil(topMovies.length / 2)).map((m: any) => (
                          <div key={m.movieCode} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <span className="text-sm font-semibold text-gray-700 truncate mr-2">{m.title}</span>
                            <span className="text-xs font-bold text-red-500 shrink-0">{m.bookings} vé 🔥</span>
                          </div>
                        ))}
                      </div>
                      <p className="insights-tip text-xs text-gray-500 bg-white rounded-lg border border-gray-100">
                        💡 Tăng suất chiếu vào <strong>cuối tuần và buổi tối</strong> cho các phim trên để tăng doanh thu.
                      </p>
                    </div>

                    {/* Cold Movies */}
                    {topMovies.length > 1 && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                          <FontAwesomeIcon icon={faSnowflake} />
                          Phim ít lượt đặt — cân nhắc điều chỉnh
                        </div>
                        <div className="space-y-2">
                          {topMovies.slice(Math.ceil(topMovies.length / 2)).map((m: any) => (
                            <div key={m.movieCode} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <span className="text-sm font-semibold text-gray-700 truncate mr-2">{m.title}</span>
                              <span className="text-xs font-bold text-blue-400 shrink-0">{m.bookings} vé ❄️</span>
                            </div>
                          ))}
                        </div>
                        <p className="insights-tip text-xs text-gray-500 bg-white rounded-lg border border-gray-100">
                          💡 Giảm suất chiếu hoặc xếp vào <strong>khung giờ thấp điểm</strong>. Có thể dùng ưu đãi giá để kéo khách.
                        </p>
                      </div>
                    )}

                    {/* Scheduling Tip */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 insights-card flex flex-col gap-2 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        Gợi ý lập lịch suất chiếu
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Ưu tiên phim <strong>{topMovies[0]?.title}</strong> vào khung <strong>19:00 – 22:00</strong> cuối tuần</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Phân bổ phim ít người xem vào khung <strong>10:00 – 13:00</strong> ngày thường</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Mỗi phim hot nên có ít nhất <strong>3–4 suất/ngày</strong> vào dịp cuối tuần</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* Fallback */}
                {!isAdmin && !isStaff && (
                  <div className="col-span-full text-center text-gray-400 text-sm py-8">
                    Không có quyền xem Business Insights
                  </div>
                )}
              </div>
            </div>
            {/* ===== END BUSINESS INSIGHTS ===== */}

        </div>
      </div>
  );
}
