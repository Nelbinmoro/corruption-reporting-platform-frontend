import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  return (
    <AppBar position="static" sx={{ background: "#16213a" }}>
      <Toolbar>

        {/* LOGO / TITLE */}
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700 }}
          component={Link}
          to="/"
          style={{ textDecoration: "none", color: "white" }}
        >
          Anti-Corruption Portal
        </Typography>

        {/* PUBLIC LINKS */}
        {!token && (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/signup">
              Signup
            </Button>
          </>
        )}

        {/* USER LINKS */}
        {token && (
          <Box>
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>

            {role === "user" && (
              <>
                <Button color="inherit" component={Link} to="/report">
                  Report Case
                </Button>
              </>
            )}

            {role === "officer" && (
              <Button color="inherit" component={Link} to="/officer">
                Officer Panel
              </Button>
            )}

            {role === "admin" && (
              <Button color="inherit" component={Link} to="/admin">
                Admin Panel
              </Button>
            )}
          </Box>
        )}

      </Toolbar>
    </AppBar>
  );
}
