import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, type UpdateProfileDto } from "../../services/profileApi";
import ProfileLayout from "../../layouts/ProfileLayout";
import ProfileHeader from "../../components/profile/ProfileHeader";
import PasswordChangeModal from "../../components/profile/PasswordChangeModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSpinner, faCheckCircle, faExclamationCircle, faTheaterMasks } from "@fortawesome/free-solid-svg-icons";

export default function StaffProfile() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
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
    onError: () => setErrorMessage("Failed to update profile.")
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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
  });

  if (isLoading) return <div style={{ padding: "40px", textAlign: "center" }}><FontAwesomeIcon icon={faSpinner} spin size="2x"/></div>;
  if (!profile) return <div>Access Denied</div>;

  return (
    <ProfileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      role="STAFF"
      avatarSection={
        <ProfileHeader
           fullName={profile.fullName}
           email={profile.email}
           avatar={profile.avatar}
           roleLabel="Staff Member"
           isVerified={profile.emailVerified}
           onAvatarUpload={async (file) => { await uploadAvatarMutation.mutateAsync(file); }}
           gradient="linear-gradient(135deg, #22c55e 0%, #10b981 100%)" // Green for Staff
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
            <div style={{ marginBottom: "16px", padding: "12px", background: "#f0fdf4", color: "#15803d", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
               <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
               <FontAwesomeIcon icon={faExclamationCircle} /> {errorMessage}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(formData); }}>
            <div style={{ display: "grid", gap: "24px", maxWidth: "600px" }}>
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
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
              </div>

               <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#64748b", marginBottom: "6px" }}>
                   Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none" }}
                />
              </div>

               <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#64748b", marginBottom: "6px" }}>
                   Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none" }}
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
      
      {activeTab === "assignments" && ( // NEW TAB for Staff
        <div>
           <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1e293b" }}>
            Assigned Theaters
          </h2>
          {profile.assignedTheaterName ? (
              <div style={{ padding: "24px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", display: "flex", alignItems: "center", gap: "20px" }}>
                 <div style={{ width: "60px", height: "60px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FontAwesomeIcon icon={faTheaterMasks} style={{ fontSize: "24px", color: "#16a34a" }} />
                 </div>
                 <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "700", color: "#166534" }}>{profile.assignedTheaterName}</h3>
                    <p style={{ margin: 0, fontSize: "14px", color: "#15803d" }}>Theater ID: {profile.assignedTheaterId}</p>
                 </div>
              </div>
          ) : (
             <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "12px", color: "#64748b" }}>
                No theater assigned yet. Please contact your administrator.
             </div>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <SecuritySection profile={profile} setShowPasswordModal={setShowPasswordModal} />
      )}

      <PasswordChangeModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={async (data) => { await changePasswordMutation.mutateAsync(data); }}
      />
    </ProfileLayout>
  );
}

// Reusable Security Section
function SecuritySection({ profile, setShowPasswordModal }: any) {
    return (
        <div>
           <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1e293b" }}>
            Security Settings
          </h2>
          <div style={{ maxWidth: "600px" }}>
            {profile.authProvider === "LOCAL" ? (
               <div style={{ padding: "24px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
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
                           borderRadius: "6px",
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
                <div style={{ padding: "20px", background: "#eff6ff", color: "#1e40af", borderRadius: "8px" }}>
                   You are logged in via <strong>{profile.authProvider}</strong>. 
                </div>
            )}
          </div>
        </div>
    )
}
