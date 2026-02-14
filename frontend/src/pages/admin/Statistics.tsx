import { useState } from "react";
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
      <div className="space-y-8">
        
        {/* Date Filter */}
        <div className="bg-white p-4 shadow-sm border border-gray-100 flex gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input 
                    type="date" 
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input 
                    type="date" 
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-blue-500"
                />
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Revenue (This Month)</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {summary?.monthRevenue.toLocaleString()} VND
                </h3>
              </div>
              <div className="p-4 bg-green-50 rounded-full text-green-600">
                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 shadow-sm border-l-4 border-blue-500">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Bookings (This Month)</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {summary?.monthBookings}
                </h3>
              </div>
              <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                <FontAwesomeIcon icon={faTicketAlt} size="2x" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
                Revenue Trend
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip formatter={(val: any) => `${val?.toLocaleString() || 0} VND`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" name="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Movies Chart */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faTicketAlt} className="text-red-500" />
                Top 5 Movies
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                 {/* Layout: YAxis is movie title (category) */}
                <BarChart data={topMovies || []} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={120} tick={{fontSize: 11}} />
                  <Tooltip />
                   <Legend />
                  <Bar dataKey="bookings" name="Tickets Sold" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>
  );
}
