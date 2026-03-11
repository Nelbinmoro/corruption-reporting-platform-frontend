import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
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

function LocationMarker({ position, setPosition, setLocation, setLoading }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      map.flyTo(e.latlng, map.getZoom());
      reverseGeocode(lat, lng, setLocation, setLoading);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

async function reverseGeocode(lat, lng, setLocation, setLoading) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    if (data && data.display_name) {
      setLocation(data.display_name);
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }
}

export default function ReportCrime() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: ""
  });
  const [customCategory, setCustomCategory] = useState("");
  const [mapPosition, setMapPosition] = useState([20.5937, 78.9629]); // Default to India center
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const setLocationFromMap = (address) => {
    setFormData(prev => ({ ...prev, location: address }));
    setHasSelectedLocation(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.location.trim()) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate custom category if "Other" is selected
      if (formData.category === "Other" && !customCategory.trim()) {
        setError("Please specify the category");
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      // Use custom category if "Other" is selected
      const categoryToSubmit = formData.category === "Other" ? customCategory : formData.category;
      form.append("category", categoryToSubmit);
      form.append("location", formData.location);
      if (hasSelectedLocation) {
        form.append("latitude", mapPosition[0]);
        form.append("longitude", mapPosition[1]);
      }
      files.forEach((f) => form.append("files", f));

      await api.post("/report", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess(true);
      setFormData({ title: "", description: "", category: "", location: "" });
      setCustomCategory("");
      setFiles([]);

      setTimeout(() => {
        setSuccess(false);
        window.location = "/";
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to submit report";
      setError(errorMsg);
      console.error("Report error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #87CEEB 0%, #f4f7fc 100%)",
        py: 8
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            animation: "fadeInUp 0.8s ease"
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CloudUploadIcon sx={{ fontSize: 50, color: "#16213a" }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight="800"
              color="#16213a"
              sx={{ mb: 1 }}
            >
              Report Corruption
            </Typography>
            <Typography color="text.secondary">
              Provide detailed information about the corruption you witnessed
            </Typography>
          </Box>

          {success && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 3 }}
            >
              Report submitted successfully! Redirecting...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={submit}>
            <Stack spacing={3}>
              {/* Title Field */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                  Report Title *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Brief title of the incident"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={loading}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {/* Category Field */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                  Crime Category *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.category}
                    displayEmpty
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      // Clear custom category if switching away from "Other"
                      if (e.target.value !== "Other") {
                        setCustomCategory("");
                      }
                    }}
                    disabled={loading}
                  >
                    <MenuItem value="" disabled>Select Category</MenuItem>
                    <MenuItem value="Bribery">Bribery</MenuItem>
                    <MenuItem value="Embezzlement">Embezzlement</MenuItem>
                    <MenuItem value="Fraud">Fraud</MenuItem>
                    <MenuItem value="Nepotism">Nepotism</MenuItem>
                    <MenuItem value="Money Laundering">Money Laundering</MenuItem>
                    <MenuItem value="Extortion">Extortion</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                {/* Custom Category Input - shown when "Other" is selected */}
                {formData.category === "Other" && (
                  <TextField
                    fullWidth
                    placeholder="Please specify the category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

              {/* Location Field */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                  Incident Location *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Where did the incident occur?"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  disabled={loading}
                  variant="outlined"
                  size="small"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Or select the location on the map below:
                </Typography>
                <Box
                  sx={{
                    height: 300,
                    width: "100%",
                    mt: 2,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    zIndex: 1
                  }}
                >
                  <MapContainer
                    center={mapPosition}
                    zoom={5}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={hasSelectedLocation ? mapPosition : null}
                      setPosition={(pos) => {
                        setMapPosition(pos);
                        setHasSelectedLocation(true);
                      }}
                      setLocation={setLocationFromMap}
                    />
                  </MapContainer>
                </Box>
              </Box>

              {/* Description Field */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                  Description *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Provide detailed information about the corruption incident..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={loading}
                  variant="outlined"
                />
              </Box>

              {/* File Upload */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                  Attach Evidence (Optional)
                </Typography>

                <Box
                  sx={{
                    border: "2px dashed #16213a",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "0.3s",
                    background: "rgba(22, 33, 58, 0.02)",
                    "&:hover": {
                      background: "rgba(22, 33, 58, 0.05)",
                      borderColor: "#0b1220"
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                    style={{ display: "none" }}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <AttachFileIcon sx={{ fontSize: 40, color: "#16213a", mb: 1 }} />
                  <Typography color="text.secondary">
                    Click to upload files (Images, PDFs, Documents)
                  </Typography>
                </Box>

                {/* File List */}
                {files.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                      Attached Files ({files.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {Array.from(files).map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Card sx={{ background: "rgba(22, 33, 58, 0.05)" }}>
                            <CardContent
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 1,
                                "&:last-child": { pb: 1 }
                              }}
                            >
                              <Typography variant="body2" noWrap>
                                {file.name}
                              </Typography>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => removeFile(index)}
                                disabled={loading}
                              >
                                Remove
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: "700",
                  borderRadius: 2,
                  background: "#16213a",
                  transition: "0.3s",
                  "&:hover": {
                    background: "#0b1220",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 25px rgba(22, 33, 58, 0.3)"
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Submitting...
                  </Box>
                ) : (
                  "Submit Report"
                )}
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Your identity will be kept confidential. All reports are reviewed by trained officers.
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}
