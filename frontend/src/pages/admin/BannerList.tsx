import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminBannerApi } from "../../services/bannerApi";
import ErrorModal from "../../components/shared/ErrorModal";
import "../../styles/admin-table.css";

export default function BannerList() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Thông báo" });

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const response = await adminBannerApi.list();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminBannerApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setDeleteId(null);
      setErrorModal({
        show: true,
        title: "Thành công",
        message: "Xóa banner thành công!"
      });
    },
    onError: () => {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Lỗi khi xóa banner"
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa banner này?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (isLoading) {
    return <div style={{ padding: "12px" }}>Đang tải...</div>;
  }

  return (
    <div style={{ padding: "0", maxWidth: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          padding: "12px",
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0, lineHeight: 1 }}>Quản lý Banners</h3>
          <div className="admin-toolbar-actions">
            <Link to="/admin/banners/new" className="fd-btn fd-btn-primary">
              + Thêm Banner
            </Link>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>ID</th>
              <th style={{ width: "150px" }}>Preview</th>
              <th>Tiêu đề</th>
              <th style={{ width: "80px" }}>Loại</th>
              <th style={{ width: "80px" }}>Thứ tự</th>
              <th style={{ width: "120px" }}>Trạng thái</th>
              <th style={{ width: "140px" }}>Ngày bắt đầu</th>
              <th style={{ width: "140px" }}>Ngày kết thúc</th>
              <th style={{ width: "180px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999",
                  }}
                >
                  Chưa có banner nào. Tạo banner đầu tiên!
                </td>
              </tr>
            ) : (
              banners.map((banner: any) => (
                <tr key={banner.id}>
                  <td>{banner.id}</td>
                  <td>
                    {banner.mediaType === "VIDEO" ? (
                      <video
                        src={banner.mediaUrl}
                        poster={banner.thumbnailUrl}
                        style={{
                          width: "120px",
                          height: "40px",
                          objectFit: "fill",
                          borderRadius: "4px",
                          display: "block",
                        }}
                        muted
                      />
                    ) : (
                      <img
                        src={banner.mediaUrl}
                        alt={banner.title}
                        style={{
                          width: "120px",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: "4px",
                          display: "block",
                        }}
                      />
                    )}
                  </td>
                  <td>{banner.title}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        background:
                          banner.mediaType === "VIDEO" ? "#9333ea" : "#3b82f6",
                        color: "white",
                        display: "inline-block",
                      }}
                    >
                      {banner.mediaType === "VIDEO" ? "Video" : "Ảnh"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>{banner.displayOrder}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        background: banner.isActive ? "#4CAF50" : "#999",
                        color: "white",
                        display: "inline-block",
                      }}
                    >
                      {banner.isActive ? "Hoạt động" : "Tắt"}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    {formatDate(banner.startDate)}
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    {formatDate(banner.endDate)}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Link
                        to={`/admin/banners/${banner.id}/edit`}
                        style={{
                          padding: "6px 12px",
                          background: "transparent",
                          color: "#28a745",
                          border: "1px solid #059669",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: 400,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "50px",
                          height: "32px",
                          boxSizing: "border-box",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#059669";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#059669";
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        disabled={
                          deleteMutation.isPending && deleteId === banner.id
                        }
                        style={{
                          padding: "6px 12px",
                          background: "transparent",
                          color: "#dc3545",
                          border: "1px solid #dc3545",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 400,
                          cursor:
                            deleteMutation.isPending && deleteId === banner.id
                              ? "not-allowed"
                              : "pointer",
                          transition: "all 0.2s",
                          opacity:
                            deleteMutation.isPending && deleteId === banner.id
                              ? 0.6
                              : 1,
                          minWidth: "50px",
                          height: "32px",
                          boxSizing: "border-box",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = "#dc3545";
                            e.currentTarget.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#dc3545";
                          }
                        }}
                      >
                        {deleteMutation.isPending && deleteId === banner.id
                          ? "Đang xóa..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Thông báo" })}
      />
    </div>
  );
}
