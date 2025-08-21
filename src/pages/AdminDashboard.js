import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const AdminDashboard = () => {
  // Styles
  const styles = {
    container: {
      padding: "40px 20px",
      maxWidth: "800px",
      margin: "0 auto",
      textAlign: "center",
    },
    header: {
      marginBottom: "40px",
    },
    title: {
      fontSize: "2.5rem",
      color: "#333",
      marginBottom: "20px",
    },
    navGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginTop: "30px",
    },
    navCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "25px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      },
    },
    navTitle: {
      fontSize: "1.5rem",
      marginBottom: "10px",
      color: "#2c3e50",
    },
    navDescription: {
      color: "#7f8c8d",
      marginBottom: "15px",
    },
    navLink: {
      display: "inline-block",
      padding: "10px 20px",
      backgroundColor: "#3498db",
      color: "white",
      textDecoration: "none",
      borderRadius: "4px",
      transition: "background-color 0.3s",
      "&:hover": {
        backgroundColor: "#2980b9",
      },
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Navbar />
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p>Manage all content and assignments from here</p>
      </div>

      <div style={styles.navGrid}>
        {/* Projects Card */}
        <div style={styles.navCard}>
          <h3 style={styles.navTitle}>Projects</h3>
          <p style={styles.navDescription}>Create and manage all projects</p>
          <Link to="/admin/projects" style={styles.navLink}>
            Go to Projects
          </Link>
        </div>

        {/* Users Card */}
        <div style={styles.navCard}>
          <h3 style={styles.navTitle}>Users</h3>
          <p style={styles.navDescription}>Manage annotators and reviewers</p>
          <Link to="/admin/users" style={styles.navLink}>
            Manage Users
          </Link>
        </div>

        {/* Assignments Card */}
        <div style={styles.navCard}>
          <h3 style={styles.navTitle}>Assignments</h3>
          <p style={styles.navDescription}>View and manage all assignments</p>
          <Link to="/admin/assignments" style={styles.navLink}>
            View Assignments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
