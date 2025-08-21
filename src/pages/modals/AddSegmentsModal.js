import { useState } from "react";
import axios from "../../api/axiosInstance";

const AddSegmentsModal = ({ projectId, chapterId, onClose, onSuccess }) => {
  const [segmentsText, setSegmentsText] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadOption, setUploadOption] = useState("manual");
  const [fileData, setFileData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split("\n").filter((line) => line.trim());

      // Process each line as tab-separated values
      const formattedData = lines
        .map((line) => {
          const parts = line.split("\t").map((part) => part.trim());
          if (parts.length >= 4) {
            return {
              segment_id: parts[0],
              text: parts[1],
              wxtext: parts[2],
              englishtext: parts[3],
            };
          }
          return null;
        })
        .filter(Boolean);

      setFileData(formattedData);
      setMessage(
        `File parsed successfully with ${formattedData.length} segments`
      );
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let segmentsArray = [];

      if (uploadOption === "manual") {
        if (!segmentsText.trim()) {
          throw new Error("Please enter segments.");
        }
        segmentsArray = segmentsText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .map((line) => {
            const parts = line.split("\t").map((part) => part.trim());
            return {
              segment_id: parts[0] || "",
              text: parts[1] || "",
              wxtext: parts[2] || "",
              englishtext: parts[3] || "",
            };
          });
      } else {
        if (!fileData || fileData.length === 0) {
          throw new Error("Please upload a file first.");
        }
        segmentsArray = fileData;
      }

      if (segmentsArray.length === 0) {
        throw new Error("No valid segments found.");
      }

      // Group segments by their base sentence ID (extracted from segment_id)
      const segmentsBySentence = segmentsArray.reduce((acc, segment) => {
        // Extract base sentence ID (e.g., Geo_nios_3ch_0002 from Geo_nios_3ch_0002a)
        const baseId = segment.segment_id.replace(/[a-z]$/i, "");
        if (!acc[baseId]) {
          acc[baseId] = [];
        }
        acc[baseId].push(segment);
        return acc;
      }, {});

      // For each sentence, find or create it and add its segments
      for (const [sentenceId, segments] of Object.entries(segmentsBySentence)) {
        try {
          // First, try to find the sentence by its ID
          const sentencesRes = await axios.get(
            `/admin/chapter/${chapterId}/sentences`
          );
          const existingSentence = sentencesRes.data.find(
            (s) => s.sentence_id === sentenceId || s.id === sentenceId
          );

          let sentenceToUse = existingSentence;

          // If sentence doesn't exist, create it using just the base ID
          if (!existingSentence) {
            const createRes = await axios.post(
              `/admin/chapter/${chapterId}/sentence`,
              {
                sentences: [
                  {
                    text: segments[0].text, // Use first segment's text as sentence text
                    sentence_id: sentenceId, // Only the base ID portion
                  },
                ],
              }
            );
            sentenceToUse = createRes.data.sentences[0];
          }

          // Now add all segments for this sentence
          await axios.post(`/admin/sentence/${sentenceToUse.id}/segment`, {
            segments: segments.map((seg) => ({
              segment_id: seg.segment_id,
              text: seg.text,
              wxtext: seg.wxtext,
              englishtext: seg.englishtext,
            })),
          });
        } catch (err) {
          console.error(`Error processing segments for ${sentenceId}:`, err);
          throw new Error(`Failed to process segments for ${sentenceId}`);
        }
      }

      onSuccess();
      setMessage(`${segmentsArray.length} segments added successfully`);
      setSegmentsText("");
      setFileData(null);
    } catch (err) {
      console.error("Error adding segments:", err);
      setMessage(
        err.response?.data?.msg || err.message || "Error adding segments"
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
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <h2>Bulk Add Segments</h2>

        <div style={{ marginBottom: "15px" }}>
          <p>
            <strong>Project:</strong> {projectId}
          </p>
          <p>
            <strong>Chapter:</strong> {chapterId}
          </p>
          <p style={{ color: "#666", fontSize: "0.9em" }}>
            Segments will be automatically matched to sentences based on their
            IDs. New sentences will be created if needed.
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
              Segments (tab-separated values, one per line):
            </label>
            <textarea
              style={{
                width: "100%",
                minHeight: "300px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
              placeholder={`segment_id\ttext\twxtext\tenglishtext\nGeo_nios_3ch_0002\tभूकम्प और ज्वालामुखी कुछ संकरी पार्टियों के सहारे केन्द्रित हैं।\tBUkampa Ora jvAlAmuKI kuCa saMkarI pArtiyoM ke sahAre kenxriwa hEM.\tEarthquakes and volcanoes are concentrated along a few narrow belts.`}
              value={segmentsText}
              onChange={(e) => setSegmentsText(e.target.value)}
            />
            <small>
              Format: segment_id (e.g., Geo_nios_3ch_0002), text, wxtext,
              englishtext - separated by tabs
            </small>
          </div>
        ) : (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Upload TSV File:
            </label>
            <input
              type="file"
              accept=".tsv,.txt"
              onChange={handleFileUpload}
              style={{ marginBottom: "10px" }}
            />
            <small>
              File should contain tab-separated columns: segment_id, text,
              wxtext, englishtext
              <br />
              Example line:
              Geo_nios_3ch_0002\tभूकम्प...\tBUkampa...\tEarthquakes...
            </small>
            {fileData && (
              <div style={{ marginTop: "10px" }}>
                <p>Preview (first 3 segments):</p>
                <pre
                  style={{
                    maxHeight: "150px",
                    overflow: "auto",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  {fileData
                    .slice(0, 3)
                    .map(
                      (seg) =>
                        `${seg.segment_id}\t${seg.text}\t${seg.wxtext}\t${seg.englishtext}`
                    )
                    .join("\n")}
                </pre>
                <p>Total segments: {fileData.length}</p>
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
            {isLoading ? "Processing..." : "Add Segments"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSegmentsModal;
