import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTheaterApi } from "../../services/adminTheaterApi";
import TheaterManageTabs from "./TheaterManageTabs.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ErrorModal from "../../components/shared/ErrorModal";
import {
  faSearch,
  faFilm,
  faSpinner,
  faMapMarkerAlt,
  faMapMarkedAlt,
  faMap,
  faEdit,
  faSave,
  faInfoCircle,
  faList,
} from "@fortawesome/free-solid-svg-icons";

// Custom Select Component
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  icon,
}: {
  value: number;
  onChange: (value: number) => void;
  options: Array<{ id: number; name: string }>;
  placeholder: string;
  disabled?: boolean;
  icon?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.id === value);
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} style={{ position: "relative", width: "100%" }}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "12px 16px",
          paddingRight: "40px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          background: disabled ? "#f9fafb" : "#ffffff",
          color: disabled ? "#6b7280" : "#333",
          outline: "none",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 2px 0 rgba(139, 115, 85, 0.05)",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = "#6366f1";
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow =
              "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
          }
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedOption ? (
            <>
              {icon && (
                <FontAwesomeIcon
                  icon={icon}
                  style={{ fontSize: "14px", color: "#6366f1" }}
                />
              )}
              <span>{selectedOption.name}</span>
            </>
          ) : (
            <>
              {icon && (
                <FontAwesomeIcon
                  icon={icon}
                  style={{ fontSize: "14px", color: "#9ca3af" }}
                />
              )}
              <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                {placeholder}
              </span>
            </>
          )}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "#8b7355",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(139, 115, 85, 0.15)",
            zIndex: 1000,
            maxHeight: "200px",
            overflow: "hidden",
          }}
        >
          {/* Search Input */}
          {options.length > 5 && (
            <div style={{ padding: "8px", borderBottom: "1px solid #d9d2b7" }}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#f8fafc",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d9d2b7";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {/* Options List */}
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f4ff";
                    e.currentTarget.style.color = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#333";
                  }}
                >
                  <span>{option.name}</span>
                  {value === option.id && (
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "#8b7355",
                        fontSize: "16px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "14px",
                  fontStyle: "italic",
                }}
              >
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Modal component for autofill results
const AutofillModal = ({
  isOpen,
  onClose,
  theaterInfo,
}: {
  isOpen: boolean;
  onClose: () => void;
  theaterInfo: {
    name: string;
    address: string;
    province: string;
    district: string;
    phone: string;
    website: string;
    coordinates: string;
  } | null;
}) => {
  if (!isOpen || !theaterInfo) return null;

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: string;
  }) => (
    <div
      style={{
        padding: "12px 16px",
        background: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#6b7280",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {icon && <span style={{ marginRight: "6px" }}>{icon}</span>}
        {label}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: "#1f2937",
          fontWeight: "500",
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: 0,
              color: "#1f2937",
            }}
          >
            🎬 Thông tin rạp chiếu phim
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "#9ca3af",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.color = "#1f2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ display: "grid", gap: "12px" }}>
            <InfoRow label="Tên rạp" value={theaterInfo.name} icon="🎬" />
            <InfoRow label="Địa chỉ" value={theaterInfo.address} icon="📍" />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoRow label="Tỉnh/TP" value={theaterInfo.province} icon="🏙️" />
              <InfoRow
                label="Quận/Huyện"
                value={theaterInfo.district}
                icon="🏘️"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoRow label="Điện thoại" value={theaterInfo.phone} icon="📞" />
              <InfoRow label="Website" value={theaterInfo.website} icon="🌐" />
            </div>

            <InfoRow label="Tọa độ" value={theaterInfo.coordinates} icon="🗺️" />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#6366f1";
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
// import { adminProvinceApi } from "../../services/adminProvinceApi";
// import { adminDistrictApi } from "../../services/adminDistrictApi";
import "../../styles/admin-table.css";

interface TheaterFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  description: string;
  latitude?: number;
  longitude?: number;
  openTime: string;
  closeTime: string;
  provinceId: number;
  districtId: number;
}

const TheaterForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isEditMode = Boolean(id) && location.pathname.includes("/edit");
  const isViewMode = Boolean(id) && location.pathname.includes("/view");

  const [formData, setFormData] = useState<TheaterFormData>({
    name: "",
    code: "",
    address: "",
    phone: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
    openTime: "08:00",
    closeTime: "23:00",
    provinceId: 0,
    districtId: 0,
  });
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [searchingTheater, setSearchingTheater] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isAutoFillComplete, setIsAutoFillComplete] = useState(false);
  const [showAutofillModal, setShowAutofillModal] = useState(false);
  const [autofillInfo, setAutofillInfo] = useState<{
    name: string;
    address: string;
    province: string;
    district: string;
    phone: string;
    website: string;
    coordinates: string;
  } | null>(null);
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  // Load theater data for editing/viewing
  const { data: theaterData, isLoading: theaterLoading } = useQuery({
    queryKey: ["theater", id],
    queryFn: () => {
      return adminTheaterApi.getById(id!);
    },
    enabled: isEditMode || isViewMode,
  });

  // Load provinces - tạo dữ liệu thật
  const { data: provinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: () =>
      Promise.resolve({
        data: [
          { id: 1, name: "Hà Nội" },
          { id: 2, name: "TP.HCM" },
          { id: 3, name: "Đà Nẵng" },
          { id: 4, name: "Hải Phòng" },
          { id: 5, name: "Cần Thơ" },
          { id: 6, name: "An Giang" },
          { id: 7, name: "Bà Rịa - Vũng Tàu" },
          { id: 8, name: "Bắc Giang" },
          { id: 9, name: "Bắc Kạn" },
          { id: 10, name: "Bạc Liêu" },
          { id: 11, name: "Bắc Ninh" },
          { id: 12, name: "Bến Tre" },
          { id: 13, name: "Bình Định" },
          { id: 14, name: "Bình Dương" },
          { id: 15, name: "Bình Phước" },
          { id: 16, name: "Bình Thuận" },
          { id: 17, name: "Cà Mau" },
          { id: 18, name: "Cao Bằng" },
          { id: 19, name: "Đắk Lắk" },
          { id: 20, name: "Đắk Nông" },
          { id: 21, name: "Điện Biên" },
          { id: 22, name: "Đồng Nai" },
          { id: 23, name: "Đồng Tháp" },
          { id: 24, name: "Gia Lai" },
          { id: 25, name: "Hà Giang" },
          { id: 26, name: "Hà Nam" },
          { id: 27, name: "Hà Tĩnh" },
          { id: 28, name: "Hải Dương" },
          { id: 29, name: "Hậu Giang" },
          { id: 30, name: "Hòa Bình" },
          { id: 31, name: "Hưng Yên" },
          { id: 32, name: "Khánh Hòa" },
          { id: 33, name: "Kiên Giang" },
          { id: 34, name: "Kon Tum" },
          { id: 35, name: "Lai Châu" },
          { id: 36, name: "Lâm Đồng" },
          { id: 37, name: "Lạng Sơn" },
          { id: 38, name: "Lào Cai" },
          { id: 39, name: "Long An" },
          { id: 40, name: "Nam Định" },
          { id: 41, name: "Nghệ An" },
          { id: 42, name: "Ninh Bình" },
          { id: 43, name: "Ninh Thuận" },
          { id: 44, name: "Phú Thọ" },
          { id: 45, name: "Phú Yên" },
          { id: 46, name: "Quảng Bình" },
          { id: 47, name: "Quảng Nam" },
          { id: 48, name: "Quảng Ngãi" },
          { id: 49, name: "Quảng Ninh" },
          { id: 50, name: "Quảng Trị" },
          { id: 51, name: "Sóc Trăng" },
          { id: 52, name: "Sơn La" },
          { id: 53, name: "Tây Ninh" },
          { id: 54, name: "Thái Bình" },
          { id: 55, name: "Thái Nguyên" },
          { id: 56, name: "Thanh Hóa" },
          { id: 57, name: "Thừa Thiên Huế" },
          { id: 58, name: "Tiền Giang" },
          { id: 59, name: "Trà Vinh" },
          { id: 60, name: "Tuyên Quang" },
          { id: 61, name: "Vĩnh Long" },
          { id: 62, name: "Vĩnh Phúc" },
          { id: 63, name: "Yên Bái" },
        ],
      }),
  });

  // Load districts based on selected province - dữ liệu đầy đủ cho tất cả tỉnh/thành phố
  const { data: districts } = useQuery({
    queryKey: ["districts", formData.provinceId],
    queryFn: () => {
      const getDistrictsByProvince = (provinceId: number) => {
        const districtsData: {
          [key: number]: Array<{ id: number; name: string }>;
        } = {
          1: [
            // Hà Nội
            { id: 1, name: "Ba Đình" },
            { id: 2, name: "Hoàn Kiếm" },
            { id: 3, name: "Tây Hồ" },
            { id: 4, name: "Long Biên" },
            { id: 5, name: "Cầu Giấy" },
            { id: 6, name: "Đống Đa" },
            { id: 7, name: "Hai Bà Trưng" },
            { id: 8, name: "Hoàng Mai" },
            { id: 9, name: "Thanh Xuân" },
            { id: 10, name: "Sóc Sơn" },
            { id: 11, name: "Đông Anh" },
            { id: 12, name: "Gia Lâm" },
            { id: 13, name: "Nam Từ Liêm" },
            { id: 14, name: "Thanh Trì" },
            { id: 15, name: "Bắc Từ Liêm" },
            { id: 16, name: "Mê Linh" },
            { id: 17, name: "Hà Đông" },
            { id: 18, name: "Sơn Tây" },
            { id: 19, name: "Ba Vì" },
            { id: 20, name: "Phúc Thọ" },
            { id: 21, name: "Đan Phượng" },
            { id: 22, name: "Hoài Đức" },
            { id: 23, name: "Quốc Oai" },
            { id: 24, name: "Thạch Thất" },
            { id: 25, name: "Chương Mỹ" },
            { id: 26, name: "Thanh Oai" },
            { id: 27, name: "Thường Tín" },
            { id: 28, name: "Phú Xuyên" },
            { id: 29, name: "Ứng Hòa" },
            { id: 30, name: "Mỹ Đức" },
          ],
          2: [
            // TP.HCM
            { id: 31, name: "Quận 1" },
            { id: 32, name: "Quận 2" },
            { id: 33, name: "Quận 3" },
            { id: 34, name: "Quận 4" },
            { id: 35, name: "Quận 5" },
            { id: 36, name: "Quận 6" },
            { id: 37, name: "Quận 7" },
            { id: 38, name: "Quận 8" },
            { id: 39, name: "Quận 9" },
            { id: 40, name: "Quận 10" },
            { id: 41, name: "Quận 11" },
            { id: 42, name: "Quận 12" },
            { id: 43, name: "Thủ Đức" },
            { id: 44, name: "Gò Vấp" },
            { id: 45, name: "Bình Thạnh" },
            { id: 46, name: "Tân Bình" },
            { id: 47, name: "Tân Phú" },
            { id: 48, name: "Phú Nhuận" },
            { id: 49, name: "Bình Tân" },
            { id: 50, name: "Hóc Môn" },
            { id: 51, name: "Củ Chi" },
            { id: 52, name: "Bình Chánh" },
            { id: 53, name: "Nhà Bè" },
            { id: 54, name: "Cần Giờ" },
          ],
          3: [
            // Đà Nẵng
            { id: 55, name: "Hải Châu" },
            { id: 56, name: "Thanh Khê" },
            { id: 57, name: "Sơn Trà" },
            { id: 58, name: "Ngũ Hành Sơn" },
            { id: 59, name: "Liên Chiểu" },
            { id: 60, name: "Cẩm Lệ" },
            { id: 61, name: "Hòa Vang" },
            { id: 62, name: "Hoàng Sa" },
          ],
          4: [
            // Hải Phòng
            { id: 63, name: "Hồng Bàng" },
            { id: 64, name: "Ngô Quyền" },
            { id: 65, name: "Lê Chân" },
            { id: 66, name: "Hải An" },
            { id: 67, name: "Kiến An" },
            { id: 68, name: "Đồ Sơn" },
            { id: 69, name: "Dương Kinh" },
            { id: 70, name: "Thuỷ Nguyên" },
            { id: 71, name: "An Dương" },
            { id: 72, name: "An Lão" },
            { id: 73, name: "Kiến Thuỵ" },
            { id: 74, name: "Tiên Lãng" },
            { id: 75, name: "Vĩnh Bảo" },
            { id: 76, name: "Cát Hải" },
            { id: 77, name: "Bạch Long Vĩ" },
          ],
          5: [
            // Cần Thơ
            { id: 78, name: "Ninh Kiều" },
            { id: 79, name: "Ô Môn" },
            { id: 80, name: "Bình Thuỷ" },
            { id: 81, name: "Cái Răng" },
            { id: 82, name: "Thốt Nốt" },
            { id: 83, name: "Vĩnh Thạnh" },
            { id: 84, name: "Cờ Đỏ" },
            { id: 85, name: "Phong Điền" },
            { id: 86, name: "Thới Lai" },
          ],
        };
        return districtsData[provinceId] || [];
      };

      return Promise.resolve({
        data: getDistrictsByProvince(formData.provinceId),
      });
    },
    enabled: formData.provinceId > 0,
  });

  // Load theater data when editing/viewing
  useEffect(() => {
    if (theaterData?.data) {
      const data = theaterData.data;

      setFormData({
        name: data.name || "",
        code: data.code || "",
        address: data.address || "",
        phone: data.phone || "",
        description: data.description || "",
        latitude: data.latitude,
        longitude: data.longitude,
        openTime: data.openTime || "08:00",
        closeTime: data.closeTime || "23:00",
        provinceId: data.province?.id || 0,
        districtId: data.district?.id || 0,
      });
    }
  }, [theaterData]);

  // Reset district when province changes (but not during auto-fill or data loading)
  useEffect(() => {
    // Chỉ reset khi:
    // 1. provinceId > 0 (có tỉnh được chọn)
    // 2. Không đang auto-fill
    // 3. Không đang load theater data
    // 4. Không phải đang edit/view mode (để tránh reset khi load data)
    // 5. Đã hoàn thành autofill (isAutoFillComplete = false nghĩa là user đã thay đổi thủ công)
    if (
      formData.provinceId > 0 &&
      !isAutoFilling &&
      !theaterLoading &&
      !isEditMode &&
      !isViewMode &&
      !isAutoFillComplete
    ) {
      setFormData((prev) => ({ ...prev, districtId: 0 }));
    }
  }, [
    formData.provinceId,
    isAutoFilling,
    theaterLoading,
    isEditMode,
    isViewMode,
    isAutoFillComplete,
  ]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data: TheaterFormData) => {
      if (isEditMode) {
        return adminTheaterApi.update(id!, data);
      } else {
        return adminTheaterApi.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-theaters"] });
      navigate("/admin/theaters");
    },
    onError: (error: any) => {
      console.error("Error saving theater:", error);
      setErrorModal({
        show: true,
        message:
          "Lỗi lưu rạp: " +
          (error?.response?.data?.error ||
            error?.message ||
            "Không thể lưu rạp"),
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Reset auto-fill flags when user manually changes province
    if (name === "provinceId") {
      setIsAutoFillComplete(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "provinceId" || name === "districtId" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isViewMode) {
      // Validate required fields
      if (!formData.provinceId || formData.provinceId === 0) {
        setErrorModal({ show: true, message: "Vui lòng chọn Tỉnh/Thành phố!" });
        return;
      }
      if (!formData.districtId || formData.districtId === 0) {
        setErrorModal({ show: true, message: "Vui lòng chọn Quận/Huyện!" });
        return;
      }
      mutation.mutate(formData);
    }
  };

  // Function to search theater by name using OpenStreetMap
  const searchTheaterByName = async () => {
    if (!formData.name.trim()) {
      setErrorModal({
        show: true,
        message: "Vui lòng nhập tên rạp trước khi tìm kiếm",
      });
      return;
    }

    setSearchingTheater(true);
    try {
      // Sử dụng Nominatim API (cùng hệ thống với trang web OpenStreetMap)
      const searchTerm = formData.name.trim();

      // Tạo các query tìm kiếm khác nhau
      const searchQueries = [
        `${searchTerm} cinema Vietnam`,
        `${searchTerm} rạp phim Vietnam`,
        `${searchTerm} movie theater Vietnam`,
        searchTerm, // Tìm kiếm trực tiếp
      ];

      let foundTheater = null;

      // Thử từng query cho đến khi tìm thấy
      for (const query of searchQueries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn&addressdetails=1&extratags=1`
        );

        if (response.ok) {
          const data = await response.json();

          // Tìm rạp phim trong kết quả
          const cinema = data.find((item: any) => {
            const name = item.display_name?.toLowerCase() || "";
            const type = item.type?.toLowerCase() || "";
            const category = item.category?.toLowerCase() || "";

            return (
              name.includes("cinema") ||
              name.includes("rạp") ||
              name.includes("movie") ||
              type.includes("cinema") ||
              category.includes("cinema") ||
              item.extratags?.amenity === "cinema" ||
              item.extratags?.leisure === "cinema" ||
              item.extratags?.shop === "cinema"
            );
          });

          if (cinema) {
            foundTheater = cinema;
            break;
          }
        }
      }

      if (foundTheater) {
        // Tự động fill thông tin chi tiết
        const theaterName = formData.name; // Giữ tên người dùng nhập
        const fullAddress = foundTheater.display_name || formData.address;

        // Tạo mô tả chi tiết
        let description = "";
        if (foundTheater.extratags?.website) {
          description += `Website: ${foundTheater.extratags.website}\n`;
        }
        if (foundTheater.extratags?.["brand:wikidata"]) {
          description += `Wikidata: ${foundTheater.extratags["brand:wikidata"]}\n`;
        }
        if (foundTheater.extratags?.brand) {
          description += `Brand: ${foundTheater.extratags.brand}\n`;
        }
        description += `Nguồn: OpenStreetMap (${foundTheater.osm_type}:${foundTheater.osm_id})`;

        // Tự động xác định tỉnh và quận từ địa chỉ
        let provinceId = 0;
        let districtId = 0;

        // Mapping tỉnh/thành phố
        const provinceMapping: { [key: string]: number } = {
          "hà nội": 1,
          "hồ chí minh": 2,
          "đà nẵng": 3,
          "hải phòng": 4,
          "cần thơ": 5,
          "an giang": 6,
          "bà rịa - vũng tàu": 7,
          "bắc giang": 8,
          "bắc kạn": 9,
          "bạc liêu": 10,
          "bắc ninh": 11,
          "bến tre": 12,
          "bình định": 13,
          "bình dương": 14,
          "bình phước": 15,
          "bình thuận": 16,
          "cà mau": 17,
          "cao bằng": 18,
          "đắk lắk": 19,
          "đắk nông": 20,
          "điện biên": 21,
          "đồng nai": 22,
          "đồng tháp": 23,
          "gia lai": 24,
          "hà giang": 25,
          "hà nam": 26,
          "hà tĩnh": 27,
          "hải dương": 28,
          "hậu giang": 29,
          "hòa bình": 30,
          "hưng yên": 31,
          "khánh hòa": 32,
          "kiên giang": 33,
          "kon tum": 34,
          "lai châu": 35,
          "lâm đồng": 36,
          "lạng sơn": 37,
          "lào cai": 38,
          "long an": 39,
          "nam định": 40,
          "nghệ an": 41,
          "ninh bình": 42,
          "ninh thuận": 43,
          "phú thọ": 44,
          "phú yên": 45,
          "quảng bình": 46,
          "quảng nam": 47,
          "quảng ngãi": 48,
          "quảng ninh": 49,
          "quảng trị": 50,
          "sóc trăng": 51,
          "sơn la": 52,
          "tây ninh": 53,
          "thái bình": 54,
          "thái nguyên": 55,
          "thanh hóa": 56,
          "thừa thiên huế": 57,
          "tiền giang": 58,
          "trà vinh": 59,
          "tuyên quang": 60,
          "vĩnh long": 61,
          "vĩnh phúc": 62,
          "yên bái": 63,
        };

        // Tìm tỉnh trong địa chỉ
        const addressLower = fullAddress.toLowerCase();
        for (const [provinceName, id] of Object.entries(provinceMapping)) {
          if (addressLower.includes(provinceName)) {
            provinceId = id;
            break;
          }
        }

        // Mapping quận/huyện cho các tỉnh/thành phố - cải thiện logic tìm kiếm
        const getDistrictMapping = (provinceId: number) => {
          const districtMappings: { [key: number]: { [key: string]: number } } =
            {
              1: {
                // Hà Nội
                "ba đình": 1,
                "ba dinh": 1,
                "hoàn kiếm": 2,
                "hoan kiem": 2,
                "tây hồ": 3,
                "tay ho": 3,
                "long biên": 4,
                "long bien": 4,
                "cầu giấy": 5,
                "cau giay": 5,
                "đống đa": 6,
                "dong da": 6,
                "hai bà trưng": 7,
                "hai ba trung": 7,
                "hoàng mai": 8,
                "hoang mai": 8,
                "thanh xuân": 9,
                "thanh xuan": 9,
                "sóc sơn": 10,
                "soc son": 10,
                "đông anh": 11,
                "dong anh": 11,
                "gia lâm": 12,
                "gia lam": 12,
                "nam từ liêm": 13,
                "nam tu liem": 13,
                "thanh trì": 14,
                "thanh tri": 14,
                "bắc từ liêm": 15,
                "bac tu liem": 15,
                "mê linh": 16,
                "me linh": 16,
                "hà đông": 17,
                "ha dong": 17,
                "sơn tây": 18,
                "son tay": 18,
                "ba vì": 19,
                "ba vi": 19,
                "phúc thọ": 20,
                "phuc tho": 20,
                "đan phượng": 21,
                "dan phuong": 21,
                "hoài đức": 22,
                "hoai duc": 22,
                "quốc oai": 23,
                "quoc oai": 23,
                "thạch thất": 24,
                "thach that": 24,
                "chương mỹ": 25,
                "chuong my": 25,
                "thanh oai": 26,
                "thường tín": 27,
                "thuong tin": 27,
                "phú xuyên": 28,
                "phu xuyen": 28,
                "ứng hòa": 29,
                "ung hoa": 29,
                "mỹ đức": 30,
                "my duc": 30,
              },
              2: {
                // TP.HCM
                "quận 1": 31,
                "quan 1": 31,
                "quận 2": 32,
                "quan 2": 32,
                "quận 3": 33,
                "quan 3": 33,
                "quận 4": 34,
                "quan 4": 34,
                "quận 5": 35,
                "quan 5": 35,
                "quận 6": 36,
                "quan 6": 36,
                "quận 7": 37,
                "quan 7": 37,
                "quận 8": 38,
                "quan 8": 38,
                "quận 9": 39,
                "quan 9": 39,
                "quận 10": 40,
                "quan 10": 40,
                "quận 11": 41,
                "quan 11": 41,
                "quận 12": 42,
                "quan 12": 42,
                "thủ đức": 43,
                "thu duc": 43,
                "gò vấp": 44,
                "go vap": 44,
                "bình thạnh": 45,
                "binh thanh": 45,
                "tân bình": 46,
                "tan binh": 46,
                "tân phú": 47,
                "tan phu": 47,
                "phú nhuận": 48,
                "phu nhuan": 48,
                "bình tân": 49,
                "binh tan": 49,
                "hóc môn": 50,
                "hoc mon": 50,
                "củ chi": 51,
                "cu chi": 51,
                "bình chánh": 52,
                "binh chanh": 52,
                "nhà bè": 53,
                "nha be": 53,
                "cần giờ": 54,
                "can gio": 54,
              },
              3: {
                // Đà Nẵng
                "hải châu": 55,
                "hai chau": 55,
                "thanh khê": 56,
                "thanh khe": 56,
                "sơn trà": 57,
                "son tra": 57,
                "ngũ hành sơn": 58,
                "ngu hanh son": 58,
                "liên chiểu": 59,
                "lien chieu": 59,
                "cẩm lệ": 60,
                "cam le": 60,
                "hòa vang": 61,
                "hoa vang": 61,
                "hoàng sa": 62,
                "hoang sa": 62,
              },
              4: {
                // Hải Phòng
                "hồng bàng": 63,
                "hong bang": 63,
                "ngô quyền": 64,
                "ngo quyen": 64,
                "lê chân": 65,
                "le chan": 65,
                "hải an": 66,
                "hai an": 66,
                "kiến an": 67,
                "kien an": 67,
                "đồ sơn": 68,
                "do son": 68,
                "dương kinh": 69,
                "duong kinh": 69,
                "thuỷ nguyên": 70,
                "thuy nguyen": 70,
                "an dương": 71,
                "an duong": 71,
                "an lão": 72,
                "an lao": 72,
                "kiến thuỵ": 73,
                "kien thuy": 73,
                "tiên lãng": 74,
                "tien lang": 74,
                "vĩnh bảo": 75,
                "vinh bao": 75,
                "cát hải": 76,
                "cat hai": 76,
                "bạch long vĩ": 77,
                "bach long vi": 77,
              },
              5: {
                // Cần Thơ
                "ninh kiều": 78,
                "ninh kieu": 78,
                "ô môn": 79,
                "o mon": 79,
                "bình thuỷ": 80,
                "binh thuy": 80,
                "cái răng": 81,
                "cai rang": 81,
                "thốt nốt": 82,
                "thot not": 82,
                "vĩnh thạnh": 83,
                "vinh thanh": 83,
                "cờ đỏ": 84,
                "co do": 84,
                "phong điền": 85,
                "phong dien": 85,
                "thới lai": 86,
                "thoi lai": 86,
              },
            };
          return districtMappings[provinceId] || {};
        };

        const districtMapping = getDistrictMapping(provinceId);

        for (const [districtName, id] of Object.entries(districtMapping)) {
          // Tìm kiếm trực tiếp
          if (addressLower.includes(districtName)) {
            districtId = id;
            break;
          }

          // Tìm kiếm với "phường", "quận", "huyện"
          const variations = [
            `phường ${districtName}`,
            `quận ${districtName}`,
            `huyện ${districtName}`,
            `thị xã ${districtName}`,
            `thành phố ${districtName}`,
          ];

          for (const variation of variations) {
            if (addressLower.includes(variation)) {
              districtId = id;
              break;
            }
          }

          if (districtId > 0) break;
        }

        // Set auto-fill flag and form data immediately
        setIsAutoFilling(true);
        setIsAutoFillComplete(true);

        // Set form data immediately without delay
        setFormData((prev) => ({
          ...prev,
          name: theaterName,
          address: fullAddress,
          phone:
            foundTheater.extratags?.phone ||
            foundTheater.extratags?.["contact:phone"] ||
            foundTheater.extratags?.["contact:mobile"] ||
            prev.phone,
          latitude: parseFloat(foundTheater.lat),
          longitude: parseFloat(foundTheater.lon),
          description: description.trim() || prev.description,
          provinceId: provinceId,
          districtId: districtId,
        }));

        // Reset flags after a delay to prevent immediate reset
        setTimeout(() => {
          setIsAutoFilling(false);
          // Không reset isAutoFillComplete ngay - để nó tự reset khi user thay đổi province
        }, 1000);

        // Hiển thị thông báo đẹp hơn
        const provinceName =
          Object.keys(provinceMapping).find(
            (key) => provinceMapping[key] === provinceId
          ) || "Chưa xác định";

        // Tạo districtMapping cho thông báo - hỗ trợ tất cả tỉnh/thành phố
        const getDistrictNameForDisplay = (
          provinceId: number,
          districtId: number
        ) => {
          const districtMappings: { [key: number]: { [key: number]: string } } =
            {
              1: {
                // Hà Nội
                1: "Ba Đình",
                2: "Hoàn Kiếm",
                3: "Tây Hồ",
                4: "Long Biên",
                5: "Cầu Giấy",
                6: "Đống Đa",
                7: "Hai Bà Trưng",
                8: "Hoàng Mai",
                9: "Thanh Xuân",
                10: "Sóc Sơn",
                11: "Đông Anh",
                12: "Gia Lâm",
                13: "Nam Từ Liêm",
                14: "Thanh Trì",
                15: "Bắc Từ Liêm",
                16: "Mê Linh",
                17: "Hà Đông",
                18: "Sơn Tây",
                19: "Ba Vì",
                20: "Phúc Thọ",
                21: "Đan Phượng",
                22: "Hoài Đức",
                23: "Quốc Oai",
                24: "Thạch Thất",
                25: "Chương Mỹ",
                26: "Thanh Oai",
                27: "Thường Tín",
                28: "Phú Xuyên",
                29: "Ứng Hòa",
                30: "Mỹ Đức",
              },
              2: {
                // TP.HCM
                31: "Quận 1",
                32: "Quận 2",
                33: "Quận 3",
                34: "Quận 4",
                35: "Quận 5",
                36: "Quận 6",
                37: "Quận 7",
                38: "Quận 8",
                39: "Quận 9",
                40: "Quận 10",
                41: "Quận 11",
                42: "Quận 12",
                43: "Thủ Đức",
                44: "Gò Vấp",
                45: "Bình Thạnh",
                46: "Tân Bình",
                47: "Tân Phú",
                48: "Phú Nhuận",
                49: "Bình Tân",
                50: "Hóc Môn",
                51: "Củ Chi",
                52: "Bình Chánh",
                53: "Nhà Bè",
                54: "Cần Giờ",
              },
              3: {
                // Đà Nẵng
                55: "Hải Châu",
                56: "Thanh Khê",
                57: "Sơn Trà",
                58: "Ngũ Hành Sơn",
                59: "Liên Chiểu",
                60: "Cẩm Lệ",
                61: "Hòa Vang",
                62: "Hoàng Sa",
              },
              4: {
                // Hải Phòng
                63: "Hồng Bàng",
                64: "Ngô Quyền",
                65: "Lê Chân",
                66: "Hải An",
                67: "Kiến An",
                68: "Đồ Sơn",
                69: "Dương Kinh",
                70: "Thuỷ Nguyên",
                71: "An Dương",
                72: "An Lão",
                73: "Kiến Thuỵ",
                74: "Tiên Lãng",
                75: "Vĩnh Bảo",
                76: "Cát Hải",
                77: "Bạch Long Vĩ",
              },
              5: {
                // Cần Thơ
                78: "Ninh Kiều",
                79: "Ô Môn",
                80: "Bình Thuỷ",
                81: "Cái Răng",
                82: "Thốt Nốt",
                83: "Vĩnh Thạnh",
                84: "Cờ Đỏ",
                85: "Phong Điền",
                86: "Thới Lai",
              },
            };
          return districtMappings[provinceId]?.[districtId] || "Chưa xác định";
        };

        const districtName = getDistrictNameForDisplay(provinceId, districtId);

        // Hiển thị modal thay vì alert
        setAutofillInfo({
          name: theaterName,
          address: fullAddress,
          province: provinceName.toUpperCase(),
          district: districtName.toUpperCase(),
          phone:
            foundTheater.extratags?.phone ||
            foundTheater.extratags?.["contact:phone"] ||
            "Chưa có",
          website: foundTheater.extratags?.website || "Chưa có",
          coordinates: `${foundTheater.lat}, ${foundTheater.lon}`,
        });
        setShowAutofillModal(true);
      } else {
        setErrorModal({
          show: true,
          message:
            "Không tìm thấy rạp phim nào với tên này. Hãy thử tìm kiếm trên Google Maps hoặc nhập thủ công.",
        });
      }
    } catch (error: any) {
      console.error("Error searching theater:", error);
      setErrorModal({
        show: true,
        message: `Lỗi khi tìm kiếm rạp: ${error?.message || "Vui lòng thử lại hoặc nhập thủ công."}`,
      });
    } finally {
      setSearchingTheater(false);
    }
  };

  // Function to get coordinates from address
  const getCoordinatesFromAddress = async () => {
    if (!formData.address.trim()) {
      setErrorModal({
        show: true,
        message: "Vui lòng nhập địa chỉ trước khi lấy tọa độ",
      });
      return;
    }

    setLoadingCoordinates(true);
    try {
      const searchQuery = `${formData.address}, Vietnam`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=vn`
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          }));

          setErrorModal({
            show: true,
            message: `Đã lấy tọa độ thành công!\nVĩ độ: ${result.lat}\nKinh độ: ${result.lon}`,
          });
        } else {
          setErrorModal({
            show: true,
            message: "Không tìm thấy tọa độ. Vui lòng sử dụng Google Maps.",
          });
        }
      } else {
        throw new Error("Không thể kết nối đến dịch vụ tìm kiếm");
      }
    } catch (error) {
      console.error("Error getting coordinates:", error);
      setErrorModal({
        show: true,
        message: "Lỗi khi lấy tọa độ. Vui lòng sử dụng Google Maps.",
      });
    } finally {
      setLoadingCoordinates(false);
    }
  };

  return (
    <div
      style={{
        padding: "0",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#fff",
            color: "#1f2937",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => navigate("/admin/theaters")}
              style={{
                padding: "10px 16px",
                background: "#fff",
                color: "#6366f1",
                border: "1px solid #6366f1",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#6366f1";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#6366f1";
              }}
            >
              <span style={{ fontSize: "14px" }}>←</span>
              Quay lại
            </button>
            <h3
              style={{
                margin: 0,
                lineHeight: 1,
                fontWeight: "300",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isViewMode
                ? "Xem chi tiết rạp"
                : isEditMode
                  ? "Chỉnh sửa rạp"
                  : "Thêm rạp mới"}
            </h3>
          </div>
        </div>

        {/* Form Container */}
        <div
          style={{
            padding: "24px",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Basic Information & Location Section - Side by Side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Basic Information Section */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(139, 115, 85, 0.1)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 20px 0",
                    color: "#333",
                    fontSize: "18px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faList}
                    style={{ fontSize: "18px", marginRight: "8px" }}
                  />
                  Thông Tin Cơ Bản
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#5d4e37",
                        marginBottom: "4px",
                      }}
                    >
                      Tên rạp *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập tên rạp..."
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: isViewMode ? "#f9fafb" : "#ffffff",
                        outline: "none",
                        transition: "all 0.2s ease",
                        cursor: isViewMode ? "not-allowed" : "text",
                      }}
                      onFocus={(e) => {
                        if (!isViewMode) {
                          e.target.style.borderColor = "#8b7355";
                        }
                      }}
                      onBlur={(e) => {
                        if (!isViewMode) {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow =
                            "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                        }
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#5d4e37",
                        marginBottom: "4px",
                      }}
                    >
                      Mã rạp *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="VD: CGV001"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: isViewMode ? "#f9fafb" : "#ffffff",
                        outline: "none",
                        transition: "all 0.2s ease",
                        cursor: isViewMode ? "not-allowed" : "text",
                      }}
                      onFocus={(e) => {
                        if (!isViewMode) {
                          e.target.style.borderColor = "#8b7355";
                        }
                      }}
                      onBlur={(e) => {
                        if (!isViewMode) {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow =
                            "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                        }
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#5d4e37",
                        marginBottom: "4px",
                      }}
                    >
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, đường, phường/xã"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: isViewMode ? "#f9fafb" : "#ffffff",
                        outline: "none",
                        transition: "all 0.2s ease",
                        cursor: isViewMode ? "not-allowed" : "text",
                      }}
                      onFocus={(e) => {
                        if (!isViewMode) {
                          e.target.style.borderColor = "#8b7355";
                        }
                      }}
                      onBlur={(e) => {
                        if (!isViewMode) {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow =
                            "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(139, 115, 85, 0.1)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 20px 0",
                    color: "#333",
                    fontSize: "18px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>📍</span>
                  Thông Tin Địa Lý
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#5d4e37",
                        marginBottom: "4px",
                      }}
                    >
                      Tỉnh/Thành phố *
                    </label>
                    <CustomSelect
                      value={formData.provinceId}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          provinceId: value,
                          districtId: 0,
                        }));
                      }}
                      options={provinces?.data || []}
                      placeholder="Chọn tỉnh/thành phố"
                      disabled={isViewMode}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#5d4e37",
                        marginBottom: "4px",
                      }}
                    >
                      Quận/Huyện *
                    </label>
                    <CustomSelect
                      value={formData.districtId}
                      onChange={(value) => {
                        setFormData((prev) => ({ ...prev, districtId: value }));
                      }}
                      options={districts?.data || []}
                      placeholder={
                        !districts?.data?.length
                          ? "Chọn tỉnh/thành phố trước"
                          : "Chọn quận/huyện"
                      }
                      disabled={isViewMode || !districts?.data?.length}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Theater search and coordinates helper */}
            {!isViewMode && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #faf9f6 0%, #f5f3ef 100%)",
                  padding: "24px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(139, 115, 85, 0.1)",
                  marginBottom: "24px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 20px 0",
                    color: "#333",
                    fontSize: "18px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ fontSize: "18px", marginRight: "8px" }}
                  />
                  Tìm Kiếm & Tọa Độ
                </h4>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={searchTheaterByName}
                    disabled={searchingTheater || !formData.name.trim()}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "10px 16px",
                      border: "1px solid #6366f1",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#6366f1",
                      cursor:
                        searchingTheater || !formData.name.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!searchingTheater && formData.name.trim()) {
                        e.currentTarget.style.background = "#6366f1";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!searchingTheater && formData.name.trim()) {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#6366f1";
                      }
                    }}
                  >
                    {searchingTheater ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Đang tìm
                        rạp...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faFilm} /> Tìm rạp qua tên
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={getCoordinatesFromAddress}
                    disabled={loadingCoordinates || !formData.address.trim()}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "10px 16px",
                      border: "1px solid #059669",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#059669",
                      cursor:
                        loadingCoordinates || !formData.address.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingCoordinates && formData.address.trim()) {
                        e.currentTarget.style.background = "#059669";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingCoordinates && formData.address.trim()) {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#059669";
                      }
                    }}
                  >
                    {loadingCoordinates ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Đang tìm...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Lấy tọa độ từ
                        địa chỉ
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      let searchQuery = "cinema Vietnam";
                      if (formData.name.trim()) {
                        searchQuery = `${formData.name} cinema Vietnam`;
                      } else if (formData.address.trim()) {
                        searchQuery = `${formData.address}, Vietnam`;
                      }
                      const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
                      window.open(googleMapsUrl, "_blank");
                    }}
                    style={{
                      padding: "10px 16px",
                      border: "1px solid #7c3aed",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#7c3aed",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      minWidth: "140px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#7c3aed";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#7c3aed";
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faMapMarkedAlt}
                      style={{ color: "#fff" }}
                    />{" "}
                    Google Maps
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      background: "#eff6ff",
                      borderRadius: "6px",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <strong
                      style={{
                        color: "#1e40af",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faFilm} /> Tìm rạp qua tên
                    </strong>
                    Nhập tên → Tự động điền thông tin
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#f0fdf4",
                      borderRadius: "6px",
                      border: "1px solid #dcfce7",
                    }}
                  >
                    <strong
                      style={{
                        color: "#15803d",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> Từ địa chỉ
                    </strong>
                    Nhập địa chỉ → Lấy tọa độ
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#faf5ff",
                      borderRadius: "6px",
                      border: "1px solid #f3e8ff",
                    }}
                  >
                    <strong
                      style={{
                        color: "#7c3aed",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faMap} /> Google Maps
                    </strong>
                    Click chuột phải → Copy tọa độ
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#fef3c7",
                      borderRadius: "6px",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <strong
                      style={{
                        color: "#92400e",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Nhập thủ công
                    </strong>
                    Nhập trực tiếp Vĩ độ/Kinh độ
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Section */}
            <div
              style={{
                background: "#f8fafc",
                padding: "24px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(139, 115, 85, 0.1)",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 20px 0",
                  color: "#333",
                  fontSize: "18px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  style={{ fontSize: "18px", marginRight: "8px" }}
                />
                Thông Tin Bổ Sung
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#5d4e37",
                      marginBottom: "4px",
                    }}
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="028 7300 5555"
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: isViewMode ? "#f9fafb" : "#ffffff",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: isViewMode ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#8b7355";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow =
                          "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#5d4e37",
                      marginBottom: "4px",
                    }}
                  >
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    name="openTime"
                    value={formData.openTime}
                    onChange={handleInputChange}
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: isViewMode ? "#f9fafb" : "#ffffff",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: isViewMode ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#8b7355";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow =
                          "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#5d4e37",
                      marginBottom: "4px",
                    }}
                  >
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    name="closeTime"
                    value={formData.closeTime}
                    onChange={handleInputChange}
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: isViewMode ? "#f9fafb" : "#ffffff",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: isViewMode ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#8b7355";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow =
                          "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#5d4e37",
                      marginBottom: "4px",
                    }}
                  >
                    Vĩ độ (Latitude)
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude || ""}
                    onChange={handleInputChange}
                    step="0.000001"
                    placeholder="10.8"
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: isViewMode ? "#f9fafb" : "#ffffff",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: isViewMode ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#8b7355";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow =
                          "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#5d4e37",
                      marginBottom: "4px",
                    }}
                  >
                    Kinh độ (Longitude)
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude || ""}
                    onChange={handleInputChange}
                    step="0.000001"
                    placeholder="106.72"
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: isViewMode ? "#f9fafb" : "#ffffff",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: isViewMode ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#8b7355";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow =
                          "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    gridColumn: "1 / -1",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#5d4e37",
                      marginBottom: "4px",
                    }}
                  >
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Mô tả về rạp chiếu phim..."
                    disabled={isViewMode}
                    style={{
                      padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: isViewMode ? "#f9fafb" : "#ffffff",
                      outline: "none",
                      transition: "all 0.2s ease",
                      cursor: isViewMode ? "not-allowed" : "text",
                      resize: "vertical",
                      minHeight: "80px",
                    }}
                    onFocus={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#8b7355";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isViewMode) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow =
                          "0 1px 2px 0 rgba(139, 115, 85, 0.05)";
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                marginTop: "32px",
                paddingTop: "20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/admin/theaters")}
                style={{
                  padding: "12px 24px",
                  border: "1px solid #64748b",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#64748b";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                Hủy
              </button>
              {isViewMode ? (
                <button
                  type="button"
                  onClick={() => navigate(`/admin/theaters/${id}/edit`)}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #6366f1",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#6366f1",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#6366f1";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#6366f1";
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #059669",
                    borderRadius: "8px",
                    background: mutation.isPending ? "#9ca3af" : "#fff",
                    color: mutation.isPending ? "#6b7280" : "#059669",
                    cursor: mutation.isPending ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!mutation.isPending) {
                      e.currentTarget.style.background = "#059669";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!mutation.isPending) {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#059669";
                    }
                  }}
                >
                  {mutation.isPending ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Đang lưu...
                    </>
                  ) : isEditMode ? (
                    <>
                      <FontAwesomeIcon icon={faSave} /> Cập nhật rạp
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} /> Lưu rạp
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Management tabs below when viewing */}
      {isViewMode && theaterData && theaterData.data && (
        <div style={{ marginTop: 24 }}>
          <TheaterManageTabs theater={theaterData.data} />
        </div>
      )}

      {/* Autofill Modal */}
      <AutofillModal
        isOpen={showAutofillModal}
        onClose={() => setShowAutofillModal(false)}
        theaterInfo={autofillInfo}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.show}
        title="Thông báo"
        message={errorModal.message}
        onClose={() => setErrorModal({ show: false, message: "" })}
      />
    </div>
  );
};

export default TheaterForm;
