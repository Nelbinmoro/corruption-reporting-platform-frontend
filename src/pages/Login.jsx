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
import api from "../api";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/auth/login", { ...data, email: data.email.trim() });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.role);

      // Redirect based on role
      if (res.data.role === "admin") {
        window.location = "/admin";
      } else if (res.data.role === "officer") {
        window.location = "/officer";
      } else {
        window.location = "/";
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      console.error("Login error:", err);
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
          Welcome Back
        </Typography>

        <Typography
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Sign in to Anti-Corruption Portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
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
              {loading ? "Signing In..." : "Login"}
            </Button>

            <Typography
              textAlign="center"
              fontSize={14}
              color="text.secondary"
            >
              Don't have an account?{" "}
              <span
                style={{
                  color: "#16213a",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={() => (window.location = "/signup")}
              >
                Sign up
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
