import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/auth/signup", data);
      alert("Registered Successfully");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Signup failed";
      setError(errorMsg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #87CEEB, #f4f7fc)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          animation: "fadeInUp 0.8s ease"
        }}
      >
        <Typography
          variant="h4"
          fontWeight="800"
          textAlign="center"
          mb={1}
          color="#16213a"
        >
          Create Account
        </Typography>

        <Typography
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Join the Anti-Corruption Portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={data.name}
              onChange={(e) =>
                setData({ ...data, name: e.target.value })
              }
              disabled={loading}
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={data.email}
              onChange={(e) =>
                setData({ ...data, email: e.target.value })
              }
              disabled={loading}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={data.password}
              onChange={(e) =>
                setData({ ...data, password: e.target.value })
              }
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.2,
                fontWeight: "700",
                borderRadius: 2,
                textTransform: "none",
                background: "#16213a",
                transition: "0.3s",
                "&:hover": {
                  background: "#0b1220",
                  transform: "translateY(-2px)"
                }
              }}
            >
              {loading ? "Creating Account..." : "Signup"}
            </Button>

            <Typography
              textAlign="center"
              fontSize={14}
              color="text.secondary"
            >
              Already have an account?{" "}
              <span
                style={{
                  color: "#16213a",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* Animation keyframes */}
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
