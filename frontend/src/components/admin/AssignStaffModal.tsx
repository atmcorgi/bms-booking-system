import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminStaffApi } from "../../services/adminStaffApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSearch,
  faSpinner,
  faUserPlus,
  faTimes,
  faEnvelope,
  faIdBadge,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";

interface AssignStaffModalProps {
  theaterId: number;
  onClose: () => void;
}

const AssignStaffModal: React.FC<AssignStaffModalProps> = ({
  theaterId,
  onClose,
}) => {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedRole = "STAFF"; // Fixed to STAFF only

  // Fetch unassigned staff for this theater
  const { data: staffData, isLoading } = useQuery({
    queryKey: ["unassigned-staff", theaterId, searchQuery],
    queryFn: async () => {
      const res = await adminStaffApi.listAll(
        searchQuery,
        undefined,
        theaterId
      );
      return res.data as any[];
    },
  });

  const assignStaffMutation = useMutation({
    mutationFn: async (payload: {
      accountId: number;
      theaterId: number;
      role: string;
    }) => {
      return adminStaffApi.assign(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["theater-staff", theaterId] });
      onClose();
    },
  });

  const handleAssign = (accountId: number) => {
    assignStaffMutation.mutate({
      accountId,
      theaterId,
      role: selectedRole,
    });
  };

  const staff = staffData || [];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            <FontAwesomeIcon
              icon={faUsers}
              style={{ marginRight: "12px", color: "#6366f1" }}
            />
            Gán nhân viên cho rạp
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
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Search and Role Filter */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f9fafb",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  height: "22px",
                  lineHeight: "22px",
                }}
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{ marginRight: "8px", color: "#6366f1" }}
                />
                Tìm kiếm nhân viên
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "#fff",
                  height: "44px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  height: "22px",
                  lineHeight: "22px",
                }}
              >
                <FontAwesomeIcon
                  icon={faUserTag}
                  style={{ marginRight: "8px", color: "#6366f1" }}
                />
                Vai trò gán
              </label>
              <div
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#f3f4f6",
                  color: "#059669",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "44px",
                  boxSizing: "border-box",
                }}
              >
                👤 Nhân viên
              </div>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px",
          }}
        >
          {isLoading && (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
              <p style={{ fontSize: "15px" }}>Đang tải danh sách nhân viên...</p>
            </div>
          )}

          {!isLoading && staff.length === 0 && (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <p style={{ fontSize: "15px", fontWeight: "500" }}>
                Không tìm thấy nhân viên nào
              </p>
              <p style={{ fontSize: "13px", marginTop: "8px" }}>
                Tất cả nhân viên đã được gán cho rạp này hoặc không có nhân viên
                phù hợp.
              </p>
            </div>
          )}

          {!isLoading && staff.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: "16px",
              }}
            >
              {staff.map((person: any) => {
                const fullName = person.fullName || person.username || "N/A";
                const initials = fullName
                  .split(' ')
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={person.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "18px",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(99, 102, 241, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: "12px",
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: person.avatar
                            ? `url(${person.avatar}) center/cover`
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "18px",
                          fontWeight: "600",
                          flexShrink: 0,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {!person.avatar && initials}
                      </div>

                      {/* Staff Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            margin: "0 0 6px 0",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1f2937",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={fullName}
                        >
                          {fullName}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6b7280",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faIdBadge}
                              style={{ width: "14px" }}
                            />
                            <span>ID: {person.id}</span>
                          </div>
                          {person.email && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={person.email}
                            >
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                style={{ width: "14px", flexShrink: 0 }}
                              />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                {person.email}
                              </span>
                            </div>
                          )}
                          {person.role && (
                            <div
                              style={{
                                fontSize: "12px",
                                marginTop: "4px",
                              }}
                            >
                              <span
                                style={{
                                  background: "#f3f4f6",
                                  color: "#374151",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  fontWeight: "500",
                                }}
                              >
                                {person.role === "STAFF"
                                  ? "Nhân viên"
                                  : person.role === "MANAGER"
                                  ? "Quản lý"
                                  : person.role}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assign Button */}
                      <button
                        onClick={() => handleAssign(person.id)}
                        disabled={assignStaffMutation.isPending}
                        style={{
                          padding: "8px 16px",
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (!assignStaffMutation.isPending) {
                            e.currentTarget.style.background = "#4f46e5";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#6366f1";
                        }}
                      >
                        {assignStaffMutation.isPending ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Đang gán...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUserPlus} />
                            Gán
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #e2e8f0",
            background: "#f9fafb",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStaffModal;

