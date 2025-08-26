import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    color: "#343a40",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "1rem",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  message: {
    marginTop: "1rem",
    padding: "0.75rem",
    borderRadius: "4px",
  },
  success: {
    color: "#155724",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
  },
  error: {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
  },
  backButton: {
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    color: '#007bff',
    fontSize: '1rem',
    fontWeight: '500',
    textDecoration: 'underline'
  }
};

const AddProject = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admin/project", {
        title,
        description: description || null,
      });
      setMessage("Project created successfully");
      setTitle("");
      setDescription("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating project");
    }
  };
  
  const handleBack = () => {
    navigate(-1); // takes user to previous page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="text"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          style={styles.textarea}
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" style={styles.button}>
          Add Project
        </button>
      </form>
      {message && (
        <p
          style={{
            ...styles.message,
            ...(message.includes("Error") ? styles.error : styles.success),
          }}
        >
          {message}
        </p>
      )}

      {/* Back option with arrow */}
      <div style={styles.backButton} onClick={handleBack}>
        ← Back
      </div>
    </div>
  );
};

export default AddProject;
