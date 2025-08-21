import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const AddSentences = () => {
  const [projects, setProjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [sentencesText, setSentencesText] = useState("");
  const [message, setMessage] = useState("");

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
    },
    select: {
      padding: "8px 12px",
      margin: "8px 0",
      width: "100%",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "white",
    },
    textarea: {
      width: "100%",
      minHeight: "150px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    button: {
      padding: "10px 15px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    message: {
      marginTop: "15px",
      padding: "10px",
      borderRadius: "4px",
    },
  };

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/admin/projects");
        console.log("Projects:", res.data);
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setMessage("Error fetching projects");
      }
    };
    fetchProjects();
  }, []);

  // Fetch chapters when project is selected
  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchChapters = async () => {
      try {
        const res = await axios.get(
          `/admin/project/${selectedProjectId}/chapters`
        );
        console.log("Chapters:", res.data);
        setChapters(res.data);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setMessage("Error fetching chapters");
      }
    };
    fetchChapters();
  }, [selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChapterId || !sentencesText.trim()) {
      setMessage("Select a chapter and enter sentences.");
      return;
    }

    // Parse the sentences with IDs
    const sentencesArray = sentencesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => {
        // Split on first tab or multiple spaces
        const [sentence_id, ...textParts] = line.split(/\t|\s\s+/);
        const text = textParts.join(" ").trim();

        return {
          sentence_id: sentence_id.trim(),
          text: text,
        };
      });

    try {
      await axios.post(`/admin/chapter/${selectedChapterId}/sentence`, {
        sentences: sentencesArray,
      });
      setMessage(`${sentencesArray.length} sentences uploaded successfully`);
      setSentencesText("");
    } catch (err) {
      console.error("Error uploading sentences:", err);
      setMessage("Error uploading sentences");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Sentences to Chapter</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Project:</label>
          <select
            style={styles.select}
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedChapterId("");
            }}
            required
          >
            <option value="">Select Project</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title} - {proj.description}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Chapter:</label>
          <select
            style={styles.select}
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            required
            disabled={!chapters.length}
          >
            <option value="">Select Chapter</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sentences (one per line):</label>
          <textarea
            style={styles.textarea}
            placeholder={`Enter one sentence per line with ID prefix:\nGeo_nios_3ch_0002\tभूकम्प और ज्वालामुखी...\nGeo_nios_3ch_0003\tभूपृष्ठ की...`}
            rows={8}
            value={sentencesText}
            onChange={(e) => setSentencesText(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          Upload Sentences
        </button>
      </form>

      {message && (
        <div
          style={{
            ...styles.message,
            backgroundColor: message.includes("Error") ? "#ffebee" : "#e8f5e9",
            color: message.includes("Error") ? "#c62828" : "#2e7d32",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AddSentences;
