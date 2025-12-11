import axios from "axios";
import { getPlansByAdmin } from "./AdminPolicyPlanAPI";

export const getDashboardStats = async () => {
  try {
    const adminId = sessionStorage.getItem("adminId");
    const BASE_URL = "http://localhost:8089";

    // ---------- TOTAL POLICIES ----------
    const totalRes = await getPlansByAdmin(adminId);
    const totalPolicies = Array.isArray(totalRes.data)
      ? totalRes.data.length
      : totalRes.data?.length || 0;

    // ---------- PENDING POLICIES ----------
    const pendingRes = await axios.get(
      `${BASE_URL}/api/admin/pending-policies/${adminId}`
    );
    const pendingPolicies =
      Array.isArray(pendingRes.data)
        ? pendingRes.data.length
        : pendingRes.data?.policies?.length ||
          pendingRes.data?.data?.length ||
          0;

    // ---------- ACTIVE POLICIES ----------
    const activeRes = await axios.get(
      `${BASE_URL}/api/admin/active-policies/${adminId}`
    );
    const activePolicies =
      Array.isArray(activeRes.data)
        ? activeRes.data.length
        : activeRes.data?.policies?.length ||
          activeRes.data?.data?.length ||
          0;

    return {
      totalPolicies,
      pendingPolicies,
      activePolicies,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      totalPolicies: 0,
      pendingPolicies: 0,
      activePolicies: 0,
    };
  }
};
