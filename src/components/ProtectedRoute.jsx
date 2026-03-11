import { Navigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

export default function ProtectedRoute({ children, role }) {
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");

  if (!token) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5" color="error">Please login to continue</Typography>
        <Button variant="contained" href="/login">Go to Login</Button>
      </Box>
    );
  }

  if (role && role !== userRole) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography>You don't have permission to access this page</Typography>
        <Button variant="contained" href="/">Go Home</Button>
      </Box>
    );
  }

  return children;
}
