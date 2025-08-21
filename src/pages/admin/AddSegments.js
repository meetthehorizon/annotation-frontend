import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import Papa from "papaparse"; // For CSV parsing

const AddSegments = () => {
  const [projects, setProjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedSentenceIds, setSelectedSentenceIds] = useState([]);
  const [sentenceSegments, setSentenceSegments] = useState({});
  const [uploadOption, setUploadOption] = useState("manual"); // 'manual' or 'file'
  const [csvData, setCsvData] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Basic styling
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto",
    },
    formGroup: {
      marginBottom: "15px",
    },
    select: {
      padding: "8px 12px",
      margin: "8px 0",
      width: "100%",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    selectMultiple: {
      height: "150px",
      padding: "8px 12px",
      margin: "8px 0",
      width: "100%",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    textarea: {
      width: "100%",
      minHeight: "100px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginBottom: "10px",
    },
    button: {
      padding: "10px 15px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "10px",
      marginBottom: "10px",
    },
    buttonSecondary: {
      backgroundColor: "#f0f0f0",
      color: "#333",
    },
    uploadSection: {
      margin: "20px 0",
      padding: "15px",
      border: "1px solid #eee",
      borderRadius: "4px",
    },
    sentenceItem: {
      marginBottom: "15px",
      padding: "10px",
      border: "1px solid #eee",
      borderRadius: "4px",
    },
  };

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/admin/projects");
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
    if (!selectedProjectId) {
      setChapters([]);
      setSentences([]);
      return;
    }

    const fetchChapters = async () => {
      try {
        const res = await axios.get(
          `/admin/project/${selectedProjectId}/chapters`
        );
        setChapters(res.data);
        setSelectedChapterId("");
        setSentences([]);
        setSelectedSentenceIds([]);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setMessage("Error fetching chapters");
      }
    };
    fetchChapters();
  }, [selectedProjectId]);

  // Fetch sentences when chapter is selected
  useEffect(() => {
    if (!selectedChapterId) {
      setSentences([]);
      setSelectedSentenceIds([]);
      return;
    }

    const fetchSentences = async () => {
      try {
        const res = await axios.get(
          `/admin/chapter/${selectedChapterId}/sentences`
        );
        setSentences(res.data);
        setSelectedSentenceIds([]);
      } catch (err) {
        console.error("Error fetching sentences:", err);
        setMessage("Error fetching sentences");
      }
    };
    fetchSentences();
  }, [selectedChapterId]);

  // Handle file upload and parse CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data;
        if (data.length > 0) {
          setCsvData(JSON.stringify(data, null, 2));
          setMessage(`CSV parsed successfully with ${data.length} rows`);
        }
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  // Handle manual segments input for each sentence
  const handleSegmentsInput = (sentenceId, text) => {
    setSentenceSegments((prev) => ({
      ...prev,
      [sentenceId]: text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s)
        .map((text) => ({ text })), // Format for backend
    }));
  };

  // Submit all segments
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (uploadOption === "manual") {
        // Manual upload
        if (selectedSentenceIds.length === 0) {
          throw new Error("Please select at least one sentence");
        }

        let successCount = 0;
        for (const sentenceId of selectedSentenceIds) {
          if (sentenceSegments[sentenceId]?.length) {
            await axios.post(`/admin/sentence/${sentenceId}/segment`, {
              segments: sentenceSegments[sentenceId],
            });
            successCount++;
          }
        }
        setMessage(
          `Successfully uploaded segments to ${successCount} sentences`
        );
      } else {
        // File upload (would need backend support for bulk CSV processing)
        // This is just a placeholder - you'd need to implement the CSV processing logic
        setMessage("File upload processing would be implemented here");
      }
    } catch (err) {
      console.error("Error uploading segments:", err);
      setMessage(
        err.response?.data?.msg || err.message || "Error uploading segments"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Bulk Upload Segments</h2>

      <div style={styles.formGroup}>
        <button
          style={{
            ...styles.button,
            ...(uploadOption === "manual" ? {} : styles.buttonSecondary),
          }}
          onClick={() => setUploadOption("manual")}
        >
          Manual Entry
        </button>
        <button
          style={{
            ...styles.button,
            ...(uploadOption === "file" ? {} : styles.buttonSecondary),
          }}
          onClick={() => setUploadOption("file")}
        >
          File Upload
        </button>
      </div>

      {uploadOption === "manual" ? (
        <>
          <div style={styles.formGroup}>
            <select
              style={styles.select}
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedChapterId("");
                setSelectedSentenceIds([]);
              }}
              required
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <select
              style={styles.select}
              value={selectedChapterId}
              onChange={(e) => {
                setSelectedChapterId(e.target.value);
                setSelectedSentenceIds([]);
              }}
              required
              disabled={!selectedProjectId}
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
            <select
              style={styles.selectMultiple}
              multiple
              value={selectedSentenceIds}
              onChange={(e) => {
                const options = e.target.options;
                const selected = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) {
                    selected.push(options[i].value);
                  }
                }
                setSelectedSentenceIds(selected);
              }}
              required
              disabled={!selectedChapterId}
            >
              {sentences.map((sent) => (
                <option key={sent.id} value={sent.id}>
                  {sent.sentence_id || sent.id}:{" "}
                  {sent.text.length > 50
                    ? `${sent.text.substring(0, 50)}...`
                    : sent.text}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple sentences</small>
          </div>

          {selectedSentenceIds.length > 0 && (
            <div style={styles.uploadSection}>
              <h3>Enter Segments for Selected Sentences</h3>
              {selectedSentenceIds.map((sentenceId) => {
                const sentence = sentences.find((s) => s.id === sentenceId);
                return (
                  <div key={sentenceId} style={styles.sentenceItem}>
                    <h4>Sentence: {sentence?.text}</h4>
                    <textarea
                      style={styles.textarea}
                      placeholder={`Enter segments for this sentence (one per line)`}
                      value={
                        sentenceSegments[sentenceId]
                          ?.map((s) => s.text)
                          .join("\n") || ""
                      }
                      onChange={(e) =>
                        handleSegmentsInput(sentenceId, e.target.value)
                      }
                    />
                    <small>
                      {sentenceSegments[sentenceId]?.length || 0} segments
                      prepared
                    </small>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={styles.uploadSection}>
          <h3>Upload CSV File</h3>
          <div style={styles.formGroup}>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />
            <small>
              CSV format: sentence_id,segment_text,wxtext,englishtext
            </small>
          </div>
          {csvData && (
            <div>
              <h4>Preview:</h4>
              <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                {csvData}
              </pre>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        style={styles.button}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Upload Segments"}
      </button>

      {message && (
        <p
          style={{
            color: message.includes("Error") ? "red" : "green",
            marginTop: "10px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddSegments;
