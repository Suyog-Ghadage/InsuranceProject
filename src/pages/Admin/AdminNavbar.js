import React, { useState } from "react";
import { LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  const adminUsername = sessionStorage.getItem("adminUsername") || "Admin";
  const adminEmail = sessionStorage.getItem("adminEmail") || "No Email";

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUsername");
    sessionStorage.removeItem("adminEmail");
    sessionStorage.removeItem("adminId");
    navigate("/admin/login");
  };

  return (
    <div style={styles.navbar}>
      <h1 style={styles.logo}>Admin Dashboard</h1>

      <div style={styles.right}>
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <UserCircle size={28} style={styles.icon} />

          {/* TOOLTIP WITH USERNAME + EMAIL */}
          {showTooltip && (
            <div style={styles.tooltip}>
              <strong>{adminUsername}</strong>
              <div style={{ fontSize: "12px", color: "#555" }}>{adminEmail}</div>
            </div>
          )}
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} style={{ marginRight: "6px" }} />
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    width: "100%",
    height: "60px",
    background: "linear-gradient(90deg, #2515cbff, #1f22e7ff)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  right: { display: "flex", alignItems: "center", gap: "25px" },
  icon: {
    cursor: "pointer",
    color: "#fff",
    transition: "transform 0.2s",
  },
  tooltip: {
    position: "absolute",
    top: "38px",
    right: 0,
    backgroundColor: "#fff",
    color: "#333",
    padding: "6px 12px",
    borderRadius: "6px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    fontSize: "13px",
    whiteSpace: "nowrap",
    fontWeight: "500",
    zIndex: 200,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(229, 30, 30, 1)",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
};
