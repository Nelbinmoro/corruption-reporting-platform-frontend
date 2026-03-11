import { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    Card,
    CardContent,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Snackbar,
    Select,
    FormControl,
    InputLabel,
    InputAdornment
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
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

export default function ReportHistory() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        location: ""
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Filter states
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get("/report/my");
            setReports(res.data);
        } catch (err) {
            setError("Failed to load your reports. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "warning";
            case "Under Investigation": return "info";
            case "Resolved": case "Completed": return "success";
            case "Rejected": return "error";
            default: return "default";
        }
    };

    const handleEditClick = (report) => {
        setEditingReport(report);
        setFormData({
            title: report.title,
            description: report.description,
            category: report.category,
            location: report.location || ""
        });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditingReport(null);
        setFormData({ title: "", description: "", category: "", location: "" });
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async () => {
        try {
            await api.put(`/report/${editingReport._id}`, formData);
            setSnackbar({ open: true, message: "Report updated successfully!", severity: "success" });
            handleEditClose();
            fetchReports(); // Refresh the reports list
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update report";
            setSnackbar({ open: true, message: errorMsg, severity: "error" });
            console.error(err);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Filter logic
    const filteredReports = reports.filter(report => {
        const matchesStatus = !statusFilter || report.status === statusFilter;
        const matchesCategory = !categoryFilter || report.category === categoryFilter;
        const matchesSearch = !searchQuery || report.title.toLowerCase().includes(searchQuery.toLowerCase());
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
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                py: 6
            }}
        >
            <Container maxWidth="md">
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                    <HistoryIcon sx={{ fontSize: 40, color: "#16213a" }} />
                    <Typography variant="h4" fontWeight="800" color="#16213a">
                        My Report History
                    </Typography>
                </Box>

                {/* Filter Section */}
                {!loading && reports.length > 0 && (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)"
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <FilterListIcon sx={{ color: "#16213a" }} />
                            <Typography variant="h6" fontWeight="700" color="#16213a">
                                Filter Reports
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
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Under Investigation">Under Investigation</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Rejected">Rejected</MenuItem>
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
                                                <SearchIcon sx={{ color: "#16213a" }} />
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
                                        borderColor: "#16213a",
                                        color: "#16213a",
                                        fontWeight: "600",
                                        "&:hover": {
                                            borderColor: "#16213a",
                                            background: "rgba(22, 33, 58, 0.05)"
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
                                Showing {filteredReports.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
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
                    <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                ) : reports.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            You haven't submitted any reports yet.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Your reports will appear here once you submit them.
                        </Typography>
                        <Button
                            variant="contained"
                            href="/report"
                            size="large"
                            sx={{
                                background: "#16213a",
                                px: 4,
                                borderRadius: 2,
                                fontWeight: "bold"
                            }}
                        >
                            Submit First Report
                        </Button>
                    </Paper>
                ) : filteredReports.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No reports match your filters
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Try adjusting your filter criteria or clear all filters.
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={handleClearFilters}
                            startIcon={<ClearIcon />}
                            sx={{
                                borderColor: "#16213a",
                                color: "#16213a",
                                fontWeight: "600"
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Paper>
                ) : (
                    <Stack spacing={3}>
                        {filteredReports.map((report) => (


                            <Card
                                key={report._id}
                                elevation={3}
                                sx={{
                                    borderRadius: 3,
                                    transition: "0.3s",
                                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 15px 40px rgba(0,0,0,0.1)" }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={2} justifyContent="space-between" alignItems="flex-start">
                                        <Grid item xs={12} sm={8}>
                                            <Typography variant="h5" fontWeight="bold" color="#16213a" gutterBottom>
                                                {report.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                                                Submitted on {new Date(report.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                            <Chip
                                                label={report.status || "Pending"}
                                                color={getStatusColor(report.status)}
                                                sx={{ fontWeight: "700", px: 1 }}
                                            />
                                            {!report.assignedOfficer && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleEditClick(report)}
                                                    sx={{
                                                        borderColor: "#16213a",
                                                        color: "#16213a",
                                                        fontWeight: "600",
                                                        "&:hover": {
                                                            borderColor: "#16213a",
                                                            background: "rgba(22, 33, 58, 0.05)"
                                                        }
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#16213a" }}>
                                        <LocationOnIcon fontSize="small" />
                                        <Typography variant="body2" fontWeight="600">
                                            Location: {report.location || "Not specified"}
                                        </Typography>
                                    </Box>

                                    {report.latitude && report.longitude && (
                                        <Box
                                            sx={{
                                                height: 200,
                                                width: "100%",
                                                mb: 3,
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                border: "1px solid #eee",
                                                zIndex: 0
                                            }}
                                        >
                                            <MapContainer
                                                center={[report.latitude, report.longitude]}
                                                zoom={13}
                                                scrollWheelZoom={false}
                                                dragging={false}
                                                style={{ height: "100%", width: "100%" }}
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <Marker position={[report.latitude, report.longitude]} />
                                            </MapContainer>
                                        </Box>
                                    )}

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            p: 2,
                                            background: "#f8faff",
                                            borderRadius: 2,
                                            borderLeft: "4px solid #16213a",
                                            mb: 2
                                        }}
                                    >
                                        {report.description}
                                    </Typography>

                                    {report.status === "Completed" && report.officerVerdict && (
                                        <Alert
                                            severity={report.officerVerdict === "Genuine" ? "success" : "error"}
                                            sx={{ mt: 2, borderRadius: 2, fontWeight: "500" }}
                                        >
                                            <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                                                Officer Verdict: {report.officerVerdict}
                                            </Typography>
                                            {report.officerVerdict === "Genuine"
                                                ? "The case is closed and actions are taken against the criminal. For more details, contact the nearest police station."
                                                : report.officerVerdict === "False Report"
                                                    ? "Don't send false alerts or details, it is a crime."
                                                    : "Sorry, the case can't be proved because of insufficient evidence."
                                            }
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleEditClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ fontWeight: "bold", color: "#16213a", fontSize: "1.5rem" }}>
                    Edit Report
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleFormChange}
                            fullWidth
                            required
                            variant="outlined"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            fullWidth
                            required
                            multiline
                            rows={4}
                            variant="outlined"
                        />
                        <TextField
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleFormChange}
                            fullWidth
                            required
                            select
                            variant="outlined"
                        >
                            <MenuItem value="Bribery">Bribery</MenuItem>
                            <MenuItem value="Embezzlement">Embezzlement</MenuItem>
                            <MenuItem value="Fraud">Fraud</MenuItem>
                            <MenuItem value="Nepotism">Nepotism</MenuItem>
                            <MenuItem value="Abuse of Power">Abuse of Power</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                        <TextField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleFormChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={handleEditClose}
                        variant="outlined"
                        sx={{
                            borderColor: "#ccc",
                            color: "#666",
                            fontWeight: "600"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        sx={{
                            background: "#16213a",
                            fontWeight: "600",
                            px: 3,
                            "&:hover": {
                                background: "#0d1421"
                            }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: "100%", borderRadius: 2, fontWeight: "600" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
