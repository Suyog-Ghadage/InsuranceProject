import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import CONFIG from "../../../config/config";

export default function PendingPolicies() {
  const adminId = sessionStorage.getItem("adminId");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const BASE_URL = CONFIG.BASE_URL;

  // ✔ UNIVERSAL function to get user name safely
  const getUserName = (p) => {
    if (!p) return "N/A";

    if (p.userName) return p.userName; // direct
    if (p.user?.userName) return p.user.userName; // nested
    if (p.user?.name) return p.user.name;
    if (p.user?.fullName) return p.user.fullName;
    if (p.user?.firstName && p.user?.lastName)
      return `${p.user.firstName} ${p.user.lastName}`;

    return "N/A";
  };

  const fetchPendingPolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/admin/pending-policies/${adminId}`
      );

      if (Array.isArray(res.data)) {
        setPolicies(res.data);
      } else if (res.data?.policies) {
        setPolicies(res.data.policies);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to fetch pending policies",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPolicies();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/user-policy/update/${id}`, {
        policyStatus: status,
      });

      setPolicies((prev) =>
        prev.map((p) => (p.id === id ? { ...p, policyStatus: status } : p))
      );

      setSnackbar({
        open: true,
        message: `Policy marked as ${status}`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error updating policy",
        severity: "error",
      });
    }
  };

  if (loading)
    return <CircularProgress sx={{ display: "block", m: "auto", mt: 3 }} />;

  return (
    <div className="pending-container">
      <h3 className="pending-heading">Pending User Policies</h3>

      <div className="pending-table-container">
        <Table>
          <TableHead>
            <TableRow className="pending-header-row">
              <TableCell className="pending-header-cell">Sr.No</TableCell>
              <TableCell className="pending-header-cell">User Name</TableCell>
              <TableCell className="pending-header-cell">Policy Name</TableCell>
              <TableCell className="pending-header-cell">Policy Type</TableCell>
              <TableCell className="pending-header-cell">Coverage</TableCell>
              <TableCell className="pending-header-cell">Start Date</TableCell>
              <TableCell className="pending-header-cell">End Date</TableCell>
              <TableCell className="pending-header-cell">Nominee</TableCell>
              <TableCell className="pending-header-cell">Relation</TableCell>
              <TableCell className="pending-header-cell">Status</TableCell>
              <TableCell className="pending-header-cell">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="pending-nodata-cell">
                  ❌ No pending policies found.
                </TableCell>
              </TableRow>
            ) : (
              policies.map((p, index) => {
                const coverage =
                  p.coverageAmount ||
                  p.sumAssured ||
                  p.policyPlan?.coverage ||
                  "N/A";

                return (
                  <TableRow key={p.id} className="pending-body-row">
                    <TableCell className="pending-body-cell">
                      {index + 1}
                    </TableCell>

                    {/* ✔ USER NAME COLUMN */}
                    <TableCell className="pending-body-cell">
                      {getUserName(p)}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.policyPlan?.policyName || "N/A"}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.policyPlan?.policyType?.name ||
                        p.policyPlan?.policyType ||
                        "N/A"}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {coverage}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.startDate || "N/A"}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.endDate || "N/A"}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.nominee || "N/A"}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.nomineeRelation || "N/A"}
                    </TableCell>

                    <TableCell className="pending-body-cell">
                      {p.policyStatus}
                    </TableCell>

                    <TableCell className="pending-action-cell">
                      <Button
                        onClick={() => handleStatusChange(p.id, "ACTIVE")}
                        color="primary"
                        disabled={p.policyStatus === "ACTIVE"}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(p.id, "REJECTED")}
                        color="error"
                        disabled={p.policyStatus === "REJECTED"}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}

/* ---------------- CSS ---------------- */

const css = `
.pending-container {
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.pending-heading {
  text-align: center;
  color: #0d47a1;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}

.pending-table-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow-x: auto;
}

.pending-header-row {
  background-color: #1976d2;
}

.pending-header-cell {
  color: #fff;
  font-weight: bold;
  border: 1px solid #ccc;
  padding: 10px !important;
  text-align: center;
}

.pending-body-row {
  background-color: #fff;
}

.pending-body-cell {
  border: 1px solid #ccc;
  padding: 10px !important;
  text-align: center;
}

.pending-action-cell {
  border: 1px solid #ccc;
  padding: 10px !important;
  text-align: center;
  white-space: nowrap;
}

.pending-nodata-cell {
  border: 1px solid #ccc;
  padding: 15px !important;
  text-align: center;
  font-style: italic;
  color: #777;
}
`;

const style = document.createElement("style");
style.innerHTML = css;
document.head.appendChild(style);
