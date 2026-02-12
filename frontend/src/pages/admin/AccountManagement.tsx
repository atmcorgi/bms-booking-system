import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAccountApi, type Account } from "../../services/adminAccountApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faIdBadge,
  faLock,
  faLockOpen,
  faEdit,
  faTrash,
  faUserPlus,
  faKey,
  faCheckCircle,
  faTimesCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "../../components/shared/ConfirmModal";
import CustomDropdown from "../../components/CustomDropdown";
import "../../styles/admin-table.css";

// Modern color palette for avatars
const getAvatarColor = (id: number) => {
  const modernColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Purple
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Pink-Red
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Blue-Cyan
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Green-Teal
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Pink-Yellow
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", // Cyan-Purple
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Mint-Pink
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", // Coral-Pink
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", // Peach
    "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)", // Red-Blue
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", // Lavender-Blue
    "linear-gradient(135deg, #f77062 0%, #fe5196 100%)", // Orange-Pink
  ];
  return modernColors[id % modernColors.length];
};

interface AccountFormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  roleIds: number[];
}

export default function AccountManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<boolean | undefined>(
    undefined
  );
  const [page, setPage] = useState(0);
  const size = 12; // 4 columns x 3 rows

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    account: Account | null;
  }>({
    show: false,
    account: null,
  });
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });

  // Form data
  const [formData, setFormData] = useState<AccountFormData>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    roleIds: [],
  });

  // Fetch accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["admin-accounts", searchQuery, roleFilter, enabledFilter, page],
    queryFn: async () => {
      const res = await adminAccountApi.listAll({
        q: searchQuery,
        role: roleFilter,
        enabled: enabledFilter,
        page,
        size,
      });
      return res.data;
    },
  });

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await adminAccountApi.getRoles();
      return res.data;
    },
  });

  // All roles are valid (ADMIN, STAFF, MANAGER, CUSTOMER)
  const roles = rolesData || [];
  const accounts = accountsData?.items || [];
  const totalPages = accountsData?.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: AccountFormData) => adminAccountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message: error?.response?.data?.message || "Có lỗi khi tạo tài khoản",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<AccountFormData>;
    }) => adminAccountApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      resetForm();
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message:
          error?.response?.data?.message || "Có lỗi khi cập nhật tài khoản",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminAccountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      setConfirmDelete({ show: false, account: null });
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message: error?.response?.data?.message || "Có lỗi khi xóa tài khoản",
      });
    },
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      adminAccountApi.toggleEnabled(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message:
          error?.response?.data?.message ||
          "Có lỗi khi thay đổi trạng thái tài khoản",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      adminAccountApi.changePassword(id, password),
    onSuccess: () => {
      setIsChangePasswordModalOpen(false);
      setSelectedAccount(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      setErrorModal({
        show: true,
        message: error?.response?.data?.message || "Có lỗi khi đổi mật khẩu",
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      roleIds: [],
    });
  };

  const handleCreateAccount = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.fullName
    ) {
      setErrorModal({
        show: true,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
      return;
    }
    if (formData.roleIds.length === 0) {
      setErrorModal({
        show: true,
        message: "Vui lòng chọn ít nhất một vai trò!",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdateAccount = () => {
    if (!selectedAccount) return;
    if (!formData.email || !formData.fullName) {
      setErrorModal({
        show: true,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
      return;
    }
    if (formData.roleIds.length === 0) {
      setErrorModal({
        show: true,
        message: "Vui lòng chọn ít nhất một vai trò!",
      });
      return;
    }

    updateMutation.mutate({
      id: selectedAccount.id,
      data: {
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
        phone: formData.phone,
        roleIds: formData.roleIds,
      },
    });
  };

  const openEditModal = (account: Account) => {
    const mappedRoleIds = account.roles?.map((r) => Number(r.id)) || [];

    setSelectedAccount(account);
    setFormData({
      username: account.username,
      email: account.email,
      password: "",
      fullName: account.fullName,
      phone: account.phone || "",
      roleIds: mappedRoleIds,
    });
    setIsEditModalOpen(true);
  };

  const openChangePasswordModal = (account: Account) => {
    setSelectedAccount(account);
    setNewPassword("");
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePassword = () => {
    if (!selectedAccount || !newPassword) {
      setErrorModal({ show: true, message: "Vui lòng nhập mật khẩu mới!" });
      return;
    }
    if (newPassword.length < 6) {
      setErrorModal({
        show: true,
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
      });
      return;
    }
    changePasswordMutation.mutate({
      id: selectedAccount.id,
      password: newPassword,
    });
  };

  return (
    <div style={{ padding: "0", maxWidth: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, lineHeight: 1 }}>Quản lý Tài khoản</h3>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Quản lý tất cả tài khoản người dùng trong hệ thống
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            style={{
              padding: "10px 20px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4f46e5";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(99, 102, 241, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#6366f1";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Tạo tài khoản mới
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 300px" }}>
            <FontAwesomeIcon
              icon={faSearch}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchQuery}
              onChange={(e) => {
                setPage(0); // Reset page first
                setSearchQuery(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Role Filter */}
          <CustomDropdown
            value={roleFilter}
            onChange={(value) => {
              setPage(0); // Reset page first
              setRoleFilter(String(value));
            }}
            options={[
              { value: "", label: "Tất cả vai trò" },
              ...roles.map((role: any) => ({
                value: role.roleName,
                label: role.roleName,
              })),
            ]}
            placeholder="Chọn vai trò"
            width="200px"
          />

          {/* Status Filter */}
          <CustomDropdown
            value={
              enabledFilter === undefined
                ? ""
                : enabledFilter
                  ? "true"
                  : "false"
            }
            onChange={(value) => {
              setPage(0); // Reset page first
              setEnabledFilter(value === "" ? undefined : value === "true");
            }}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "true", label: "Đang hoạt động" },
              { value: "false", label: "Đã khóa" },
            ]}
            placeholder="Chọn trạng thái"
            width="200px"
          />

          {/* Clear Filters */}
          {(searchQuery || roleFilter || enabledFilter !== undefined) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("");
                setEnabledFilter(undefined);
                setPage(0);
              }}
              style={{
                padding: "10px 16px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Accounts List */}
        {isLoading ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            Đang tải dữ liệu...
          </div>
        ) : accounts.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            Không tìm thấy tài khoản nào
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {accounts.map((account: Account) => {
              const initials = (account.fullName || account.username || "?")
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                  <div
                    key={account.id}
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(99, 102, 241, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    {/* Avatar */}
                    {/* Avatar */}
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: account.avatar
                          ? "transparent"
                          : getAvatarColor(account.id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "24px",
                        fontWeight: "600",
                        flexShrink: 0,
                        border: "3px solid #fff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                      }}
                    >
                      {account.avatar ? (
                        <img
                          src={account.avatar}
                          alt={account.username}
                          style={{
                            width: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#1f2937",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {account.fullName || account.username || "No Name"}
                        </h3>
                        {account.enabled ? (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            style={{ color: "#10b981", fontSize: "16px" }}
                            title="Đang hoạt động"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faTimesCircle}
                            style={{ color: "#ef4444", fontSize: "16px" }}
                            title="Đã khóa"
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faIdBadge}
                            style={{ width: "14px" }}
                          />
                          <span>@{account.username}</span>
                        </div>
                        {account.email && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              style={{ width: "14px" }}
                            />
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={account.email}
                            >
                              {account.email}
                            </span>
                          </div>
                        )}
                        {account.phone && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPhone}
                              style={{ width: "14px" }}
                            />
                            <span>{account.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roles */}
                  {account.roles && account.roles.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {account.roles.map((role) => (
                          <span
                            key={role.id}
                            style={{
                              fontSize: "12px",
                              background:
                                role.roleName === "ADMIN"
                                  ? "#fef3c7"
                                  : role.roleName === "MANAGER"
                                    ? "#dbeafe"
                                    : role.roleName === "STAFF"
                                      ? "#e0e7ff"
                                      : role.roleName === "CUSTOMER"
                                        ? "#d1fae5"
                                        : "#f3f4f6",
                              color:
                                role.roleName === "ADMIN"
                                  ? "#92400e"
                                  : role.roleName === "MANAGER"
                                    ? "#1e40af"
                                    : role.roleName === "STAFF"
                                      ? "#3730a3"
                                      : role.roleName === "CUSTOMER"
                                        ? "#065f46"
                                        : "#374151",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {role.roleName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      paddingTop: "12px",
                      borderTop: "1px solid #e5e7eb",
                      marginTop: "auto",
                    }}
                  >
                    <button
                      onClick={() => openEditModal(account)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        background: "#fff",
                        color: "#6366f1",
                        border: "1px solid #6366f1",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        transition: "all 0.2s",
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
                      <FontAwesomeIcon
                        icon={faEdit}
                        style={{ fontSize: "11px" }}
                      />
                      Sửa
                    </button>
                    <button
                      onClick={() => openChangePasswordModal(account)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        background: "#fff",
                        color: "#f59e0b",
                        border: "1px solid #f59e0b",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f59e0b";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#f59e0b";
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faKey}
                        style={{ fontSize: "11px" }}
                      />
                      Đổi MK
                    </button>
                    <button
                      onClick={() =>
                        toggleEnabledMutation.mutate({
                          id: account.id,
                          enabled: !account.enabled,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        background: "#fff",
                        color: account.enabled ? "#ef4444" : "#10b981",
                        border: `1px solid ${account.enabled ? "#ef4444" : "#10b981"}`,
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = account.enabled
                          ? "#ef4444"
                          : "#10b981";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = account.enabled
                          ? "#ef4444"
                          : "#10b981";
                      }}
                    >
                      <FontAwesomeIcon
                        icon={account.enabled ? faLock : faLockOpen}
                        style={{ fontSize: "11px" }}
                      />
                      {account.enabled ? "Khóa" : "Mở"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ show: true, account })}
                      style={{
                        padding: "6px 8px",
                        background: "#fff",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        style={{ fontSize: "11px" }}
                      />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "12px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: page <= 0 ? "#f9fafb" : "#ffffff",
                color: page <= 0 ? "#9ca3af" : "#374151",
                cursor: page <= 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.15s ease",
              }}
            >
              Trước
            </button>
            <span
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Trang {page + 1}/{totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: page + 1 >= totalPages ? "#f9fafb" : "#ffffff",
                color: page + 1 >= totalPages ? "#9ca3af" : "#374151",
                cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.15s ease",
              }}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Tạo tài khoản mới
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Username <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Mật khẩu <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Họ và tên <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Vai trò
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {roles.map((role: any) => {
                    const roleId = Number(role.id);
                    const isChecked = formData.roleIds.includes(roleId);
                    return (
                      <label
                        key={role.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                roleIds: [...formData.roleIds, roleId],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                roleIds: formData.roleIds.filter(
                                  (id) => id !== roleId
                                ),
                              });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px", color: "#374151" }}>
                          {role.roleName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={createMutation.isPending}
                style={{
                  padding: "10px 20px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: createMutation.isPending ? "not-allowed" : "pointer",
                  opacity: createMutation.isPending ? 0.6 : 1,
                }}
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {isEditModalOpen && selectedAccount && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Chỉnh sửa tài khoản
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Họ và tên <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Vai trò
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {roles.map((role: any) => {
                    const roleId = Number(role.id);
                    const isChecked = formData.roleIds.includes(roleId);
                    return (
                      <label
                        key={role.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                roleIds: [...formData.roleIds, roleId],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                roleIds: formData.roleIds.filter(
                                  (id) => id !== roleId
                                ),
                              });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px", color: "#374151" }}>
                          {role.roleName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateAccount}
                disabled={updateMutation.isPending}
                style={{
                  padding: "10px 20px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                  opacity: updateMutation.isPending ? 0.6 : 1,
                }}
              >
                {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && selectedAccount && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Đổi mật khẩu
            </h3>

            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              Đổi mật khẩu cho tài khoản:{" "}
              <strong>{selectedAccount.username}</strong>
            </p>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Mật khẩu mới <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                style={{
                  padding: "10px 20px",
                  background: "#f59e0b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: changePasswordMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  opacity: changePasswordMutation.isPending ? 0.6 : 1,
                }}
              >
                {changePasswordMutation.isPending
                  ? "Đang đổi..."
                  : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.show}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${confirmDelete.account?.username}"? Hành động này không thể hoàn tác.`}
        onConfirm={() => {
          if (confirmDelete.account) {
            deleteMutation.mutate(confirmDelete.account.id);
          }
        }}
        onClose={() => setConfirmDelete({ show: false, account: null })}
      />

      {/* Error Modal */}
      <ConfirmModal
        isOpen={errorModal.show}
        title="Thông báo"
        message={errorModal.message}
        onConfirm={() => setErrorModal({ show: false, message: "" })}
        onClose={() => setErrorModal({ show: false, message: "" })}
        confirmText="Đóng"
        showCancel={false}
      />
    </div>
  );
}
