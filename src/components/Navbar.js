// src/components/Navbar.js
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        backgroundColor: "#2c3e50",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link
          to="/admin"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginRight: "30px",
          }}
        >
          Admin Panel
        </Link>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            to="/admin/projects"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              ":hover": {
                backgroundColor: "#34495e",
              },
            }}
          >
            Projects
          </Link>
          <Link
            to="/admin/users"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              ":hover": {
                backgroundColor: "#34495e",
              },
            }}
          >
            Users
          </Link>
          <Link
            to="/admin/assignments"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              ":hover": {
                backgroundColor: "#34495e",
              },
            }}
          >
            Assignments
          </Link>
        </div>
      </div>
      <div>
        <Link
          to="/logout"
          style={{
            color: "white",
            textDecoration: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            backgroundColor: "#e74c3c",
            transition: "background-color 0.3s",
            ":hover": {
              backgroundColor: "#c0392b",
            },
          }}
        >
          Logout
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
