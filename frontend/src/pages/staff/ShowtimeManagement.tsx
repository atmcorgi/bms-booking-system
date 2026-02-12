import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffShowtimeApi } from "../../services/staffShowtimeApi";
import { staffDashboardApi } from "../../services/staffDashboardApi";
import { 
  Calendar, 
  Search, 
  Plus, 
  Trash2, 
  Pencil, 
  Check, 
  X, 
  Loader2, 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  Building2 
} from "lucide-react";
import "../../styles/staff-booking.css";
import CustomDropdown from "../../components/CustomDropdown";

export default function ShowtimeManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [movieFilter, setMovieFilter] = useState<string | number>("");
  const [roomFilter, setRoomFilter] = useState<string | number>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    priceStandard: 75000,
    priceVip: 120000,
    showTime: "",
  });
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch theater info
  const dashboardQ = useQuery({
    queryKey: ["staffDashboard"],
    queryFn: async () => {
      const resp = await staffDashboardApi.get();
      return resp.data;
    },
  });

  // Fetch showtimes
  const showtimesQ = useQuery({
    queryKey: ["staffShowtimes", page, size, startDate, endDate, movieFilter, roomFilter],
    queryFn: async () => {
      const resp = await staffShowtimeApi.list({
        startDate,
        endDate,
        movieId: movieFilter ? Number(movieFilter) : undefined,
        roomId: roomFilter ? Number(roomFilter) : undefined,
        page,
        size,
      });
      return resp.data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => staffShowtimeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffShowtimes"] });
      setNotification({ message: "Xóa suất chiếu thành công!", type: "success" });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({ message: err?.response?.data?.error || "Xóa thất bại", type: "error" });
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      staffShowtimeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffShowtimes"] });
      setEditingId(null);
      setNotification({ message: "Cập nhật thành công!", type: "success" });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({ message: err?.response?.data?.error || "Cập nhật thất bại", type: "error" });
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const handleEdit = (showtime: any) => {
    setEditingId(showtime.id);
    setEditForm({
      priceStandard: showtime.priceStandard || 75000,
      priceVip: showtime.priceVip || 120000,
      showTime: showtime.showTime, // Format HH:mm
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateMut.mutate({ id: editingId, data: editForm });
    }
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMut.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const theater = dashboardQ.data?.theater;
  const rooms = dashboardQ.data?.rooms || [];
  const assignments = dashboardQ.data?.assignments || [];
  const showtimes = showtimesQ.data?.items || [];
  const totalPages = showtimesQ.data?.totalPages || 1;

  // Prepare dropdown options
  const movieOptions = [
    { value: "", label: "-- Tất cả phim --" },
    ...assignments.map((a: any) => ({
      value: String(a.movieId),
      label: a.movieTitle,
    })),
  ];

  const roomOptions = [
    { value: "", label: "-- Tất cả phòng --" },
    ...rooms.map((r: any) => ({
      value: String(r.id),
      label: r.name,
    })),
  ];

  return (
    <div className="staff-container">
      {/* Theater Info Card */}
      <div className="staff-header-section">
        <div>
           <h2 className="staff-title flex items-center gap-2">
             <Calendar className="w-6 h-6" /> Quản lý Suất chiếu
           </h2>
           <p className="staff-subtitle flex items-center gap-2">
             <Building2 className="w-4 h-4" /> {theater?.name || "Theater"} - {theater?.address}
           </p>
        </div>
         <button
            className="staff-btn staff-btn-primary flex items-center gap-2"
            onClick={() => window.location.href = "/staff/scheduling"}
          >
            <Plus className="w-4 h-4" /> Tạo lịch mới
          </button>
      </div>

      {/* Filters - Compact */}
      <div className="staff-card mb-4 p-4">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, color: '#4338ca', fontWeight: 600 }}>
           <Search className="w-4 h-4 mr-2" />
           <span>Bộ lọc tìm kiếm</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'end' }}>
          <div>
            <label className="staff-label" style={{marginBottom: 4}}>Từ ngày</label>
            <input
              type="date"
              className="staff-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="staff-label" style={{marginBottom: 4}}>Đến ngày</label>
            <input
              type="date"
              className="staff-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
             <label className="staff-label" style={{marginBottom: 4}}>Phim</label>
             <CustomDropdown
               value={movieFilter}
               onChange={(val) => setMovieFilter(val)}
               options={movieOptions}
               placeholder="-- Tất cả phim --"
               width="100%"
             />
          </div>
          <div>
             <label className="staff-label" style={{marginBottom: 4}}>Phòng</label>
             <CustomDropdown
               value={roomFilter}
               onChange={(val) => setRoomFilter(val)}
               options={roomOptions}
               placeholder="-- Tất cả phòng --"
               width="100%"
             />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            background: notification.type === "success" ? "#10B981" : "#EF4444",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {notification.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", marginLeft: "8px" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="staff-card">
        {showtimesQ.isLoading ? (
          <div className="staff-loading-state" style={{padding: '40px', textAlign: 'center'}}>
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="mt-3 text-gray-600">Đang tải danh sách suất chiếu...</p>
          </div>
        ) : showtimes.length === 0 ? (
          <div className="staff-empty-state" style={{padding: '40px', textAlign: 'center'}}>
            <CalendarClock className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="mt-3 text-gray-600">Không tìm thấy suất chiếu nào phù hợp.</p>
          </div>
        ) : (
          <>
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th style={{width: 120}}>Ngày chiếu</th>
                    <th style={{width: 90}}>Giờ</th>
                    <th>Phim</th>
                    <th>Phòng</th>
                    <th className="text-center" style={{width: 120}}>Giá Thường</th>
                    <th className="text-center" style={{width: 120}}>Giá VIP</th>
                    <th className="text-center" style={{width: 140}}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 italic">
                        Không tìm thấy suất chiếu nào
                      </td>
                    </tr>
                  ) : (
                    showtimes.map((s: any) => {
                      const isEditing = editingId === s.id;
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="font-semibold text-gray-700">
                              {s.showDate}
                            </div>
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="time"
                                className="staff-input staff-input-sm w-24"
                                value={editForm.showTime}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, showTime: e.target.value })
                                }
                              />
                            ) : (
                              <div className="font-bold text-indigo-700 text-lg flex items-center gap-1">
                                <CalendarClock className="w-4 h-4 text-gray-400" />
                                {s.showTime?.substring(0, 5)}
                              </div>
                            )}
                          </td>
                          <td>
                             <div className="font-bold text-gray-900 text-[15px]">{s.movieTitle}</div>
                             {s.activeFrom && s.activeTo && (
                               <div className="text-xs text-gray-500 mt-0.5">
                                 <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                   {s.activeFrom} ~ {s.activeTo}
                                 </span>
                               </div>
                             )}
                          </td>
                          <td>
                            <span className="staff-badge staff-badge-gray">
                              {s.roomName}
                            </span>
                          </td>
                          <td className="text-center">
                             {isEditing ? (
                               <input
                                 type="number"
                                 className="staff-input staff-input-sm w-full text-center"
                                 value={editForm.priceStandard}
                                 placeholder="Thường"
                                 onChange={(e) => setEditForm({...editForm, priceStandard: Number(e.target.value)})}
                               />
                             ) : (
                               <div className="text-gray-900 font-medium">
                                 {s.priceStandard?.toLocaleString()}
                               </div>
                             )}
                          </td>
                          <td className="text-center">
                             {isEditing ? (
                               <input
                                 type="number"
                                 className="staff-input staff-input-sm w-full text-center"
                                 value={editForm.priceVip}
                                 placeholder="VIP"
                                 onChange={(e) => setEditForm({...editForm, priceVip: Number(e.target.value)})}
                               />
                             ) : (
                               <div className="text-indigo-700 font-bold">
                                 {s.priceVip?.toLocaleString()}
                                </div>
                             )}
                          </td>
                          <td className="text-center">
                            {isEditing ? (
                              <div className="staff-action-group justify-center">
                                <button
                                  className="staff-btn staff-btn-success staff-btn-sm"
                                  onClick={handleSaveEdit}
                                  title="Lưu"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  className="staff-btn staff-btn-secondary staff-btn-sm"
                                  onClick={() => setEditingId(null)}
                                  title="Hủy"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="staff-action-group justify-center">
                                <button
                                  className="staff-btn staff-btn-secondary staff-btn-sm"
                                  onClick={() => handleEdit(s)}
                                  title="Sửa"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  className="staff-btn staff-btn-danger staff-btn-sm"
                                  onClick={() => handleDelete(s.id)}
                                  disabled={deleteMut.isPending}
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="staff-pagination" style={{ justifyContent: 'center' }}>
                <button
                  className="staff-btn staff-btn-secondary staff-btn-sm flex items-center gap-1"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>
                <div style={{ margin: '0 12px', fontSize: 14, fontWeight: 500, color: '#4b5563' }}>
                  Trang <span style={{ color: '#4f46e5', fontWeight: 700 }}>{page + 1}</span> / {totalPages}
                </div>
                <button
                  className="staff-btn staff-btn-secondary staff-btn-sm flex items-center gap-1"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="staff-modal-overlay">
          <div className="staff-modal">
            <div className="staff-modal-content">
              <div className="staff-modal-icon">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="staff-modal-title">
                Xác nhận xóa
              </h3>
              <p className="staff-modal-text">
                Bạn có chắc chắn muốn xóa suất chiếu này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="staff-modal-actions">
              <button
                type="button"
                className="staff-btn staff-btn-danger"
                onClick={confirmDelete}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "Đang xóa..." : "Xóa bỏ"}
              </button>
              <button
                type="button"
                className="staff-btn staff-btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
