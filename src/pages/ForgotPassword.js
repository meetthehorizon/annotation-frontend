import { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Alert, Form, Button } from "react-bootstrap";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = email input, 2 = OTP input
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("/admin/forgot_password", { email });
      setMessage(response.data.msg);
      setStep(2); // Move to OTP verification step
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.msg || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("/admin/verify_otp", { email, otp });
      setMessage(response.data.msg);
      setResetToken(response.data.reset_token);
      navigate(`/reset-password?token=${response.data.reset_token}`);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.msg || "Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f6f9fc 0%, #e8f0fe 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          padding: "2.5rem",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h2
          style={{
            color: "#2c3e50",
            marginBottom: "1.5rem",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "1.8rem",
          }}
        >
          {step === 1 ? "Forgot Password" : "Verify OTP"}
        </h2>

        {error && (
          <Alert
            variant="danger"
            style={{ borderRadius: "8px", marginBottom: "1.5rem" }}
          >
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            variant="success"
            style={{ borderRadius: "8px", marginBottom: "1.5rem" }}
          >
            {message}
          </Alert>
        )}

        {step === 1 ? (
          <Form onSubmit={handleSendOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "all 0.2s ease",
                }}
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "1rem",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#3182ce",
                },
                "&:disabled": {
                  backgroundColor: "#bee3f8",
                  cursor: "not-allowed",
                },
              }}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleVerifyOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength="6"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "all 0.2s ease",
                }}
              />
              <Form.Text className="text-muted">
                Check your email for the OTP. It's valid for 10 minutes.
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "1rem",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#3182ce",
                },
                "&:disabled": {
                  backgroundColor: "#bee3f8",
                  cursor: "not-allowed",
                },
              }}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Button
                variant="link"
                onClick={() => setStep(1)}
                style={{
                  color: "#4299e1",
                  textDecoration: "none",
                  fontWeight: "600",
                  padding: "0",
                }}
              >
                Back to Email
              </Button>
            </div>
          </Form>
        )}

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a
            href="/login"
            style={{
              color: "#4299e1",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
