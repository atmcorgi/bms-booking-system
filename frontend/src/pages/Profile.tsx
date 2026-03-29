import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom"; // Added useSearchParams
import { profileApi, type UpdateProfileDto } from "../services/profileApi";
import { bookingApi } from "../services/bookingApi";
import ProfileLayout from "../layouts/ProfileLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import PasswordChangeModal from "../components/profile/PasswordChangeModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSpinner, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams(); // Added
  const urlTab = searchParams.get("tab"); // Get tab from URL
  
  const [activeTab, setActiveTab] = useState(urlTab || "general"); // Initialize from URL or default
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileDto>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile().then((res) => res.data),
  });

  // Effect to update activeTab if URL changes (optional but good)
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Handle manual tab change to update URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccessMessage("Changes saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setErrorMessage("");
    },
    onError: () => {
      setErrorMessage("Failed to update profile. Please try again.");
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
       // ["auth/me"] is no longer used in Header, so we don't need to invalidate it specifically, 
       // but "profile" key covers both ProfilePage and Header now.
      setSuccessMessage("Avatar updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      setSuccessMessage("Password changed successfully!");
      setShowPasswordModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: () => {
       // Error handled in modal
    }
  });

  if (isLoading) return <div style={{ padding: "40px", textAlign: "center" }}><FontAwesomeIcon icon={faSpinner} spin size="2x"/></div>;
  if (!profile) return <div>Access Denied</div>;

  return (
    <ProfileLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      role="CUSTOMER"
      avatarSection={
        <ProfileHeader
           fullName={profile.fullName}
           email={profile.email}
           avatar={profile.avatar}
           roleLabel="Customer"
           isVerified={profile.emailVerified}
           onAvatarUpload={async (file) => { await uploadAvatarMutation.mutateAsync(file); }}
           gradient="linear-gradient(135deg, #E50914 0%, #D4CBB0 100%)" // Red/Gold Brand Gradient
        />
      }
    >
      {/* Content based on Active Tab */}
      {activeTab === "general" && (
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1e293b" }}>
            General Information
          </h2>

          {successMessage && (
            <div style={{ marginBottom: "16px", padding: "12px", background: "#f0fdf4", color: "#15803d", borderRadius: "0px", display: "flex", gap: "8px", alignItems: "center", border: "1px solid #bbf7d0" }}>
               <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "0px", display: "flex", gap: "8px", alignItems: "center", border: "1px solid #fecaca" }}>
               <FontAwesomeIcon icon={faExclamationCircle} /> {errorMessage}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(formData); }}>
            <div style={{ display: "grid", gap: "24px", maxWidth: "600px" }}>
              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#64748b", marginBottom: "6px" }}>
                   Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "0px", // Squared
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#E50914"} // Red focus
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
              </div>

               {/* Email */}
               <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#64748b", marginBottom: "6px" }}>
                   Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "0px", // Squared
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    outline: "none",
                    background: "#f8fafc" // Hint read-only feel but it is editable
                  }}
                />
                {!profile.emailVerified && (
                  <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                     Your email is not verified.
                  </div>
                )}
              </div>

               {/* Phone */}
               <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#64748b", marginBottom: "6px" }}>
                   Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "0px", // Squared
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#E50914"} // Red Focus
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
              </div>
              
              <div style={{ paddingTop: "12px" }}>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  style={{
                    padding: "12px 28px",
                    background: "#E50914", // Brand Red
                    color: "white",
                    border: "none",
                    borderRadius: "0px", // Squared
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: updateProfileMutation.isPending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: updateProfileMutation.isPending ? 0.7 : 1,
                    boxShadow: "0 4px 10px rgba(229, 9, 20, 0.2)"
                  }}
                >
                   {updateProfileMutation.isPending ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                   {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === "security" && (
        <div>
           <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1e293b" }}>
            Security Settings
          </h2>
          
          <div style={{ maxWidth: "600px" }}>
            {profile.authProvider === "LOCAL" ? (
               <div style={{ padding: "24px", border: "1px solid #e2e8f0", borderRadius: "0px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>Password</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Last changed: Never (Demo)</p>
                     </div>
                     <button
                        onClick={() => setShowPasswordModal(true)}
                        style={{
                           padding: "8px 16px",
                           background: "white",
                           border: "1px solid #cbd5e1",
                           borderRadius: "0px", // Squared
                           fontSize: "14px",
                           fontWeight: "600",
                           color: "#334155",
                           cursor: "pointer"
                        }}
                     >
                        Change Password
                     </button>
                  </div>
               </div>
            ) : (
                <div style={{ padding: "20px", background: "#eff6ff", color: "#1e40af", borderRadius: "0px" }}>
                   You are logged in via <strong>{profile.authProvider}</strong>. You cannot change your password here.
                </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <BookingHistorySection />
      )}

      {/* Shared Modals */}
      <PasswordChangeModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={async (data) => { await changePasswordMutation.mutateAsync(data); }}
      />
    </ProfileLayout>
  );
}

function BookingHistorySection() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("ALL");
  const pageSize = 5;

  const [sendingCode, setSendingCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleResend = async (paymentCode: string) => {
    try {
      setSendingCode(paymentCode);
      setMessage(null);
      await bookingApi.resendTicketEmail(paymentCode);
      setMessage({ type: 'success', text: `Email vé cho mã ${paymentCode} đã được gửi lại!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi gửi lại email.' });
    } finally {
      setSendingCode(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const { data: pageData, isLoading, isError } = useQuery({
    queryKey: ["booking-history", page, status],
    queryFn: () => profileApi.getMyBookingHistory({ page, size: pageSize, status }).then((res) => res.data),
  });

  const history = pageData?.content || [];

  if (isLoading) return <div style={{ padding: "40px", textAlign: "center" }}><FontAwesomeIcon icon={faSpinner} spin size="2x"/></div>;
  if (isError) return <div style={{ color: "red" }}>Failed to load booking history.</div>;
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
          Booking History
        </h2>
        
        {/* Custom Status Filter Dropdown */}
        <StatusFilter value={status} onChange={(val) => { setStatus(val); setPage(0); }} />
      </div>

      {message && (
        <div style={{ marginBottom: "16px", padding: "12px", borderRadius: "4px", backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      {!history || history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", background: "#f8fafc", borderRadius: "0px", border: "1px dashed #cbd5e1" }}>
           No bookings found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {history.map((booking) => {
             // Color Logic: PAID = Green, FAILED/CANCELLED = Red, PENDING = Yellow
             let badgeBg = "#fef9c3"; // Pending Yellow
             let badgeColor = "#854d0e";
             
             if (booking.status === "PAID") {
                badgeBg = "#dcfce7";
                badgeColor = "#166534";
             } else if (booking.status === "CANCELLED" || booking.status === "FAILED") {
                badgeBg = "#fee2e2"; // Red
                badgeColor = "#991b1b"; 
             }

             return (
            <div key={booking.paymentCode} style={{ 
              display: "flex", 
              border: "1px solid #e2e8f0", 
              background: "white",
              padding: "16px",
              gap: "20px"
            }}>
               {/* Poster */}
               <div style={{ flexShrink: 0, width: "100px" }}>
                  <img 
                    src={booking.posterUrl} 
                    alt={booking.movieTitle} 
                    style={{ width: "100%", height: "150px", objectFit: "cover" }} 
                  />
               </div>
               
               {/* Info */}
               <div style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                     <h3 style={{ margin: 0, fontSize: "18px", color: "#8b7355", textTransform: "uppercase" }}>{booking.movieTitle}</h3>
                     <span style={{ 
                        padding: "4px 12px", 
                        fontSize: "12px", 
                        fontWeight: "bold",
                        background: badgeBg,
                        color: badgeColor,
                        textTransform: "uppercase"
                     }}>
                        {booking.status}
                     </span>
                  </div>
                  
                  <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
                     <p style={{ margin: "4px 0" }}>
                       <strong>Theater:</strong> {booking.theaterName} - {booking.roomName}
                     </p>
                     <p style={{ margin: "4px 0" }}>
                       <strong>Showtime:</strong> {booking.showTime} | {booking.showDate}
                     </p>
                     <p style={{ margin: "4px 0" }}>
                       <strong>Seats:</strong> {booking.seats.join(", ")}
                     </p>
                     <p style={{ margin: "4px 0" }}>
                       <strong>Total:</strong> {booking.totalAmount.toLocaleString()} VND
                     </p>
                  </div>
                  
                  <div style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span>Transaction: {booking.paymentCode} • Booked on {new Date(booking.bookingTime).toLocaleString()}</span>
                     {booking.status === "PAID" && (
                       <button
                         onClick={() => handleResend(booking.paymentCode)}
                         disabled={sendingCode === booking.paymentCode}
                         style={{
                           padding: "6px 12px",
                           background: "white",
                           border: "1px solid #cbd5e1",
                           borderRadius: "4px",
                           fontSize: "12px",
                           cursor: sendingCode === booking.paymentCode ? "not-allowed" : "pointer",
                           color: "#334155",
                           opacity: sendingCode === booking.paymentCode ? 0.7 : 1
                         }}
                       >
                         {sendingCode === booking.paymentCode ? 'Đang gửi...' : 'Gửi lại vé qua Email'}
                       </button>
                     )}
                  </div>
               </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pageData && pageData.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: "8px 16px",
              border: "1px solid #cbd5e1",
              background: page === 0 ? "#f1f5f9" : "white",
              color: page === 0 ? "#94a3b8" : "#334155",
              cursor: page === 0 ? "not-allowed" : "pointer",
              borderRadius: "4px"
            }}
          >
            Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "#475569" }}>
             Page {page + 1} of {pageData.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pageData.totalPages - 1, p + 1))}
            disabled={page >= pageData.totalPages - 1}
            style={{
              padding: "8px 16px",
              border: "1px solid #cbd5e1",
              background: page >= pageData.totalPages - 1 ? "#f1f5f9" : "white",
              color: page >= pageData.totalPages - 1 ? "#94a3b8" : "#334155",
              cursor: page >= pageData.totalPages - 1 ? "not-allowed" : "pointer",
              borderRadius: "4px"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function StatusFilter({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
        { label: "All Status", value: "ALL" },
        { label: "Paid", value: "PAID" },
        { label: "Pending", value: "PENDING" },
        { label: "Cancelled", value: "CANCELLED" },
        { label: "Failed", value: "FAILED" }
    ];

    const currentLabel = options.find(o => o.value === value)?.label || "All Status";

    return (
        <div style={{ position: "relative", minWidth: "140px" }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#334155",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {currentLabel}
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>▼</span>
            </div>
            
            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    width: "100%",
                    marginTop: "4px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    zIndex: 10
                }}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            style={{
                                padding: "8px 12px",
                                fontSize: "14px",
                                color: value === opt.value ? "#E50914" : "#334155",
                                background: value === opt.value ? "#fef2f2" : "transparent",
                                cursor: "pointer",
                                fontWeight: value === opt.value ? "600" : "400"
                            }}
                            onMouseOver={(e) => {
                                if (value !== opt.value) e.currentTarget.style.background = "#f8fafc";
                            }}
                            onMouseOut={(e) => {
                                if (value !== opt.value) e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Backdrop to close */}
            {isOpen && (
                <div 
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
