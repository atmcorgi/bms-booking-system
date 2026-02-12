import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBannerApi, type Banner } from "../../services/bannerApi";
import api from "../../services/apiClient";
import "../../styles/admin-table.css";
import { toast } from "react-hot-toast";

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Banner>>({
    title: "",
    mediaType: "IMAGE",
    mediaUrl: "",
    thumbnailUrl: "",
    linkUrl: "",
    displayOrder: 0,
    isActive: true,
    startDate: undefined,
    endDate: undefined,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Fetch banner data if editing
  const { data: banner } = useQuery({
    queryKey: ["admin-banner", id],
    queryFn: async () => {
      const response = await adminBannerApi.getById(Number(id));
      return response.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        mediaType: banner.mediaType,
        mediaUrl: banner.mediaUrl,
        thumbnailUrl: banner.thumbnailUrl || "",
        linkUrl: banner.linkUrl || "",
        displayOrder: banner.displayOrder,
        isActive: banner.isActive,
        startDate: banner.startDate
          ? banner.startDate.substring(0, 16)
          : undefined,
        endDate: banner.endDate ? banner.endDate.substring(0, 16) : undefined,
      });
    }
  }, [banner]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Banner>) => {
      if (isEdit) {
        return adminBannerApi.update(Number(id), data);
      }
      return adminBannerApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success(`${isEdit ? "Cập nhật" : "Tạo"} banner thành công!`);
      navigate("/admin/banners");
    },
    onError: (error: any) => {
      toast.error(`Lỗi khi ${isEdit ? "cập nhật" : "tạo"} banner: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.mediaUrl) {
      toast.error("Tiêu đề và Media là bắt buộc!");
      return;
    }

    if (formData.mediaType === "VIDEO" && !formData.thumbnailUrl) {
      toast.error("Video cần có thumbnail!");
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "media" | "thumbnail"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (type === "media") {
      if (formData.mediaType === "VIDEO" && !isVideo) {
        toast.error("Vui lòng chọn file video!");
        return;
      }
      if (formData.mediaType === "IMAGE" && !isImage) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }
    } else if (type === "thumbnail" && !isImage) {
      toast.error("Thumbnail phải là ảnh!");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      if (type === "media") {
        setUploading(true);
      } else {
        setUploadingThumbnail(true);
      }

      const endpoint =
        type === "media" && isVideo
          ? "/api/images/upload-trailer"
          : "/api/images/upload-poster";

      const response = await api.post(endpoint, formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = response.data.url || response.data;

      if (type === "media") {
        setFormData((prev) => ({ ...prev, mediaUrl: url }));
      } else {
        setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
      }

      toast.success("Upload thành công!");
    } catch (error: any) {
      toast.error(`Lỗi upload: ${error.response?.data?.message || error.message}`);
    } finally {
      if (type === "media") {
        setUploading(false);
      } else {
        setUploadingThumbnail(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || undefined }));
    }
  };

  return (
    <div style={{ padding: "0", maxWidth: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          padding: "12px",
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "800px",
        }}
      >
        <h3 style={{ margin: "0 0 20px 0" }}>
          {isEdit ? "Chỉnh sửa Banner" : "Tạo Banner mới"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              Loại Media *
            </label>
            <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="radio"
                  name="mediaType"
                  value="IMAGE"
                  checked={formData.mediaType === "IMAGE"}
                  onChange={handleChange}
                />
                <span>Ảnh</span>
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="radio"
                  name="mediaType"
                  value="VIDEO"
                  checked={formData.mediaType === "VIDEO"}
                  onChange={handleChange}
                />
                <span>Video</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              {formData.mediaType === "VIDEO" ? "Video *" : "Ảnh *"}
            </label>
            <input
              type="file"
              accept={formData.mediaType === "VIDEO" ? "video/*" : "image/*"}
              onChange={(e) => handleFileUpload(e, "media")}
              disabled={uploading}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
            {uploading && (
              <div style={{ color: "#666", fontSize: "12px" }}>
                Đang upload...
              </div>
            )}
            {formData.mediaUrl && (
              <div style={{ marginTop: "8px" }}>
                {formData.mediaType === "VIDEO" ? (
                  <video
                    src={formData.mediaUrl}
                    controls
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "300px",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <img
                    src={formData.mediaUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "200px",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {formData.mediaType === "VIDEO" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                Thumbnail (Ảnh đại diện) *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "thumbnail")}
                disabled={uploadingThumbnail}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              />
              {uploadingThumbnail && (
                <div style={{ color: "#666", fontSize: "12px" }}>
                  Đang upload thumbnail...
                </div>
              )}
              {formData.thumbnailUrl && (
                <div style={{ marginTop: "8px" }}>
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "150px",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              Link URL (Tùy chọn - chuyển hướng khi click)
            </label>
            <input
              type="url"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleChange}
              placeholder="/movies/123 hoặc https://example.com"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min="0"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <small style={{ color: "#666", fontSize: "12px" }}>
              Số nhỏ hơn sẽ hiển thị trước trong carousel
            </small>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span style={{ fontWeight: 600 }}>Hoạt động</span>
            </label>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              Ngày bắt đầu (Tùy chọn)
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
            >
              Ngày kết thúc (Tùy chọn)
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="fd-btn fd-btn-primary"
            >
              {saveMutation.isPending
                ? "Đang lưu..."
                : isEdit
                  ? "Cập nhật"
                  : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/banners")}
              className="fd-btn"
              style={{ background: "#6c757d", color: "white" }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
