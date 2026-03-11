import { Box, Container, Typography, Button, Card, CardContent, Grid, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedIcon from "@mui/icons-material/Verified";
import GavelIcon from "@mui/icons-material/Gavel";
import ReportIcon from "@mui/icons-material/Report";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setIsLoggedIn(false);
    window.location.reload();
  };

  const handleReportClick = () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    navigate("/report");
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: "#16213a" }} />,
      title: "Secure & Anonymous",
      description: "Report corruption safely with complete anonymity and confidentiality"
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40, color: "#16213a" }} />,
      title: "Verified System",
      description: "Track your report status and receive updates throughout the investigation"
    },
    {
      icon: <GavelIcon sx={{ fontSize: 40, color: "#16213a" }} />,
      title: "Expert Review",
      description: "Cases reviewed by trained officers and administered by experts"
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #87CEEB 0%, #f4f7fc 100%)" }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 10 },
            textAlign: "center",
            animation: "fadeInDown 1s ease"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3, animation: "bounce 2s infinite" }}>
            <ReportIcon sx={{ fontSize: 60, color: "#16213a" }} />
          </Box>

          <Typography
            variant="h2"
            fontWeight="900"
            color="#16213a"
            sx={{
              mb: 2,
              background: "linear-gradient(135deg, #16213a, #0f3460)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Anti-Corruption Portal
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontWeight: 500 }}
          >
            Report corruption securely and anonymously. Help us build a transparent and ethical society.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            {isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleReportClick}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "700",
                    borderRadius: 2,
                    background: "#16213a",
                    transition: "0.3s",
                    "&:hover": {
                      background: "#0b1220",
                      transform: "translateY(-3px)",
                      boxShadow: "0 10px 25px rgba(22, 33, 58, 0.3)"
                    }
                  }}
                >
                  Report Crime
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "700",
                    borderRadius: 2,
                    borderColor: "#16213a",
                    color: "#16213a",
                    transition: "0.3s",
                    "&:hover": {
                      borderColor: "#0b1220",
                      background: "rgba(22, 33, 58, 0.05)",
                      transform: "translateY(-3px)"
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/signup")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "700",
                    borderRadius: 2,
                    background: "#16213a",
                    transition: "0.3s",
                    "&:hover": {
                      background: "#0b1220",
                      transform: "translateY(-3px)",
                      boxShadow: "0 10px 25px rgba(22, 33, 58, 0.3)"
                    }
                  }}
                >
                  Get Started
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "700",
                    borderRadius: 2,
                    borderColor: "#16213a",
                    color: "#16213a",
                    transition: "0.3s",
                    "&:hover": {
                      borderColor: "#0b1220",
                      background: "rgba(22, 33, 58, 0.05)",
                      transform: "translateY(-3px)"
                    }
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, background: "rgba(255, 255, 255, 0.7)" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight="800"
            textAlign="center"
            color="#16213a"
            sx={{ mb: 6 }}
          >
            Why Choose Us?
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    h: "100%",
                    border: "none",
                    borderRadius: 3,
                    transition: "0.3s",
                    animation: `fadeInUp 0.8s ease ${index * 0.2}s backwards`,
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 15px 40px rgba(22, 33, 58, 0.15)"
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight="700" color="#16213a" sx={{ mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 6, md: 10 },
            textAlign: "center",
            animation: "fadeInUp 1s ease"
          }}
        >
          <Typography
            variant="h4"
            fontWeight="800"
            color="#16213a"
            sx={{ mb: 3 }}
          >
            Ready to Make a Difference?
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
          >
            Join thousands of citizens working towards a corruption-free society. Your anonymous report matters.
          </Typography>

          {!isLoggedIn && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/signup")}
              sx={{
                px: 5,
                py: 1.5,
                fontWeight: "700",
                borderRadius: 2,
                background: "#16213a",
                transition: "0.3s",
                "&:hover": {
                  background: "#0b1220",
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 35px rgba(22, 33, 58, 0.3)"
                }
              }}
            >
              Report Now
            </Button>
          )}
        </Box>
      </Container>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

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

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </Box>
  );
}
