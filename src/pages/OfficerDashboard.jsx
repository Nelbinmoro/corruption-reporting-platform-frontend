import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  InputAdornment
} from "@mui/material";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
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

export default function OfficerDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingCaseId, setCompletingCaseId] = useState(null);
  const [completionData, setCompletionData] = useState({ verdict: "", notes: "" });

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.get("/officer/cases");
      setCases(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (id) => {
    setCompletingCaseId(id);
    setCompletionData({ verdict: "", notes: "" });
    setCompleteDialogOpen(true);
  };

  const handleEdit = (caseItem) => {
    setCompletingCaseId(caseItem._id);
    setCompletionData({ verdict: caseItem.officerVerdict || "", notes: caseItem.officerNotes || "" });
    setCompleteDialogOpen(true);
  };

  const submitCompletion = async () => {
    try {
      await api.put(`/officer/complete/${completingCaseId}`, completionData);
      setCompleteDialogOpen(false);
      fetchCases(); // Refresh list
    } catch (err) {
      alert("Failed to update case");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    window.location = "/";
  };

  const getFileUrl = (filename) => {
    return `http://localhost:5000/uploads/${filename}`;
  };

  const openFile = (file) => {
    setSelectedFile(file);
    setFileDialogOpen(true);
  };

  const closeFile = () => {
    setFileDialogOpen(false);
    setSelectedFile(null);
  };

  const isImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  const isPdf = (filename) => {
    return /\.(pdf)$/i.test(filename);
  };

  // Filter logic
  const filteredCases = cases.filter(caseItem => {
    const matchesStatus = !statusFilter || caseItem.status === statusFilter;
    const matchesCategory = !categoryFilter || caseItem.category === categoryFilter;
    const matchesSearch = !searchQuery || caseItem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleClearFilters = () => {
    setStatusFilter("");
    setCategoryFilter("");
    setSearchQuery("");
  };

  const hasActiveFilters = statusFilter || categoryFilter || searchQuery;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LocalPoliceIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight="800">
              Officer Dashboard
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: "white",
              color: "white",
              fontWeight: 600,
              "&:hover": {
                borderColor: "white",
                background: "rgba(255, 255, 255, 0.1)"
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

        {/* Filter Section */}
        {!loading && cases.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FilterListIcon sx={{ color: "#1e3c72" }} />
              <Typography variant="h6" fontWeight="700" color="#1e3c72">
                Filter Cases
              </Typography>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="Under Investigation">Under Investigation</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Bribery">Bribery</MenuItem>
                    <MenuItem value="Embezzlement">Embezzlement</MenuItem>
                    <MenuItem value="Fraud">Fraud</MenuItem>
                    <MenuItem value="Nepotism">Nepotism</MenuItem>
                    <MenuItem value="Abuse of Power">Abuse of Power</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={8} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#1e3c72" }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="medium"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  sx={{
                    borderColor: "#1e3c72",
                    color: "#1e3c72",
                    fontWeight: "600",
                    "&:hover": {
                      borderColor: "#1e3c72",
                      background: "rgba(30, 60, 114, 0.05)"
                    },
                    "&.Mui-disabled": {
                      borderColor: "#ccc",
                      color: "#999"
                    }
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>

            {/* Results count */}
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Showing {filteredCases.length} of {cases.length} case{cases.length !== 1 ? 's' : ''}
              </Typography>
              {hasActiveFilters && (
                <Chip
                  label="Filtered"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: "600", fontSize: "0.7rem" }}
                />
              )}
            </Box>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress sx={{ color: "white" }} />
          </Box>
        ) : cases.length === 0 ? (
          <Box sx={{ textAlign: "center", color: "white", mt: 8 }}>
            <TaskAltIcon sx={{ fontSize: 80, opacity: 0.5, mb: 2 }} />
            <Typography variant="h5">No active cases assigned</Typography>
            <Typography sx={{ opacity: 0.8 }}>Good job, Officer!</Typography>
          </Box>
        ) : filteredCases.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No cases match your filters
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filter criteria or clear all filters.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              sx={{
                borderColor: "#1e3c72",
                color: "#1e3c72",
                fontWeight: "600"
              }}
            >
              Clear Filters
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {filteredCases.map((c) => (
              <Grid item xs={12} md={6} key={c._id} sx={{ display: "flex" }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, overflow: "auto", maxHeight: 600 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight="bold">
                        {c.title}
                      </Typography>
                      <Chip
                        label={c.status}
                        color={c.status === "Completed" ? "success" : "info"}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#1e3c72" }}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2" fontWeight="600">
                        Location: {c.location || "Not specified"}
                      </Typography>
                    </Box>

                    {c.latitude && c.longitude && (
                      <Box
                        sx={{
                          height: 180,
                          width: "100%",
                          mb: 2,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid #eee",
                          zIndex: 0
                        }}
                      >
                        <MapContainer
                          center={[c.latitude, c.longitude]}
                          zoom={14}
                          scrollWheelZoom={false}
                          dragging={false}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[c.latitude, c.longitude]} />
                        </MapContainer>
                      </Box>
                    )}

                    <Typography color="text.secondary" paragraph sx={{ whiteSpace: "pre-wrap" }}>
                      {c.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      Evidence Files:
                    </Typography>
                    {c.files?.length > 0 ? (
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {c.files.map((file, i) => (
                          <Button
                            key={i}
                            variant="outlined"
                            size="small"
                            startIcon={<AttachFileIcon />}
                            onClick={() => openFile(file)}
                          >
                            View File {i + 1}
                          </Button>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No files attached</Typography>
                    )}

                    <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, color: "text.disabled" }}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="caption">
                        Assigned: {new Date(c.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {c.status === "Completed" && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: "#f1f8e9", borderRadius: 2, border: "1px solid #c5e1a5" }}>
                        <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>
                          Case Verification Details
                        </Typography>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          Verdict: <span style={{ color: "#2e7d32" }}>{c.officerVerdict}</span>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                          Notes: {c.officerNotes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {c.status !== "Completed" ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<TaskAltIcon />}
                        onClick={() => handleComplete(c._id)}
                      >
                        Mark as Complete
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(c)}
                      >
                        Edit Verification
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* File Viewer Modal */}
        <Dialog
          open={fileDialogOpen}
          onClose={closeFile}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { height: "90vh" } }}
        >
          <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Evidence Viewer</span>
            <IconButton onClick={closeFile}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0, height: "100%", bgcolor: "#f5f5f5", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {selectedFile && (
              isImage(selectedFile) ? (
                <img
                  src={getFileUrl(selectedFile)}
                  alt="Evidence"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              ) : isPdf(selectedFile) ? (
                <iframe
                  src={getFileUrl(selectedFile)}
                  title="Document Viewer"
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
              ) : (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Preview not available for this file type
                  </Typography>
                  <Typography variant="body2" color="text.disabled" paragraph>
                    {selectedFile}
                  </Typography>
                  <Button
                    variant="contained"
                    href={getFileUrl(selectedFile)}
                    target="_blank"
                    download
                  >
                    Download File to View
                  </Button>
                </Box>
              )
            )}
          </DialogContent>
          <DialogActions>
            <Button href={selectedFile ? getFileUrl(selectedFile) : "#"} target="_blank" download>
              Download Original
            </Button>
            <Button onClick={closeFile} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Completion Dialog */}
        <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {cases.find(c => c._id === completingCaseId)?.status === "Completed"
              ? "Update Case Verification"
              : "Complete Case Verification"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Verdict</InputLabel>
                <Select
                  value={completionData.verdict}
                  label="Verdict"
                  onChange={(e) => setCompletionData({ ...completionData, verdict: e.target.value })}
                >
                  <MenuItem value="Genuine">Genuine Case</MenuItem>
                  <MenuItem value="False Report">False/Spam Report</MenuItem>
                  <MenuItem value="Insufficient Evidence">Insufficient Evidence</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Officer Notes"
                multiline
                rows={4}
                fullWidth
                value={completionData.notes}
                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                placeholder="Provide details about your investigation..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={submitCompletion}
              variant="contained"
              color="success"
              disabled={!completionData.verdict || !completionData.notes}
            >
              {cases.find(c => c._id === completingCaseId)?.status === "Completed"
                ? "Update Verification"
                : "Submit & Complete"}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
