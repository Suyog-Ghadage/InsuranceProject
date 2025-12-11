import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SuperAdminProfile from "./SuperAdminProfile";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminAdmins from "./Admins/SuperAdminAdmins";
import { fetchAllAdmins, fetchPendingAdmins } from "../../api/superAdminApi";
import SuperAdminFAQs from "./FAQs/SuperAdminFAQs";
import SuperAdminNavbar from "./SuperAdminNavbar";
import SuperAdminTeleconsultation from "./Teleconsultation/Teleconsultation";
import CONFIG from "../../config/config";
import PolicyList from "./Policies/PolicyList";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    // pending: 0,
    policies: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const API_URL = CONFIG.BASE_URL;

  const fetchUsersCount = async () => {
    try {
      const res = await fetch(`${API_URL}/user`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (err) {
      console.error("Error fetching users:", err);
      return 0;
    }
  };

  const fetchAdminsCount = async () => {
    try {
      const admins = await fetchAllAdmins();
      if (!Array.isArray(admins)) {
        console.warn("fetchAllAdmins returned non-array:", admins);
        return 0;
      }
      return admins.length;
    } catch (err) {
      console.error("Error fetching admins via fetchAllAdmins:", err);
      return 0;
    }
  };

  const fetchPendingCount = async () => {
    try {
      const pending = await fetchPendingAdmins();
      return Array.isArray(pending) ? pending.length : 0;
    } catch (err) {
      console.error("Error fetching pending admins:", err);
      return 0;
    }
  };

  
  const fetchPoliciesCount = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/admin-policy/policy-plans/all`);
      if (!res.ok) throw new Error("Failed to fetch policies");

      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (err) {
      console.error("Error fetching policies count:", err);
      return 0;
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [adminsCount, pendingCount, usersCount, policiesCount] = await Promise.all([
        fetchAdminsCount(),
        fetchPendingCount(),
        fetchUsersCount(),
        fetchPoliciesCount(), 
      ]);

      setStats({
        users: usersCount,
        admins: adminsCount,
        // pending: pendingCount,
        policies: policiesCount, 
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div style={styles.layout}>
      <SuperAdminSidebar />
      <div style={styles.main}>
        <SuperAdminNavbar />

        <div style={styles.content}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Welcome, Super Admin! </h2>
          </div>

          <Routes>
            <Route
              path="/"
              element={
                <div>
                  {loading ? (
                    <p>Loading stats...</p>
                  ) : (
                    <div style={styles.cardGrid}>
                      <div
                        style={styles.card}
                        onClick={() => navigate("/superadmin/dashboard/users")}
                      >
                        <h3>Total Users</h3>
                        <p>{stats.users}</p>
                      </div>
                      <div
                        style={styles.card}
                        onClick={() => navigate("/superadmin/dashboard/admins")}
                      >
                        <h3>Total Admins</h3>
                        <p>{stats.admins}</p>
                      </div>
                      <div
                        style={styles.card}
                        onClick={() =>
                          navigate("/superadmin/dashboard/policies")
                        }
                      >
                        <h3>Total Policies</h3>
                        <p>{stats.policies}</p>
                      </div>
                    </div>
                  )}
                </div>
              }
            />

            {/* Profile */}
            <Route path="profile" element={<SuperAdminProfile />} />

            {/* Other routes */}
            <Route path="users" element={<h2>Manage Users (Coming Soon)</h2>} />
            <Route path="doctors" element={<SuperAdminTeleconsultation />} />
            <Route path="policies" element={<PolicyList />} />
            <Route path="claims" element={<h2>Manage Claims (Coming Soon)</h2>} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="faqs" element={<SuperAdminFAQs />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    padding: "20px",
    background: "#f4f6f8",
    overflowX: "auto",
    overflowY: "auto",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};
