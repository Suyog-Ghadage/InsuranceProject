import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
import { getAuthHeaders } from "../../../api/superAdminApi";
import CONFIG from "../../../config/config";

const API_BASE = CONFIG.BASE_URL;

export default function PolicyList() {
  const [tabValue, setTabValue] = useState(0);
  const [policies, setPolicies] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState("all");
  const [purchasedPolicies, setPurchasedPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all admins for dropdown
  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/all`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(res.data)) setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  // Fetch all or admin-specific policies
  const fetchPolicies = async (adminId) => {
    setLoading(true);
    setErrorMsg("");
    try {
      let url =
        adminId && adminId !== "all"
          ? `${API_BASE}/admin-policy/${adminId}/policy-plans`
          : `${API_BASE}/admin-policy/policy-plans/all`;

      const response = await axios.get(url, { headers: getAuthHeaders() });
      if (Array.isArray(response.data)) {
        setPolicies(response.data);
      } else {
        setPolicies([]);
        setErrorMsg("Invalid response format.");
      }
    } catch (error) {
      console.error("Fetch policies error:", error);
      setErrorMsg("Failed to fetch policies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchased policies
  const fetchPurchasedPolicies = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`${API_BASE}/user-policy/all`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(res.data)) {
        setPurchasedPolicies(res.data);
      } else {
        setPurchasedPolicies([]);
        setErrorMsg("Invalid purchased policy data.");
      }
    } catch (error) {
      console.error("Fetch purchased policies error:", error);
      setErrorMsg("Failed to fetch purchased policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (selectedAdmin !== null) fetchPolicies(selectedAdmin);
  }, [selectedAdmin]);

  useEffect(() => {
    if (tabValue === 1) fetchPurchasedPolicies();
  }, [tabValue]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        🛡️ Policies Section
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="All Policies" />
        <Tab label="Purchased Policies" />
      </Tabs>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <>
              <FormControl size="small" sx={{ minWidth: 250, mb: 2 }}>
                <InputLabel>Filter by Admin</InputLabel>
                <Select
                  value={selectedAdmin}
                  label="Filter by Admin"
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                >
                  <MenuItem value="all">All Policies</MenuItem>
                  {admins.map((admin) => (
                    <MenuItem key={admin.id} value={admin.id}>
                      {admin.username} ({admin.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Sr. No.</strong></TableCell>
                      <TableCell><strong>Policy Name</strong></TableCell>
                      <TableCell><strong>Coverage</strong></TableCell>
                      <TableCell><strong>Premium</strong></TableCell>
                      <TableCell><strong>Duration (Years)</strong></TableCell>
                      <TableCell><strong>Admin</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {policies.map((p, index) => (
                      <TableRow key={p.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{p.policyName}</TableCell>
                        <TableCell>₹{p.coverage?.toLocaleString()}</TableCell>
                        <TableCell>₹{p.premium?.toLocaleString()}</TableCell>
                        <TableCell>{p.durationInYears}</TableCell>
                        <TableCell>{p.admin?.username }</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {tabValue === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Sr. No.</strong></TableCell>
                    <TableCell><strong>Username</strong></TableCell> 
                    <TableCell><strong>Policy Name</strong></TableCell>
                    <TableCell><strong>Policy Status</strong></TableCell>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell><strong>Nominee</strong></TableCell>
                    <TableCell><strong>Relation</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchasedPolicies.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{p.userName}</TableCell> 
                      <TableCell>{p.policyName}</TableCell>
                      <TableCell>{p.policyStatus}</TableCell>
                      <TableCell>{p.startDate}</TableCell>
                      <TableCell>{p.endDate}</TableCell>
                      <TableCell>{p.nominee}</TableCell>
                      <TableCell>{p.nomineeRelation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}
