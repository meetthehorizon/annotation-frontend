import { useState } from "react";
import axios from "../../api/axiosInstance";

const AddUSRsModal = ({ projectId, chapterId, onClose, onSuccess }) => {
  const [usrText, setUsrText] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadOption, setUploadOption] = useState("manual");
  const [fileData, setFileData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileData(content);
      setMessage("File loaded successfully");
    };
    reader.readAsText(file);
  };

  const extractSegmentId = (usrText) => {
    // Extract segment_id from the USR text (e.g., <segment_id=Geo_nios_3ch_003>)
    const segmentIdMatch = usrText.match(/<segment_id=([^>]+)>/);
    return segmentIdMatch ? segmentIdMatch[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let usrContent = uploadOption === "manual" ? usrText : fileData;
      if (!usrContent) {
        throw new Error("Please enter or upload USR data.");
      }

      // Split the content into individual USRs
      const usrBlocks = usrContent
        .split(/<\/segment_id>/)
        .map((block) => block.trim())
        .filter((block) => block.length > 0)
        .map((block) => block + "</segment_id>");

      if (usrBlocks.length === 0) {
        throw new Error("No valid USRs found.");
      }

      // First get all segments once
      const segmentsRes = await axios.get(
        `/admin/chapter/${chapterId}/segments`
      );
      console.log("Available segments:", segmentsRes.data);

      // Process each USR block
      for (const block of usrBlocks) {
        const segmentId = extractSegmentId(block);
        if (!segmentId) {
          console.warn(
            "Skipping USR with no segment_id:",
            block.substring(0, 50) + "..."
          );
          continue;
        }

        // Find exact match
        const segment = segmentsRes.data.find(
          (s) => s.segment_id?.trim() === segmentId.trim()
        );

        if (!segment) {
          console.warn(`Segment not found: ${segmentId}`);
          continue;
        }

        // Create the USR
        await axios.post(`/admin/usr/${segment.id}`, {
          raw_text: block,
          raw_format: true,
        });
      }

      onSuccess();
      setMessage(`${usrBlocks.length} USRs processed successfully`);
    } catch (err) {
      console.error("Error adding USRs:", err);
      setMessage(err.response?.data?.msg || err.message || "Error adding USRs");
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
        <h2>Bulk Add USRs</h2>

        <div style={{ marginBottom: "15px" }}>
          <p>
            <strong>Project:</strong> {projectId}
          </p>
          <p>
            <strong>Chapter:</strong> {chapterId}
          </p>
          <p style={{ color: "#666", fontSize: "0.9em" }}>
            USRs will be automatically matched to segments based on their
            segment_id tags.
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
              USRs (custom format, one per segment):
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
              placeholder={`<segment_id=Geo_nios_3ch_003>
#वह घर जाता है
वह\t1\tpronoun\t3sg\t1:subj\t-\t-\t-\t-
घर\t2\tnoun\tmasc\t2:obj\t-\t-\t-\t-
जाता\t3\tverb\tmasc\t3:root\t-\t-\t-\t-
है\t4\taux\tpres\t3:aux\t-\t-\t-\t-
</segment_id>`}
              value={usrText}
              onChange={(e) => setUsrText(e.target.value)}
            />
            <small>
              Each USR should start with{" "}
              <code>&lt;segment_id=SEGMENT_ID&gt;</code> and end with{" "}
              <code>&lt;/segment_id&gt;</code>
            </small>
          </div>
        ) : (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Upload USR File:
            </label>
            <input
              type="file"
              accept=".txt,.usr"
              onChange={handleFileUpload}
              style={{ marginBottom: "10px" }}
            />
            <small>
              File should contain one or more USRs in the custom format, each
              with a segment_id tag
            </small>
            {fileData && (
              <div style={{ marginTop: "10px" }}>
                <p>Preview:</p>
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
                  {fileData.length > 300
                    ? `${fileData.substring(0, 300)}...`
                    : fileData}
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
            {isLoading ? "Processing..." : "Add USRs"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUSRsModal;
