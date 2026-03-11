import { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Stack,
    Divider,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Fade,
    Zoom
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import profileBg from "../assets/profile-bg.png";
import api from "../api";

export default function Profile() {
    const [user, setUser] = useState({ name: "", email: "", role: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const userRes = await api.get("/auth/me");
            setUser(userRes.data);
        } catch (err) {
            setError("Failed to load profile. Please login again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        window.location = "/";
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundImage: `linear-gradient(rgba(10, 20, 40, 0.85), rgba(10, 20, 40, 0.85)), url(${profileBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                py: 10,
                display: "flex",
                alignItems: "center"
            }}
        >
            <Container maxWidth="sm">
                <Fade in={true} timeout={1000}>
                    <Box>
                        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 5,
                                    overflow: "hidden",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                                    position: "relative"
                                }}
                            >
                                {/* Cover Section */}
                                <Box
                                    sx={{
                                        height: 140,
                                        background: "linear-gradient(45deg, #16213e 30%, #0f3460 90%)",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        p: 2
                                    }}
                                >
                                    <Chip
                                        label={user.role?.toUpperCase()}
                                        sx={{
                                            bgcolor: "rgba(255,255,255,0.1)",
                                            color: "white",
                                            fontWeight: "700",
                                            backdropFilter: "blur(5px)",
                                            border: "1px solid rgba(255,255,255,0.2)"
                                        }}
                                    />
                                </Box>

                                <Box sx={{ px: 4, pb: 4, mt: -7, textAlign: "center" }}>
                                    <Avatar
                                        sx={{
                                            width: 130,
                                            height: 130,
                                            margin: "0 auto",
                                            border: "6px solid rgba(10, 20, 40, 0.85)",
                                            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                                            bgcolor: "#1e3c72",
                                            mb: 2,
                                            fontSize: 50
                                        }}
                                    >
                                        {user.name?.charAt(0) || <PersonIcon />}
                                    </Avatar>

                                    <Typography variant="h4" fontWeight="800" color="white" gutterBottom>
                                        {user.name || "User"}
                                    </Typography>
                                    <Typography variant="body1" color="rgba(255,255,255,0.6)" sx={{ mb: 4 }}>
                                        {user.email}
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        {[
                                            { icon: <EmailIcon />, label: "Email", value: user.email },
                                            { icon: <VerifiedUserIcon />, label: "Status", value: "Verified User" },
                                            { icon: <AssignmentIcon />, label: "Role", value: user.role }
                                        ].map((item, index) => (
                                            <Grid item xs={index === 0 ? 12 : 6} key={index}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        background: "rgba(255,255,255,0.03)",
                                                        border: "1px solid rgba(255,255,255,0.05)",
                                                        textAlign: "left",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 3,
                                                        height: "60%",
                                                        transition: "0.3s",
                                                        "&:hover": {
                                                            background: "rgba(255,255,255,0.08)",
                                                            borderColor: "rgba(255,255,255,0.2)"
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ color: "#4facfe" }}>{item.icon}</Box>
                                                    <Box>
                                                        <Typography variant="caption" color="rgba(255,255,255,0.4)" display="block" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                                                            {item.label}
                                                        </Typography>
                                                        <Typography variant="body2" color="white" fontWeight="600">
                                                            {item.value}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.1)" }} />

                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                background: "linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)",
                                                borderRadius: 3,
                                                py: 1.5,
                                                fontWeight: "bold",
                                                boxShadow: "0 10px 20px rgba(30, 60, 114, 0.3)"
                                            }}
                                            startIcon={<AssignmentIcon />}
                                            href="/my-reports"
                                        >
                                            My Reports
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleLogout}
                                            sx={{
                                                borderRadius: 3,
                                                px: 4,
                                                borderWidth: 2,
                                                "&:hover": { borderWidth: 2 }
                                            }}
                                        >
                                            <LogoutIcon />
                                        </Button>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Zoom>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
