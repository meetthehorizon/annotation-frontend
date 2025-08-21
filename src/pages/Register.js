import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { Form, Button, Alert } from "react-bootstrap";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axiosInstance.post("/admin/register", {
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        password: formData.password,
      });

      setRegistrationSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        if (error.response.status === 409) {
          setErrors({ ...errors, email: "Email already exists" });
        } else {
          setServerError(error.response.data.msg || "Registration failed");
        }
      } else {
        setServerError("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f6f9fc 0%, #e8f0fe 100%)",
      padding: "2rem",
      fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
    },
    formContainer: {
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      padding: "2.5rem",
      maxWidth: "500px",
      width: "100%",
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
      },
    },
    title: {
      color: "#2c3e50",
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "700",
      fontSize: "1.8rem",
      letterSpacing: "-0.5px",
    },
    formLabel: {
      fontWeight: "600",
      color: "#4a5568",
      marginBottom: "0.5rem",
      fontSize: "0.95rem",
    },
    formControl: {
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: "#4299e1",
        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.2)",
        outline: "none",
      },
      "&:invalid": {
        borderColor: "#fc8181",
      },
    },
    submitButton: {
      background: "#4299e1",
      border: "none",
      padding: "0.75rem",
      fontSize: "1rem",
      fontWeight: "600",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      marginTop: "0.5rem",
      width: "100%",
      color: "white",
      "&:hover": {
        background: "#3182ce",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(49, 130, 206, 0.2)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
      "&:disabled": {
        background: "#bee3f8",
        transform: "none",
        cursor: "not-allowed",
      },
    },
    link: {
      color: "#4299e1",
      textDecoration: "none",
      fontWeight: "600",
      transition: "all 0.2s ease",
      "&:hover": {
        color: "#3182ce",
        textDecoration: "underline",
      },
    },
    errorText: {
      color: "#e53e3e",
      fontSize: "0.85rem",
      marginTop: "0.25rem",
      fontWeight: "500",
    },
    footerText: {
      textAlign: "center",
      marginTop: "1.5rem",
      color: "#718096",
      fontSize: "0.95rem",
    },
    alert: {
      borderRadius: "8px",
      marginBottom: "1.5rem",
    },
    successMessage: {
      textAlign: "center",
      padding: "2rem",
    },
  };

  if (registrationSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div style={styles.successMessage}>
            <h3>Registration Submitted</h3>
            <p>Your registration request has been received.</p>
            <p>
              An administrator will review your application and notify you once
              your account is approved.
            </p>
            <p>You'll be redirected to the login page shortly...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create an Account</h2>

        {serverError && (
          <Alert variant="danger" style={styles.alert}>
            {serverError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label style={styles.formLabel}>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
              placeholder="Enter your name"
              style={styles.formControl}
              required
            />
            {errors.name && <div style={styles.errorText}>{errors.name}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={styles.formLabel}>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="Enter email"
              style={styles.formControl}
              required
            />
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={styles.formLabel}>Organization</Form.Label>
            <Form.Control
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              isInvalid={!!errors.organization}
              placeholder="Enter your organization"
              style={styles.formControl}
              required
            />
            {errors.organization && (
              <div style={styles.errorText}>{errors.organization}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={styles.formLabel}>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              placeholder="Password (min 6 characters)"
              style={styles.formControl}
              required
              minLength="6"
            />
            {errors.password && (
              <div style={styles.errorText}>{errors.password}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={styles.formLabel}>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
              placeholder="Confirm password"
              style={styles.formControl}
              required
            />
            {errors.confirmPassword && (
              <div style={styles.errorText}>{errors.confirmPassword}</div>
            )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </Form>

        <div style={styles.footerText}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>
            Log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
