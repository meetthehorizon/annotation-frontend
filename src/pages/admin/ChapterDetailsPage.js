// src/pages/admin/ChapterDetailsPage.js
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";
import AddSentencesModal from "../modals/AddSentencesModal";
import { Tag } from "antd";
import AddSegmentsModal from "../modals/AddSegmentsModal";
import AddUSRsModal from "../modals/AddUSRsModal";
import Navbar from "../../components/Navbar";

const ChapterDetailsPage = () => {
  const { projectId, chapterId } = useParams();
  const [project, setProject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sentences");
  const [showAddSentencesModal, setShowAddSentencesModal] = useState(false);
  const [showAddSegmentsModal, setShowAddSegmentsModal] = useState(false);
  const [showAddUSRsModal, setShowAddUSRsModal] = useState(false);
  const [assigningUSR, setAssigningUSR] = useState(null);
  const [assigningSegment, setAssigningSegment] = useState(null);
  const [annotatorId, setAnnotatorId] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [users, setUsers] = useState([]);
  const [sectionPermissions, setSectionPermissions] = useState({
    lexical: false,
    dependency: false,
    discourse: false,
    construction: false,
  });

  // CSS Styles
  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      marginBottom: "30px",
      paddingBottom: "15px",
      borderBottom: "1px solid #eaeaea",
    },
    backLink: {
      display: "inline-block",
      marginRight: "15px",
      color: "#007bff",
      textDecoration: "none",
      marginBottom: "10px",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    title: {
      color: "#333",
      margin: "10px 0",
    },
    tabContainer: {
      borderBottom: "1px solid #ddd",
      display: "flex",
      marginBottom: "20px",
    },
    tabButton: {
      padding: "10px 20px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: "500",
      color: "#666",
      transition: "all 0.2s",
      "&:hover": {
        color: "#333",
        backgroundColor: "#f5f5f5",
      },
    },
    activeTab: {
      backgroundColor: "#f0f0f0",
      color: "#333",
      borderBottom: "2px solid #007bff",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "10px",
      borderBottom: "1px solid #eee",
    },
    btn: {
      padding: "8px 16px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "0.9rem",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#3d8b40",
      },
    },
    btnSecondary: {
      backgroundColor: "#2196F3",
      "&:hover": {
        backgroundColor: "#0b7dda",
      },
    },
    btnDanger: {
      backgroundColor: "#f44336",
      "&:hover": {
        backgroundColor: "#d32f2f",
      },
    },
    card: {
      border: "1px solid #eee",
      borderRadius: "4px",
      padding: "15px",
      marginBottom: "15px",
      backgroundColor: "white",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    sentenceCard: {
      borderBottom: "1px solid #eee",
      padding: "15px",
      "&:last-child": {
        borderBottom: "none",
      },
    },
    segmentCard: {
      padding: "15px",
      borderBottom: "1px solid #eee",
      backgroundColor: "#fafafa",
      "&:last-child": {
        borderBottom: "none",
      },
    },
    usrCard: {
      padding: "15px",
      border: "1px solid #e0e0e0",
      borderRadius: "4px",
      marginBottom: "15px",
      backgroundColor: "#f9f9f9",
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
    },
    assignmentInfo: {
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "#f5f5f5",
      borderRadius: "4px",
      fontSize: "0.85rem",
    },
    modalOverlay: {
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
    },
    modalContent: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      width: "500px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    },
    modalTitle: {
      marginTop: 0,
      color: "#333",
    },
    formGroup: {
      marginBottom: "15px",
    },
    formLabel: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "500",
    },
    formSelect: {
      width: "100%",
      padding: "8px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "0.9rem",
    },
    permissionTag: {
      padding: "8px 12px",
      backgroundColor: "#f0f0f0",
      color: "black",
      borderRadius: "4px",
      cursor: "pointer",
      border: "1px solid #ddd",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "#e0e0e0",
      },
    },
    activePermission: {
      backgroundColor: "#4CAF50",
      color: "white",
      "&:hover": {
        backgroundColor: "#3d8b40",
      },
    },
    modalActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "20px",
    },
    modalBtn: {
      padding: "8px 16px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "0.9rem",
    },
    modalBtnCancel: {
      backgroundColor: "#ccc",
      "&:hover": {
        backgroundColor: "#bbb",
      },
    },
    modalBtnConfirm: {
      backgroundColor: "#4CAF50",
      color: "white",
      "&:hover": {
        backgroundColor: "#3d8b40",
      },
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "1.2rem",
      color: "#666",
    },
    error: {
      color: "#dc3545",
      padding: "20px",
      backgroundColor: "#f8d7da",
      border: "1px solid #f5c6cb",
      borderRadius: "4px",
      margin: "20px 0",
    },
  };

  const fetchData = async () => {
    try {
      const [projectRes, chapterRes, sentencesRes, usersRes] =
        await Promise.all([
          axios.get(`/admin/project/${projectId}`),
          axios.get(`/admin/chapter/${chapterId}`),
          axios.get(`/admin/chapter/${chapterId}/sentences`),
          axios.get("/admin/users"),
        ]);

      // Get segments and USRs for each sentence
      const sentencesWithDetails = await Promise.all(
        sentencesRes.data.map(async (sentence) => {
          const segmentsRes = await axios.get(
            `/admin/sentence/${sentence.id}/segments`
          );
          const segmentsWithUSRs = await Promise.all(
            segmentsRes.data.map(async (segment) => {
              const usrsRes = await axios.get(
                `/admin/segment/${segment.id}/usrs`
              );
              const assignmentsRes = await axios.get(
                `/admin/segment_assignments/${segment.id}`
              );

              return {
                ...segment,
                usrs: usrsRes.data || [],
                assignments: assignmentsRes.data || [],
              };
            })
          );
          return {
            ...sentence,
            segments: segmentsWithUSRs,
          };
        })
      );

      setProject(projectRes.data);
      setChapter(chapterRes.data);
      setSentences(sentencesWithDetails);
      setUsers(usersRes.data);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, chapterId]);

  const handleSentencesAdded = () => {
    setShowAddSentencesModal(false);
    fetchData();
  };

  const handleSegmentsAdded = () => {
    setShowAddSegmentsModal(false);
    fetchData();
  };

  const handleUSRsAdded = () => {
    setShowAddUSRsModal(false);
    fetchData();
  };

  const formatUSRToCustomFormat = (usr, segment) => {
    let usrText = `<segment_id=${segment.segment_id || segment.id}>\n`;
    usrText += `#${segment.text}\n`;

    usr.lexical_info.forEach((lex) => {
      // Format dependency info
      const depInfo =
        usr.dependency_info
          .filter((d) => d.index === lex.index)
          .map((d) => {
            if (d.head_index === null && d.relation === "-") return "-";
            return `${d.head_index || "null"}:${d.relation}`;
          })
          .join(" ") || "-";

      // Format discourse/coref info
      const corefInfo =
        usr.discourse_coref_info
          .filter((d) => d.index === lex.index)
          .map((d) => {
            if (d.head_index === null && d.relation === "-") return "-";
            return `${d.head_index || "null"}:${d.relation}`;
          })
          .join(" ") || "-";

      // Format construction info
      const constInfo =
        usr.construction_info
          .filter((c) => c.index === lex.index)
          .map((c) => {
            if (c.cxn_index === null && c.component_type === "-") return "-";
            return `${c.cxn_index || "null"}:${c.component_type}`;
          })
          .join(" ") || "-";

      const scope = lex.scope || usr.sentence_type_info?.scope || "-";

      usrText +=
        [
          lex.concept,
          lex.index,
          lex.semantic_category || "-",
          lex.morpho_semantic || "-",
          depInfo,
          corefInfo,
          lex.speakers_view || "-",
          scope,
          constInfo,
        ].join("\t") + "\n";
    });

    if (usr.sentence_type && usr.sentence_type !== "declarative") {
      usrText += `%${usr.sentence_type}\n`;
    }

    usrText += `</segment_id>`;
    return usrText;
  };

  const handleAssignUSR = async (usrId) => {
    try {
      await axios.post("/admin/assign_usr", {
        usr_id: usrId,
        annotator_id: annotatorId,
        reviewer_id: reviewerId || null,
        can_edit_lexical: sectionPermissions.lexical,
        can_edit_dependency: sectionPermissions.dependency,
        can_edit_discourse: sectionPermissions.discourse,
        can_edit_construction: sectionPermissions.construction,
      });
      setAssigningUSR(null);
      setAnnotatorId("");
      setReviewerId("");
      setSectionPermissions({
        lexical: false,
        dependency: false,
        discourse: false,
        construction: false,
      });
      fetchData();
    } catch (err) {
      setError("Failed to assign USR");
      console.error(err);
    }
  };

  const handleAssignSegment = async (segmentId) => {
    try {
      await axios.post("/admin/assign_segment", {
        segment_id: segmentId,
        annotator_id: annotatorId,
        reviewer_id: reviewerId || null,
      });
      setAssigningSegment(null);
      setAnnotatorId("");
      setReviewerId("");
      fetchData();
    } catch (err) {
      setError("Failed to assign segment");
      console.error(err);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.name} (${user.email})` : "Unknown";
  };

  const toggleSectionPermission = (section) => {
    setSectionPermissions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!project || !chapter)
    return <div style={styles.error}>Data not found</div>;

  return (
    <div style={styles.container}>
      <Navbar />
      {/* Add Sentences Modal */}
      {showAddSentencesModal && (
        <AddSentencesModal
          projectId={projectId}
          chapterId={chapterId}
          onClose={() => setShowAddSentencesModal(false)}
          onSuccess={handleSentencesAdded}
        />
      )}

      {/* Add Segments Modal */}
      {showAddSegmentsModal && (
        <AddSegmentsModal
          projectId={projectId}
          chapterId={chapterId}
          onClose={() => setShowAddSegmentsModal(false)}
          onSuccess={handleSegmentsAdded}
        />
      )}

      {/* Add USRs Modal */}
      {showAddUSRsModal && (
        <AddUSRsModal
          projectId={projectId}
          chapterId={chapterId}
          onClose={() => setShowAddUSRsModal(false)}
          onSuccess={handleUSRsAdded}
        />
      )}

      {/* Assign USR Modal */}
      {assigningUSR && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Assign USR</h3>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Annotator:</label>
              <select
                value={annotatorId}
                onChange={(e) => setAnnotatorId(e.target.value)}
                style={styles.formSelect}
              >
                <option value="">Select Annotator</option>
                {users
                  .filter((u) => u.role === "annotator")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Reviewer (optional):</label>
              <select
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                style={styles.formSelect}
              >
                <option value="">Select Reviewer</option>
                {users
                  .filter((u) => u.role === "reviewer")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Assign Sections:</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <div
                  onClick={() => toggleSectionPermission("lexical")}
                  style={{
                    ...styles.permissionTag,
                    ...(sectionPermissions.lexical
                      ? styles.activePermission
                      : {}),
                  }}
                >
                  Lexical
                </div>
                <div
                  onClick={() => toggleSectionPermission("dependency")}
                  style={{
                    ...styles.permissionTag,
                    ...(sectionPermissions.dependency
                      ? styles.activePermission
                      : {}),
                  }}
                >
                  Dependency
                </div>
                <div
                  onClick={() => toggleSectionPermission("discourse")}
                  style={{
                    ...styles.permissionTag,
                    ...(sectionPermissions.discourse
                      ? styles.activePermission
                      : {}),
                  }}
                >
                  Discourse
                </div>
                <div
                  onClick={() => toggleSectionPermission("construction")}
                  style={{
                    ...styles.permissionTag,
                    ...(sectionPermissions.construction
                      ? styles.activePermission
                      : {}),
                  }}
                >
                  Construction
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setAssigningUSR(null);
                  setAnnotatorId("");
                  setReviewerId("");
                  setSectionPermissions({
                    lexical: false,
                    dependency: false,
                    discourse: false,
                    construction: false,
                  });
                }}
                style={{
                  ...styles.modalBtn,
                  ...styles.modalBtnCancel,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignUSR(assigningUSR)}
                disabled={
                  !annotatorId ||
                  !Object.values(sectionPermissions).some((v) => v)
                }
                style={{
                  ...styles.modalBtn,
                  ...styles.modalBtnConfirm,
                  opacity:
                    !annotatorId ||
                    !Object.values(sectionPermissions).some((v) => v)
                      ? 0.6
                      : 1,
                  cursor:
                    !annotatorId ||
                    !Object.values(sectionPermissions).some((v) => v)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Segment Modal */}
      {assigningSegment && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, width: "400px" }}>
            <h3 style={styles.modalTitle}>Assign Segment</h3>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Annotator:</label>
              <select
                value={annotatorId}
                onChange={(e) => setAnnotatorId(e.target.value)}
                style={styles.formSelect}
              >
                <option value="">Select Annotator</option>
                {users
                  .filter((u) => u.role === "annotator")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Reviewer (optional):</label>
              <select
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                style={styles.formSelect}
              >
                <option value="">Select Reviewer</option>
                {users
                  .filter((u) => u.role === "reviewer")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setAssigningSegment(null);
                  setAnnotatorId("");
                  setReviewerId("");
                }}
                style={{
                  ...styles.modalBtn,
                  ...styles.modalBtnCancel,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignSegment(assigningSegment)}
                disabled={!annotatorId}
                style={{
                  ...styles.modalBtn,
                  ...styles.modalBtnConfirm,
                  opacity: !annotatorId ? 0.6 : 1,
                  cursor: !annotatorId ? "not-allowed" : "pointer",
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <Link
          to={`/admin/projects/${projectId}/chapters`}
          style={styles.backLink}
        >
          ← Back to Chapters
        </Link>
        <h1 style={styles.title}>
          {project.title} - {chapter.title}
        </h1>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "sentences" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("sentences")}
          >
            Sentences
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "segments" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("segments")}
          >
            Segments
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "usrs" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("usrs")}
          >
            USRs
          </button>
        </div>

        {activeTab === "sentences" && (
          <div style={{ marginTop: "20px" }}>
            <div style={styles.sectionHeader}>
              <h2 style={{ margin: 0 }}>Sentences</h2>
              <button
                onClick={() => setShowAddSentencesModal(true)}
                style={styles.btn}
              >
                Add Sentences
              </button>
            </div>

            <div style={styles.card}>
              {sentences.map((sentence) => (
                <div key={sentence.id} style={styles.sentenceCard}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h4 style={{ margin: "0 0 10px 0" }}>
                      {sentence.sentence_id || sentence.id}
                    </h4>
                  </div>
                  <p style={{ margin: "0 0 10px 0" }}>{sentence.text}</p>
                  <small style={{ color: "#666" }}>
                    {sentence.segments?.length || 0} segments
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "segments" && (
          <div style={{ marginTop: "20px" }}>
            <div style={styles.sectionHeader}>
              <h2 style={{ margin: 0 }}>Segments Management</h2>
              <button
                onClick={() => setShowAddSegmentsModal(true)}
                style={styles.btn}
              >
                Add Segments
              </button>
            </div>

            {sentences.map((sentence) => (
              <div key={sentence.id} style={{ marginBottom: "30px" }}>
                <h3 style={{ marginBottom: "10px" }}>
                  Sentence: {sentence.text}
                </h3>
                <small style={{ color: "#666" }}>
                  {sentence.segments?.length || 0} segments
                </small>

                {sentence.segments && sentence.segments.length > 0 ? (
                  <div style={styles.card}>
                    {sentence.segments.map((segment) => (
                      <div key={segment.id} style={styles.segmentCard}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <h4 style={{ margin: "0 0 10px 0" }}>
                            {segment.segment_id || segment.id}
                          </h4>
                          <div>
                            <button
                              onClick={() => setAssigningSegment(segment.id)}
                              style={{
                                ...styles.btn,
                                ...styles.btnSecondary,
                                marginRight: "10px",
                              }}
                            >
                              Assign
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete(
                                    `/admin/segment/${segment.id}`
                                  );
                                  fetchData();
                                } catch (err) {
                                  setError("Failed to delete segment");
                                }
                              }}
                              style={{
                                ...styles.btn,
                                ...styles.btnDanger,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: "5px 0" }}>
                          <strong>Text:</strong> {segment.text}
                        </p>
                        <p style={{ margin: "5px 0" }}>
                          <strong>WX Text:</strong> {segment.wxtext}
                        </p>
                        <p style={{ margin: "5px 0" }}>
                          <strong>English Text:</strong> {segment.englishtext}
                        </p>
                        <small style={{ color: "#666" }}>
                          {segment.usrs?.length || 0} USRs
                        </small>

                        {segment.assignments &&
                          segment.assignments.length > 0 && (
                            <div style={styles.assignmentInfo}>
                              <h5 style={{ margin: "0 0 10px 0" }}>
                                Assignments:
                              </h5>
                              <ul
                                style={{
                                  listStyle: "none",
                                  paddingLeft: "0",
                                  margin: 0,
                                }}
                              >
                                {segment.assignments.map((assignment) => (
                                  <li
                                    key={assignment.id}
                                    style={{ marginBottom: "5px" }}
                                  >
                                    <strong>Status:</strong>{" "}
                                    {assignment.annotation_status} |
                                    <strong> Annotator:</strong>{" "}
                                    {getUserName(assignment.annotator_id)} |
                                    {assignment.reviewer_id && (
                                      <span>
                                        <strong> Reviewer:</strong>{" "}
                                        {getUserName(assignment.reviewer_id)}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#666" }}>
                    No segments found for this sentence
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "usrs" && (
          <div style={{ marginTop: "20px" }}>
            <div style={styles.sectionHeader}>
              <h2 style={{ margin: 0 }}>USRs Management</h2>
              <button
                onClick={() => setShowAddUSRsModal(true)}
                style={styles.btn}
              >
                Add USRs
              </button>
            </div>

            {sentences.map((sentence) => (
              <div key={sentence.id} style={{ marginBottom: "30px" }}>
                <h3 style={{ marginBottom: "10px" }}>
                  Sentence: {sentence.text}
                </h3>

                {sentence.segments && sentence.segments.length > 0 ? (
                  <div>
                    {sentence.segments.map((segment) => (
                      <div key={segment.id} style={{ marginBottom: "20px" }}>
                        <h4 style={{ marginBottom: "10px" }}>
                          Segment: {segment.text}
                        </h4>
                        <small style={{ color: "#666" }}>
                          Segment ID: {segment.segment_id || segment.id}
                        </small>

                        {segment.usrs && segment.usrs.length > 0 ? (
                          <div style={{ marginTop: "10px" }}>
                            {segment.usrs.map((usr) => (
                              <div key={usr.id} style={styles.usrCard}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <h5 style={{ margin: "0 0 10px 0" }}>
                                    USR ID: {usr.id}
                                  </h5>
                                  <div>
                                    <button
                                      onClick={() => setAssigningUSR(usr.id)}
                                      style={{
                                        ...styles.btn,
                                        ...styles.btnSecondary,
                                        marginRight: "10px",
                                      }}
                                    >
                                      Assign
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await axios.delete(
                                            `/admin/usr/${usr.id}`
                                          );
                                          fetchData();
                                        } catch (err) {
                                          setError("Failed to delete USR");
                                        }
                                      }}
                                      style={{
                                        ...styles.btn,
                                        ...styles.btnDanger,
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                  {formatUSRToCustomFormat(usr, segment)}
                                </div>

                                {usr.assignments &&
                                  usr.assignments.length > 0 && (
                                    <div
                                      style={{
                                        ...styles.assignmentInfo,
                                        backgroundColor: "#e9e9e9",
                                      }}
                                    >
                                      <h5 style={{ margin: "0 0 10px 0" }}>
                                        Assignments:
                                      </h5>
                                      <ul
                                        style={{
                                          listStyle: "none",
                                          paddingLeft: "0",
                                          margin: 0,
                                        }}
                                      >
                                        {usr.assignments.map((assignment) => (
                                          <li
                                            key={assignment.id}
                                            style={{ marginBottom: "5px" }}
                                          >
                                            <strong>Status:</strong>{" "}
                                            {assignment.annotation_status} |
                                            <strong> Annotator:</strong>{" "}
                                            {getUserName(
                                              assignment.annotator_id
                                            )}{" "}
                                            |
                                            {assignment.reviewer_id && (
                                              <span>
                                                <strong> Reviewer:</strong>{" "}
                                                {getUserName(
                                                  assignment.reviewer_id
                                                )}
                                              </span>
                                            )}
                                            {assignment.can_edit_lexical && (
                                              <span
                                                style={{ marginLeft: "5px" }}
                                              >
                                                <Tag color="blue">Lexical</Tag>
                                              </span>
                                            )}
                                            {assignment.can_edit_dependency && (
                                              <span
                                                style={{ marginLeft: "5px" }}
                                              >
                                                <Tag color="green">
                                                  Dependency
                                                </Tag>
                                              </span>
                                            )}
                                            {assignment.can_edit_discourse && (
                                              <span
                                                style={{ marginLeft: "5px" }}
                                              >
                                                <Tag color="orange">
                                                  Discourse
                                                </Tag>
                                              </span>
                                            )}
                                            {assignment.can_edit_construction && (
                                              <span
                                                style={{ marginLeft: "5px" }}
                                              >
                                                <Tag color="purple">
                                                  Construction
                                                </Tag>
                                              </span>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: "#666" }}>
                            No USRs found for this segment
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#666" }}>
                    No segments found in this sentence
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterDetailsPage;
