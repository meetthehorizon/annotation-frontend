import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import Papa from "papaparse";

const AddUSRs = () => {
  const [projects, setProjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedSentenceId, setSelectedSentenceId] = useState("");
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);
  const [segmentUSRs, setSegmentUSRs] = useState({});
  const [uploadOption, setUploadOption] = useState("manual");
  const [csvData, setCsvData] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Styling
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1000px",
      margin: "0 auto",
    },
    formGroup: {
      marginBottom: "15px",
    },
    select: {
      padding: "10px",
      margin: "8px 0",
      width: "100%",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: "#fff",
    },
    selectMultiple: {
      height: "150px",
      padding: "10px",
      margin: "8px 0",
      width: "100%",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: "#fff",
    },
    textarea: {
      width: "100%",
      minHeight: "150px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "16px",
      fontFamily: "monospace",
      whiteSpace: "pre",
    },
    button: {
      padding: "12px 20px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
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
    segmentItem: {
      marginBottom: "15px",
      padding: "15px",
      border: "1px solid #eee",
      borderRadius: "4px",
      backgroundColor: "#f9f9f9",
    },
    message: {
      marginTop: "15px",
      padding: "10px",
      borderRadius: "4px",
      backgroundColor: "#f8f8f8",
    },
    formatExample: {
      backgroundColor: "#f5f5f5",
      padding: "10px",
      borderRadius: "4px",
      margin: "10px 0",
      fontSize: "14px",
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
    },
  };

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/admin/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setMessage("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, []);

  // Fetch chapters when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setChapters([]);
      setSentences([]);
      setSegments([]);
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
        setSegments([]);
        setSelectedSegmentIds([]);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setMessage("Failed to fetch chapters");
      }
    };
    fetchChapters();
  }, [selectedProjectId]);

  // Fetch sentences when chapter changes
  useEffect(() => {
    if (!selectedChapterId) {
      setSentences([]);
      setSegments([]);
      setSelectedSegmentIds([]);
      return;
    }

    const fetchSentences = async () => {
      try {
        const res = await axios.get(
          `/admin/chapter/${selectedChapterId}/sentences`
        );
        setSentences(res.data);
        setSelectedSentenceId("");
        setSegments([]);
        setSelectedSegmentIds([]);
      } catch (err) {
        console.error("Error fetching sentences:", err);
        setMessage("Failed to fetch sentences");
      }
    };
    fetchSentences();
  }, [selectedChapterId]);

  // Fetch segments when sentence changes
  useEffect(() => {
    if (!selectedSentenceId) {
      setSegments([]);
      setSelectedSegmentIds([]);
      return;
    }

    const fetchSegments = async () => {
      try {
        const res = await axios.get(
          `/admin/sentence/${selectedSentenceId}/segments`
        );
        setSegments(res.data);
        setSelectedSegmentIds([]);
      } catch (err) {
        console.error("Error fetching segments:", err);
        setMessage("Failed to fetch segments");
      }
    };
    fetchSegments();
  }, [selectedSentenceId]);

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

  // Parse custom USR format into individual USR objects
  const parseCustomUSRFormat = (text) => {
    const lines = text.split("\n");
    const usrs = [];
    let currentUSR = null;

    lines.forEach((line) => {
      line = line.trim();
      if (line.startsWith("<sent_id=")) {
        // Start new USR
        if (currentUSR) {
          usrs.push(currentUSR);
        }
        currentUSR = {
          raw_text: line + "\n",
          raw_format: true,
          sentence_type: "declarative", // default
        };
      } else if (line.startsWith("</sent_id>")) {
        if (currentUSR) {
          currentUSR.raw_text += line + "\n";
          usrs.push(currentUSR);
          currentUSR = null;
        }
      } else if (currentUSR) {
        currentUSR.raw_text += line + "\n";

        // Handle special markers
        if (line.startsWith("%")) {
          const marker = line.substring(1).toLowerCase();
          if (marker === "interrogative") {
            currentUSR.sentence_type = "interrogative";
          } else if (marker === "affirmative" || marker === "negative") {
            currentUSR.sentence_type_info = { scope: marker };
          }
        }
      }
    });

    if (currentUSR) {
      usrs.push(currentUSR);
    }

    return usrs;
  };

  // Handle USRs input for each segment
  const handleUSRsInput = (segmentId, text) => {
    try {
      let usrs;
      if (text.includes("<sent_id=")) {
        // Custom format detected
        usrs = parseCustomUSRFormat(text);
      } else {
        // Standard JSON format
        usrs = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (err) {
              console.error("Error parsing JSON line:", line);
              return null;
            }
          })
          .filter((usr) => usr !== null);
      }

      setSegmentUSRs((prev) => ({
        ...prev,
        [segmentId]: usrs,
      }));
    } catch (err) {
      console.error("Error parsing USRs:", err);
      setMessage(`Error parsing USRs for segment ${segmentId}: ${err.message}`);
    }
  };

  // Submit all USRs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (uploadOption === "manual") {
        // Manual upload
        if (selectedSegmentIds.length === 0) {
          throw new Error("Please select at least one segment");
        }

        let successCount = 0;
        let errorCount = 0;

        for (const segmentId of selectedSegmentIds) {
          if (segmentUSRs[segmentId]?.length) {
            for (const usr of segmentUSRs[segmentId]) {
              try {
                // For custom format, we need to send raw_text and raw_format flag
                const payload = usr.raw_text
                  ? { raw_text: usr.raw_text, raw_format: true }
                  : { ...usr };

                await axios.post(`/admin/usr/${segmentId}`, payload);
                successCount++;
              } catch (err) {
                console.error(
                  `Error uploading USR for segment ${segmentId}:`,
                  err
                );
                errorCount++;
              }
            }
          }
        }

        setMessage(
          `Successfully uploaded ${successCount} USRs. ${
            errorCount > 0 ? `${errorCount} failed.` : ""
          }`
        );
      } else {
        // File upload
        if (!csvData) {
          throw new Error("Please upload a CSV file first");
        }
        const parsedData = JSON.parse(csvData);
        let successCount = 0;
        let errorCount = 0;

        for (const row of parsedData) {
          if (row.segment_id && row.usr_data) {
            try {
              const usrData = JSON.parse(row.usr_data);
              await axios.post(`/admin/usr/${row.segment_id}`, usrData);
              successCount++;
            } catch (err) {
              console.error(
                `Error processing row for segment ${row.segment_id}:`,
                err
              );
              errorCount++;
            }
          }
        }

        setMessage(
          `Processed CSV: ${successCount} USRs uploaded successfully. ${
            errorCount > 0 ? `${errorCount} failed.` : ""
          }`
        );
      }
    } catch (err) {
      console.error("Error uploading USRs:", err);
      setMessage(
        err.response?.data?.msg || err.message || "Failed to upload USRs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Example USR data for the UI
  const customFormatExample = `<sent_id=Geo_nios_3ch_0002>
#भूकम्प और ज्वालामुखी कुछ संकरी पट्टियों के सहारे केन्द्रित हैं ।
BUkampa_1\t1\t-\t-\t-\t-\t-\t-\t9:op1
jvAlAmuKI_1\t2\t-\t-\t-\t-\t-\t-\t9:op2
kuCa_1\t3\t-\t-\t5:quant\t-\t-\t-\t-
saMkarI_1\t4\t-\t-\t5:mod\t-\t-\t-\t-
pattI_1\t5\t-\tpl\t8:rask1\t-\t-\t-\t-
kenxriwa_1\t7\t-\t-\t8:k1s\t-\t-\t-\t-
hE_1-pres\t8\t-\t-\t0:main\t-\t-\t-\t-
[conj_1]\t9\t-\t-\t8:k1\t-\t-\t-\t-
%affirmative
</sent_id>`;

  const jsonFormatExample = JSON.stringify(
    {
      sentence_type: "declarative",
      lexical_info: [
        {
          concept: "BUkampa_1",
          index: 1,
          semantic_category: "event",
          morpho_semantic: "noun",
          speakers_view: "neutral",
        },
      ],
      dependency_info: [
        {
          concept: "BUkampa_1",
          index: 1,
          head_index: 9,
          relation: "op1",
        },
      ],
      sentence_type_info: {
        scope: "affirmative",
      },
    },
    null,
    2
  );

  return (
    <div style={styles.container}>
      <h2>Bulk Upload USRs</h2>

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
            <label>Project:</label>
            <select
              style={styles.select}
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedChapterId("");
                setSelectedSentenceId("");
                setSelectedSegmentIds([]);
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
            <label>Chapter:</label>
            <select
              style={styles.select}
              value={selectedChapterId}
              onChange={(e) => {
                setSelectedChapterId(e.target.value);
                setSelectedSentenceId("");
                setSelectedSegmentIds([]);
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
            <label>Sentence:</label>
            <select
              style={styles.select}
              value={selectedSentenceId}
              onChange={(e) => {
                setSelectedSentenceId(e.target.value);
                setSelectedSegmentIds([]);
              }}
              required
              disabled={!selectedChapterId}
            >
              <option value="">Select Sentence</option>
              {sentences.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sentence_id || s.id}:{" "}
                  {s.text.length > 50
                    ? `${s.text.substring(0, 50)}...`
                    : s.text}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label>Segments (select multiple):</label>
            <select
              style={styles.selectMultiple}
              multiple
              value={selectedSegmentIds}
              onChange={(e) => {
                const options = e.target.options;
                const selected = [];
                for (let i = 0; i < options.length; i++) {
                  if (options[i].selected) {
                    selected.push(options[i].value);
                  }
                }
                setSelectedSegmentIds(selected);
              }}
              required
              disabled={!selectedSentenceId}
            >
              {segments.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.segment_id || seg.id}:{" "}
                  {seg.text.length > 50
                    ? `${seg.text.substring(0, 50)}...`
                    : seg.text}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple segments</small>
          </div>

          {selectedSegmentIds.length > 0 && (
            <div style={styles.uploadSection}>
              <h3>Enter USRs for Selected Segments</h3>
              <p>You can enter USRs in either format:</p>

              <div style={styles.formatExample}>
                <strong>Custom Format Example:</strong>
                <pre>{customFormatExample}</pre>
              </div>

              <div style={styles.formatExample}>
                <strong>JSON Format Example:</strong>
                <pre>{jsonFormatExample}</pre>
              </div>

              {selectedSegmentIds.map((segmentId) => {
                const segment = segments.find((s) => s.id === segmentId);
                return (
                  <div key={segmentId} style={styles.segmentItem}>
                    <h4>Segment: {segment?.text}</h4>
                    <textarea
                      style={styles.textarea}
                      placeholder={`Enter USRs in either format...`}
                      value={
                        segmentUSRs[segmentId]
                          ?.map(
                            (usr) =>
                              usr.raw_text || JSON.stringify(usr, null, 2)
                          )
                          .join("\n\n") || ""
                      }
                      onChange={(e) =>
                        handleUSRsInput(segmentId, e.target.value)
                      }
                    />
                    <small>
                      {segmentUSRs[segmentId]?.length || 0} USRs prepared |
                      Detected format:{" "}
                      {segmentUSRs[segmentId]?.[0]?.raw_text
                        ? "Custom"
                        : "JSON"}
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
              CSV format should include: segment_id,usr_data
              <br />
              Where usr_data is a JSON string containing the USR object
            </small>
          </div>
          {csvData && (
            <div>
              <h4>Preview:</h4>
              <pre
                style={{
                  maxHeight: "200px",
                  overflow: "auto",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                }}
              >
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
        disabled={
          isLoading ||
          (uploadOption === "manual" && selectedSegmentIds.length === 0)
        }
      >
        {isLoading ? "Uploading..." : "Upload USRs"}
      </button>

      {message && (
        <div
          style={{
            ...styles.message,
            color:
              message.includes("Failed") ||
              message.includes("Error") ||
              message.includes("failed")
                ? "#d32f2f"
                : "#2e7d32",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AddUSRs;
