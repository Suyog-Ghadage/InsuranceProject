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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import CONFIG from "../../../config/config";

export default function ActivePolicies() {
  const adminId = sessionStorage.getItem("adminId");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    nominee: "",
    relation: "",
  });

  const BASE_URL = CONFIG.BASE_URL;

  // Fetch active policies
  const fetchActivePolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/admin/active-policies/${adminId}`
      );
      if (Array.isArray(res.data)) {
        setPolicies(res.data);
      } else if (res.data?.policies) {
        setPolicies(res.data.policies);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch active policies",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePolicies();
  }, []);

  // Safely get user name
  const getUserName = (p) => {
    if (!p) return "N/A";
    if (p.userName) return p.userName;
    if (p.user?.userName) return p.user.userName;
    if (p.user?.name) return p.user.name;
    if (p.user?.fullName) return p.user.fullName;
    if (p.user?.firstName && p.user?.lastName)
      return `${p.user.firstName} ${p.user.lastName}`;
    return "N/A";
  };

  // Open edit popup
  const handleEdit = (policy) => {
    setEditData({
      id: policy.id,
      nominee: policy.nominee || "",
      relation: policy.nomineeRelation || "",
    });
    setEditDialog(true);
  };

  const isValidName = (name) => /^[A-Za-z\s]+$/.test(name.trim());

  const handleSaveEdit = async () => {
    if (!editData.nominee.trim() || !editData.relation.trim()) {
      setSnackbar({
        open: true,
        message: "Nominee & Relation are required",
        severity: "error",
      });
      return;
    }

    if (!isValidName(editData.nominee) || !isValidName(editData.relation)) {
      setSnackbar({
        open: true,
        message: "Only letters and spaces are allowed",
        severity: "error",
      });
      return;
    }

    try {
      await axios.put(`${BASE_URL}/user-policy/update/${editData.id}`, {
        nominee: editData.nominee,
        nomineeRelation: editData.relation,
      });

      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editData.id
            ? { ...p, nominee: editData.nominee, nomineeRelation: editData.relation }
            : p
        )
      );

      setSnackbar({
        open: true,
        message: "Nominee details updated successfully",
        severity: "success",
      });
      setEditDialog(false);
    } catch (err) {
      console.error("Update error:", err);
      setSnackbar({
        open: true,
        message: "Error updating nominee details",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    try {
      await axios.delete(`${BASE_URL}/user-policy/delete/${id}`);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      setSnackbar({
        open: true,
        message: "Policy deleted successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbar({
        open: true,
        message: "Error deleting policy",
        severity: "error",
      });
    }
  };

  if (loading)
    return <CircularProgress sx={{ display: "block", m: "auto", mt: 3 }} />;

  return (
    <div className="pending-container">
      <h3 className="pending-heading">Active User Policies</h3>

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
                  ❌ No Active Policies Found.
                </TableCell>
              </TableRow>
            ) : (
              policies.map((p, index) => {
                const coverage =
                  p.coverageAmount || p.sumAssured || p.policyPlan?.coverage || "N/A";

                let policyType = "N/A";
                if (p.policyPlan?.policyType) {
                  if (typeof p.policyPlan.policyType === "object") {
                    policyType = p.policyPlan.policyType.name || "N/A";
                  } else if (typeof p.policyPlan.policyType === "string") {
                    policyType = p.policyPlan.policyType;
                  }
                }

                return (
                  <TableRow key={p.id} className="pending-body-row">
                    <TableCell className="pending-body-cell">{index + 1}</TableCell>
                    <TableCell className="pending-body-cell">{getUserName(p)}</TableCell>
                    <TableCell className="pending-body-cell">{p.policyPlan?.policyName || "N/A"}</TableCell>
                    <TableCell className="pending-body-cell">{policyType}</TableCell>
                    <TableCell className="pending-body-cell">{coverage}</TableCell>
                    <TableCell className="pending-body-cell">{p.startDate || "N/A"}</TableCell>
                    <TableCell className="pending-body-cell">{p.endDate || "N/A"}</TableCell>
                    <TableCell className="pending-body-cell">{p.nominee || "N/A"}</TableCell>
                    <TableCell className="pending-body-cell">{p.nomineeRelation || "N/A"}</TableCell>
                    <TableCell className="pending-body-cell">{p.policyStatus || "N/A"}</TableCell>
                    <TableCell className="pending-action-cell">
                      <Button onClick={() => handleEdit(p)} color="primary">
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(p.id)} color="error" sx={{ ml: 1 }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editDialog && <div className="blur-background"></div>}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Nominee Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Nominee"
            fullWidth
            margin="normal"
            required
            value={editData.nominee}
            onChange={(e) =>
              setEditData({ ...editData, nominee: e.target.value })
            }
          />
          <TextField
            label="Relation"
            fullWidth
            margin="normal"
            required
            value={editData.relation}
            onChange={(e) =>
              setEditData({ ...editData, relation: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

/* ---------------- CSS IN SAME FILE ---------------- */
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
  color: #fff !important;
  font-weight: bold !important;
  border: 1px solid #ccc;
  padding: 10px !important;
  text-align: center !important;
}

.pending-body-row {
  background-color: #fff;
}

.pending-body-cell {
  border: 1px solid #ccc;
  padding: 10px !important;
  text-align: center !important;
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

/* Blur background when dialog opens */
.blur-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  background: rgba(0,0,0,0.3);
  z-index: 1200;
}
`;

const style = document.createElement("style");
style.innerHTML = css;
document.head.appendChild(style);
