import { useState } from "react";
import axios from "../../api/axiosInstance";
import Papa from "papaparse";

const AddSentencesModal = ({ projectId, chapterId, onClose, onSuccess }) => {
  const [sentencesText, setSentencesText] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadOption, setUploadOption] = useState("manual"); // 'manual' or 'file'
  const [fileData, setFileData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data;
        if (data.length > 0) {
          // Manually transform the data into the correct format
          const formattedData = data
            .map((row) => {
              // Handle both array format (when header: false) and object format
              const rowData = Array.isArray(row) ? row[0] : row;
              if (typeof rowData === "string") {
                // Split by tab or multiple spaces
                const parts = rowData.split(/\t|\s\s+/);
                if (parts.length >= 2) {
                  return {
                    sentence_id: parts[0].trim(),
                    text: parts.slice(1).join(" ").trim(),
                  };
                }
              }
              return null;
            })
            .filter(Boolean);

          setFileData(formattedData);
          setMessage(
            `File parsed successfully with ${formattedData.length} sentences`
          );
        }
      },
      header: false, // Don't expect headers
      skipEmptyLines: true,
      delimiter: "\t", // Explicitly specify tab as delimiter
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let sentencesArray = [];

      if (uploadOption === "manual") {
        if (!sentencesText.trim()) {
          throw new Error("Please enter sentences.");
        }
        sentencesArray = sentencesText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .map((line) => {
            const [sentence_id, ...textParts] = line.split(/\t|\s\s+/);
            return {
              sentence_id: sentence_id.trim(),
              text: textParts.join(" ").trim(),
            };
          });
      } else {
        if (!fileData || fileData.length === 0) {
          throw new Error("Please upload a file first.");
        }
        sentencesArray = fileData
          .map((row) => ({
            sentence_id: row.sentence_id || row.id || "",
            text: row.text || "",
          }))
          .filter((s) => s.text.trim());
      }

      if (sentencesArray.length === 0) {
        throw new Error("No valid sentences found.");
      }

      await axios.post(`/admin/chapter/${chapterId}/sentence`, {
        sentences: sentencesArray,
      });

      onSuccess();
      setMessage(`${sentencesArray.length} sentences added successfully`);
      setSentencesText("");
      setFileData(null);
    } catch (err) {
      console.error("Error adding sentences:", err);
      setMessage(
        err.response?.data?.msg || err.message || "Error adding sentences"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h2>Add Sentences to Chapter</h2>

        <div style={{ marginBottom: "15px" }}>
          <p>
            <strong>Project:</strong> {projectId}
          </p>
          <p>
            <strong>Chapter:</strong> {chapterId}
          </p>
        </div>

        <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
          <button
            onClick={() => setUploadOption("manual")}
            style={{
              padding: "8px 16px",
              backgroundColor:
                uploadOption === "manual" ? "#4CAF50" : "#f0f0f0",
              color: uploadOption === "manual" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setUploadOption("file")}
            style={{
              padding: "8px 16px",
              backgroundColor: uploadOption === "file" ? "#4CAF50" : "#f0f0f0",
              color: uploadOption === "file" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            File Upload
          </button>
        </div>

        {uploadOption === "manual" ? (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Sentences (one per line with ID prefix):
            </label>
            <textarea
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              placeholder={`Geo_nios_3ch_0002\tभूकम्प और ज्वालामुखी...\nGeo_nios_3ch_0003\tभूपृष्ठ की...`}
              value={sentencesText}
              onChange={(e) => setSentencesText(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Upload CSV/TSV File:
            </label>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              style={{ marginBottom: "10px" }}
            />
            <small>
              File should contain columns: <code>sentence_id</code> and{" "}
              <code>text</code>
              <br />
              Supported formats: CSV, TSV, or plain text with tab separation
            </small>
            {fileData && (
              <div style={{ marginTop: "10px" }}>
                <p>Preview (first 3 sentences):</p>
                <pre
                  style={{
                    maxHeight: "100px",
                    overflow: "auto",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  {JSON.stringify(fileData.slice(0, 3), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {message && (
          <div
            style={{
              margin: "10px 0",
              padding: "10px",
              backgroundColor: message.includes("Error")
                ? "#ffebee"
                : "#e8f5e9",
              color: message.includes("Error") ? "#c62828" : "#2e7d32",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f0f0f0",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isLoading ? "Adding..." : "Add Sentences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSentencesModal;
