// src/pages/admin/ProjectsPage.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Navbar from "../../components/Navbar";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CSS Styles
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      paddingBottom: "15px",
      borderBottom: "1px solid #eaeaea"
    },
    title: {
      color: "#333",
      margin: 0
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px"
    },
    card: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "relative",
      transition: "transform 0.2s, box-shadow 0.2s",
      backgroundColor: "white",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }
    },
    deleteBtn: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "none",
      border: "none",
      color: "#dc3545",
      cursor: "pointer",
      fontSize: "1.2rem",
      fontWeight: "bold",
      "&:hover": {
        color: "#a71d2a"
      }
    },
    btnPrimary: {
      display: "inline-block",
      padding: "10px 20px",
      backgroundColor: "#007bff",
      color: "white",
      borderRadius: "4px",
      textDecoration: "none",
      fontWeight: "500",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#0069d9"
      }
    },
    btnSecondary: {
      display: "inline-block",
      padding: "8px 16px",
      backgroundColor: "#6c757d",
      color: "white",
      borderRadius: "4px",
      textDecoration: "none",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#5a6268"
      }
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "1.2rem",
      color: "#666"
    },
    error: {
      color: "#dc3545",
      padding: "20px",
      backgroundColor: "#f8d7da",
      border: "1px solid #f5c6cb",
      borderRadius: "4px",
      margin: "20px 0"
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/admin/projects");
      setProjects(res.data);
    } catch (err) {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (projectId) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this project and all its contents?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`/admin/project/${projectId}`);
              setProjects(projects.filter(p => p.id !== projectId));
            } catch (err) {
              setError("Failed to delete project");
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  if (loading) return <div style={styles.loading}>Loading projects...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.header}>
        <h1 style={styles.title}>Projects</h1>
        <Link to="/admin/projects/new" style={styles.btnPrimary}>
          Add New Project
        </Link>
      </div>

      <div style={styles.grid}>
        {projects.map(project => (
          <div key={project.id} style={styles.card}>
            <button 
              onClick={() => handleDeleteProject(project.id)}
              style={styles.deleteBtn}
              title="Delete project"
            >
              ×
            </button>
            <h3 style={{ marginTop: "0", color: "#444" }}>{project.title}</h3>
            <p style={{ color: "#666", margin: "10px 0" }}>{project.description || "No description"}</p>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>{project.chapter_count || 0} chapters</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <Link 
                to={`/admin/projects/${project.id}/chapters`} 
                style={styles.btnSecondary}
              >
                View Chapters
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;