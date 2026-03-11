import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Tabs,
  Tab,
  Switch,
  Tooltip,
  IconButton
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import LogoutIcon from "@mui/icons-material/Logout";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api";

// Fix for Leaflet marker icons in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText
} from "@mui/material";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);

  // Officer Management States
  const [activeTab, setActiveTab] = useState(0);
  const [officerDialogOpen, setOfficerDialogOpen] = useState(false);
  const [newOfficerData, setNewOfficerData] = useState({ name: "", email: "", password: "" });

  // Filter states
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const openDetails = (report) => {
    setSelectedReportDetails(report);
    setDetailsDialogOpen(true);
  };

  useEffect(() => {
    fetchReports();
    fetchOfficers();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reports");
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await api.get("/admin/officers");
      setOfficers(res.data);
    } catch (err) {
      console.error("Failed to load officers", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    window.location = "/";
  };

  const openAssignDialog = (report) => {
    setSelectedReport(report);
    setSelectedOfficer("");
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    try {
      await api.post("/admin/assign", {
        reportId: selectedReport._id,
        officerId: selectedOfficer
      });
      setAssignDialogOpen(false);
      fetchReports();
      fetchOfficers(); // Refresh to update caseloads
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    }
  };

  const handleAddOfficer = async () => {
    try {
      await api.post("/admin/officers", newOfficerData);
      setOfficerDialogOpen(false);
      setNewOfficerData({ name: "", email: "", password: "" });
      fetchOfficers();
      alert("Officer added successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add officer");
    }
  };

  const handleToggleOfficer = async (id) => {
    try {
      await api.put(`/admin/officers/${id}/toggle`);
      fetchOfficers();
    } catch (err) {
      alert("Failed to update officer status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "warning";
      case "Under Investigation": return "info";
      case "Resolved": return "success";
      case "Rejected": return "error";
      case "Completed": return "success";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <PendingIcon />;
      case "Resolved": case "Completed": return <CheckCircleIcon />;
      default: return <AssignmentIcon />;
    }
  };

  // Filter reports based on selected filters
  const filteredReports = reports.filter(report => {
    // Status filter
    if (filterStatus !== "All" && report.status !== filterStatus) return false;

    // Category filter
    if (filterCategory !== "All" && report.category !== filterCategory) return false;

    // Date range filter
    if (filterDateFrom) {
      const reportDate = new Date(report.createdAt);
      const fromDate = new Date(filterDateFrom);
      if (reportDate < fromDate) return false;
    }
    if (filterDateTo) {
      const reportDate = new Date(report.createdAt);
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      if (reportDate > toDate) return false;
    }

    return true;
  });

  // Get unique categories from reports
  const categories = ["All", ...new Set(reports.map(r => r.category).filter(Boolean))];

  const stats = [
    { label: "Total Reports", value: filteredReports.length, color: "#16213a" },
    { label: "Pending", value: filteredReports.filter(r => r.status === "Pending").length, color: "#ff9800" },
    { label: "Resolved/Completed", value: filteredReports.filter(r => ["Resolved", "Completed"].includes(r.status)).length, color: "#4caf50" }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #87CEEB 0%, #f4f7fc 100%)",
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssignmentIcon sx={{ fontSize: 40, color: "#16213a" }} />
            <Typography variant="h4" fontWeight="800" color="#16213a">
              Admin Dashboard
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: "#16213a",
              color: "#16213a",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#0b1220",
                background: "rgba(22, 33, 58, 0.05)"
              }
            }}
          >
            Logout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={4} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="text.secondary" gutterBottom>
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{ color: stat.color }}
                  >
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Reports" sx={{ fontWeight: 600 }} />
            <Tab label="Officer Management" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            {/* Filter Section */}
            <Paper elevation={4} sx={{ borderRadius: 2, p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: "#16213a" }}>
                Filter Reports
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="All">All Statuses</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Under Investigation">Under Investigation</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      label="Category"
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat === "All" ? "All Categories" : cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="From Date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="To Date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={() => {
                      setFilterStatus("All");
                      setFilterCategory("All");
                      setFilterDateFrom("");
                      setFilterDateTo("");
                    }}
                    sx={{
                      borderColor: "#16213a",
                      color: "#16213a",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#0b1220",
                        background: "rgba(22, 33, 58, 0.05)"
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Reports Table */}
            <Paper elevation={6} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{ p: 3, color: "#16213a", background: "rgba(22, 33, 58, 0.05)" }}
              >
                All Reports
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredReports.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    {reports.length === 0 ? "No reports found" : "No reports match the selected filters"}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: "rgba(22, 33, 58, 0.05)" }}>
                        <TableCell fontWeight="700">Title</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="center">Location</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Files</TableCell>
                        <TableCell align="center">Date</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report._id} sx={{ "&:hover": { background: "rgba(0, 0, 0, 0.02)" } }}>
                          <TableCell fontWeight="600" sx={{ maxWidth: 150, overflow: "auto" }}>
                            {report.title}
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={report.category || "General"} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {report.location || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: "auto" }}>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {report.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={getStatusIcon(report.status)}
                              label={report.status || "Pending"}
                              color={getStatusColor(report.status)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {report.files?.length || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {report.status === "Pending" && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => openAssignDialog(report)}
                                  sx={{ background: "#16213a" }}
                                >
                                  Assign
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openDetails(report)}
                              >
                                View
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        )}

        {activeTab === 1 && (
          <Paper elevation={4} sx={{ borderRadius: 2, p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" fontWeight="700" color="#16213a">
                Authorized Officers
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setOfficerDialogOpen(true)}
                sx={{ background: "#16213a" }}
              >
                Add Officer
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "rgba(22, 33, 58, 0.05)" }}>
                    <TableCell fontWeight="700">Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Active Cases</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {officers.map((officer) => (
                    <TableRow key={officer._id}>
                      <TableCell>{officer.name}</TableCell>
                      <TableCell>{officer.email}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={officer.activeCases || 0} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={officer.isActive !== false ? "Active" : "Disabled"}
                          color={officer.isActive !== false ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={officer.isActive !== false}
                          onChange={() => handleToggleOfficer(officer._id)}
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {officers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No officers found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Assign Officer</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Officer</InputLabel>
                <Select
                  value={selectedOfficer}
                  label="Select Officer"
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                >
                  {officers
                    .filter(officer => officer.isActive !== false)
                    .map((officer) => (
                      <MenuItem
                        key={officer._id}
                        value={officer._id}
                        disabled={officer.activeCases >= 2}
                      >
                        <ListItemText
                          primary={officer.name}
                          secondary={`Active Cases: ${officer.activeCases || 0}/2`}
                        />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAssign}
              variant="contained"
              disabled={!selectedOfficer}
              sx={{ background: "#16213a" }}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Report Details</DialogTitle>
          <DialogContent dividers>
            {selectedReportDetails && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="h6">{selectedReportDetails.title}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Chip label={selectedReportDetails.category || "General"} size="small" variant="outlined" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body1">{selectedReportDetails.location || "Not specified"}</Typography>
                  </Stack>
                  {selectedReportDetails.latitude && selectedReportDetails.longitude && (
                    <Box
                      sx={{
                        height: 250,
                        width: "100%",
                        mt: 2,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid #ddd",
                        zIndex: 0
                      }}
                    >
                      <MapContainer
                        center={[selectedReportDetails.latitude, selectedReportDetails.longitude]}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedReportDetails.latitude, selectedReportDetails.longitude]} />
                      </MapContainer>
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography paragraph sx={{ whiteSpace: "pre-wrap" }}>{selectedReportDetails.description}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Officer Verification</Typography>
                  {selectedReportDetails.status === "Completed" ? (
                    <Card variant="outlined" sx={{ mt: 1, bgcolor: "rgba(76, 175, 80, 0.05)" }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                          <Typography fontWeight="bold">Verdict:</Typography>
                          <Chip
                            label={selectedReportDetails.officerVerdict || "N/A"}
                            color={selectedReportDetails.officerVerdict === "Genuine" ? "success" : "error"}
                            size="small"
                          />
                        </Stack>
                        <Typography variant="subtitle2" fontWeight="bold">Officer Notes:</Typography>
                        <Typography variant="body2">{selectedReportDetails.officerNotes || "No notes provided."}</Typography>
                      </CardContent>
                    </Card>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      Pending officer verification.
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add Officer Dialog */}
        <Dialog open={officerDialogOpen} onClose={() => setOfficerDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add New Officer</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                value={newOfficerData.name}
                onChange={(e) => setNewOfficerData({ ...newOfficerData, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={newOfficerData.email}
                onChange={(e) => setNewOfficerData({ ...newOfficerData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={newOfficerData.password}
                onChange={(e) => setNewOfficerData({ ...newOfficerData, password: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOfficerDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddOfficer}
              variant="contained"
              sx={{ background: "#16213a" }}
              disabled={!newOfficerData.name || !newOfficerData.email || !newOfficerData.password}
            >
              Add Officer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
