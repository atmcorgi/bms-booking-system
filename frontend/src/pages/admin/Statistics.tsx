import { useState } from "react";
import "./Statistics.css";
import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "../../services/statisticsApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
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
      <div className="admin-content">
        <div className="admin-header">
           <h3 style={{ margin: 0 }}>Dashboard Statistics</h3>
           {/* Date Filter */}
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>From Date</label>
                    <input 
                        type="date" 
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>To Date</label>
                    <input 
                        type="date" 
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                         style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                    />
                </div>
           </div>
        </div>

        {/* Summary Info Row */}
        <div className="info-row">
            {/* Revenue */}
             <div className="info-box bg-success">
                <div className="info-box-icon">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div className="info-box-content">
                    <span className="info-box-text">Doanh thu tháng này</span>
                    <span className="info-box-number">
                        {summary?.monthRevenue?.toLocaleString() || 0} VND
                    </span>
                 </div>
            </div>

            {/* Bookings */}
             <div className="info-box bg-primary">
                <div className="info-box-icon">
                    <FontAwesomeIcon icon={faTicketAlt} />
                </div>
                <div className="info-box-content">
                    <span className="info-box-text">Vé bán ra tháng này</span>
                    <span className="info-box-number">
                         {summary?.monthBookings || 0}
                    </span>
                 </div>
            </div>
        </div>

        {/* Widgets Grid for Charts */}
        <div className="widgets-grid" style={{ marginTop: '20px' }}>
            
            {/* Revenue Chart */}
            <div className="widget-card">
                <div className="widget-header">
                    <div>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>Biểu đồ doanh thu</h4>
                    </div>
                </div>
                <div className="widget-body">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={(val) => `${val/1000}k`} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(val: any) => [`${val?.toLocaleString() || 0} VND`, 'Doanh thu']} 
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="amount" name="Doanh thu" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Movies Chart */}
             <div className="widget-card">
                <div className="widget-header">
                    <div>
                         <h4 style={{ margin: 0, fontSize: '16px' }}>Top 5 Phim hot</h4>
                    </div>
                </div>
                <div className="widget-body">
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMovies || []} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                            <XAxis type="number" tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                            <YAxis dataKey="title" type="category" width={100} tick={{fontSize: 11, fill: '#374151'}} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="bookings" name="Vé đã bán" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
      </div>
  );
}
