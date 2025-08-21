import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Navbar from "../../components/Navbar";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "annotator",
    password: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("approved");

  useEffect(() => {
    fetchUsers();
    if (activeTab === "pending") {
      fetchPendingUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get("/admin/pending_users");
      setPendingUsers(res.data);
    } catch (err) {
      setError("Failed to fetch pending users");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApproveUser = async (userId, role) => {
    try {
      await axios.put(`/admin/approve_user/${userId}`, { role });
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      fetchUsers(); // Refresh the approved users list
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to approve user");
    }
  };

  const handleRejectUser = async (userId) => {
    confirmAlert({
      title: "Confirm rejection",
      message: "Are you sure you want to reject this user?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await axios.put(`/admin/reject_user/${userId}`);
              setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
            } catch (err) {
              setError("Failed to reject user");
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admin/user", formData);
      setFormData({
        name: "",
        email: "",
        role: "annotator",
        password: "",
      });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create user");
    }
  };

  const handleDeleteUser = (userId) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this user?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await axios.delete(`/admin/user/${userId}`);
              setUsers(users.filter((u) => u.id !== userId));
            } catch (err) {
              setError("Failed to delete user");
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>User Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {/* Tab navigation */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("approved")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "approved" ? "#4CAF50" : "#f5f5f5",
            color: activeTab === "approved" ? "white" : "black",
            border: "none",
            borderRadius: "4px 4px 0 0",
            cursor: "pointer",
            marginRight: "5px",
          }}
        >
          Approved Users
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "pending" ? "#2196F3" : "#f5f5f5",
            color: activeTab === "pending" ? "white" : "black",
            border: "none",
            borderRadius: "4px 4px 0 0",
            cursor: "pointer",
          }}
        >
          Pending Approvals
        </button>
      </div>

      {showForm && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Create New User</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Organization:
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Role:
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="annotator">Annotator</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {activeTab === "approved" ? (
        <div style={{ border: "1px solid #eee", borderRadius: "4px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Organization
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Role
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{user.name}</td>
                  <td style={{ padding: "12px" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>{user.organization}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          user.role === "admin"
                            ? "#4CAF50"
                            : user.role === "reviewer"
                            ? "#2196F3"
                            : "#FFC107",
                        color: "white",
                        fontSize: "0.8rem",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "5px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: "4px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Organization
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{user.name}</td>
                  <td style={{ padding: "12px" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>{user.organization}</td>
                  <td style={{ padding: "12px" }}>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleApproveUser(user.id, e.target.value);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        marginRight: "5px",
                        borderRadius: "4px",
                      }}
                    >
                      <option value="" disabled>
                        Select role...
                      </option>
                      <option value="annotator">Approve as Annotator</option>
                      <option value="reviewer">Approve as Reviewer</option>
                      <option value="admin">Approve as Admin</option>
                    </select>
                    <button
                      onClick={() => handleRejectUser(user.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
