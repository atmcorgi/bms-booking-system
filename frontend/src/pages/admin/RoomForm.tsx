import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import CustomSelect, { type SelectOption } from "../../components/shared/CustomSelect";
import ErrorModal from "../../components/shared/ErrorModal";

interface RoomFormData {
  name: string;
  supportedFormats: string;
  theaterId: number;
}

const RoomForm: React.FC = () => {
  const { theaterId, roomId } = useParams<{
    theaterId: string;
    roomId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!roomId;

  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    supportedFormats: "2D",
    theaterId: Number(theaterId!),
  });
  const [errorModal, setErrorModal] = useState({ show: false, message: "", title: "Lỗi" });

  // Load room data for editing
  const { data: room } = useQuery<{ name?: string; supportedFormats?: string }>(
    {
      queryKey: ["room", roomId],
      queryFn: async () => {
        const res = await adminTheaterApi.getRoom(
          Number(theaterId!),
          Number(roomId!)
        );
        return res.data as { name?: string; supportedFormats?: string };
      },
      enabled: isEditMode && !!roomId,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  React.useEffect(() => {
    if (room && isEditMode) {
      setFormData({
        name: room.name || "",
        supportedFormats: room.supportedFormats || "2D",
        theaterId: Number(theaterId!),
      });
    }
  }, [room, isEditMode, theaterId]);

  // Create/Update room mutation
  const mutation = useMutation({
    mutationFn: (data: RoomFormData) => {
      if (isEditMode) {
        return adminTheaterApi.updateRoom(
          Number(theaterId!),
          Number(roomId!),
          data
        );
      } else {
        return adminTheaterApi.createRoom(Number(theaterId!), data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theater-rooms", theaterId] });
      navigate(`/admin/theaters/${theaterId}/detail`);
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        title: "Lỗi",
        message: "Lỗi lưu phòng: " + (error?.message || "Không thể lưu phòng")
      });
    },
  });

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const formatOptions: SelectOption[] = [
    { value: "2D", label: "2D" },
    { value: "3D", label: "3D" },
    { value: "2D|3D", label: "2D + 3D" },
    { value: "IMAX", label: "IMAX" },
    { value: "2D|3D|IMAX", label: "2D + 3D + IMAX" },
  ];
  const selectedFormat = formatOptions.find(opt => opt.value === formData.supportedFormats);

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: 0,
              color: "#1f2937",
            }}
          >
            {isEditMode
              ? "Chỉnh sửa phòng chiếu"
              : "Thêm phòng chiếu mới"}
          </h1>
        </div>
        <button
          onClick={() => navigate(`/admin/theaters/${theaterId}/detail`)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Quay lại
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          maxWidth: "600px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Tên phòng chiếu *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
            required
            placeholder="VD: Phòng 1, Phòng VIP, IMAX..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Định dạng hỗ trợ *
          </label>
          <CustomSelect
            instanceId="format-select"
            options={formatOptions}
            value={selectedFormat}
            onChange={(option: SelectOption | null) => handleSelectChange('supportedFormats', option?.value.toString() || '')}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(`/admin/theaters/${theaterId}/detail`)}
            style={{
              padding: "12px 24px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              color: "#374151",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              padding: "12px 24px",
              border: "1px solid #10b981",
              borderRadius: "6px",
              backgroundColor: mutation.isPending ? "#9ca3af" : "#10b981",
              color: "white",
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {mutation.isPending
              ? "Đang lưu..."
              : isEditMode
                ? "Cập nhật phòng"
                : "Tạo phòng"}
          </button>
        </div>
      </form>

      <ErrorModal
        isOpen={errorModal.show}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "", title: "Lỗi" })}
      />
    </div>
  );
};

export default RoomForm;
