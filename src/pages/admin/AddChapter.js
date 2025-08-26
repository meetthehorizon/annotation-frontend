import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { useParams ,useNavigate } from "react-router-dom";

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
  listContainer: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  listHeading: {
    marginBottom: "0.75rem",
    color: "#495057",
  },
  listItem: {
    padding: "0.5rem",
    borderBottom: "1px solid #e9ecef",
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

const AddChapter = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectAndChapters = async () => {
      try {
        if (projectId) {
          const [projectRes, chaptersRes] = await Promise.all([
            axios.get(`/admin/project/${projectId}`),
            axios.get(`/admin/project/${projectId}/chapters`),
          ]);
          setProject(projectRes.data);
          setChapters(chaptersRes.data);
        }
      } catch (err) {
        setMessage("Error fetching project data");
      }
    };
    fetchProjectAndChapters();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setMessage("Project ID is missing");
      return;
    }
    try {
      await axios.post(`/admin/project/${projectId}/chapter`, {
        name: chapterName,
      });
      setMessage("Chapter added successfully");
      setChapterName("");
      const res = await axios.get(`/admin/project/${projectId}/chapters`);
      setChapters(res.data);
    } catch (err) {
      setMessage("Error adding chapter");
    }
  };
  const handleBack = () => {
    navigate(-1); // go back to previous page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        {project ? `Add Chapter to ${project.title}` : "Add Chapter to Project"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="text"
          placeholder="Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>
          Add Chapter
        </button>
      </form>

      {projectId && (
        <div style={styles.listContainer}>
          <h3 style={styles.listHeading}>Existing Chapters</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {chapters.map((chapter) => (
              <li key={chapter.id} style={styles.listItem}>
                {chapter.title}
              </li>
            ))}
          </ul>
        </div>
      )}

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

export default AddChapter;
