import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Alert, Form, Button } from 'react-bootstrap';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/admin/reset_password', {
        token,
        new_password: newPassword
      });
      setMessage(response.data.msg);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.msg || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f6f9fc 0%, #e8f0fe 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '1.8rem'
        }}>Reset Password</h2>
        
        {error && (
          <Alert variant="danger" style={{ borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </Alert>
        )}
        
        {message && (
          <Alert variant="success" style={{ borderRadius: '8px', marginBottom: '1.5rem' }}>
            {message}
          </Alert>
        )}
        
        {token ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
              />
            </Form.Group>
            
            <Button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        ) : (
          <Alert variant="danger">
            Invalid or missing reset token. Please complete the OTP verification process first.
          </Alert>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a 
            href="/login" 
            style={{
              color: '#4299e1',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;