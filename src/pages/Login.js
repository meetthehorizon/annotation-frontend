import { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../auth/auth";
import { Link } from "react-router-dom";
import { Alert } from "react-bootstrap";

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f6f9fc 0%, #e8f0fe 100%)',
    padding: '2rem',
    fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', sans-serif"
  },
  formContainer: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    padding: '2.5rem',
    maxWidth: '400px',
    width: '100%'
  },
  heading: {
    color: '#2c3e50',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '1.8rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.2)',
      outline: 'none'
    }
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#3182ce',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(49, 130, 206, 0.2)'
    },
    '&:disabled': {
      backgroundColor: '#bee3f8',
      cursor: 'not-allowed'
    }
  },
  footerText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#718096',
    fontSize: '0.95rem'
  },
  link: {
    color: '#4299e1',
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  alert: {
    borderRadius: '8px',
    marginBottom: '1.5rem'
  }
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await axios.post("/auth/login", { email, password });
      
      if (!res.data.access_token) {
        throw new Error('No access token received');
      }

      localStorage.setItem('token', res.data.access_token);
      const userData = getAuthUser();
      
      if (!userData?.role) {
        throw new Error('No role assigned in token');
      }

      const roleRedirects = {
        admin: '/admin',
        annotator: '/annotator', 
        reviewer: '/reviewer'
      };

      const redirectPath = roleRedirects[userData.role];
      if (!redirectPath) {
        throw new Error(`Unknown role: ${userData.role}`);
      }

      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Your account is pending approval by an administrator');
        } else {
          setError(err.response.data.msg || 'Login failed');
        }
      } else {
        setError(err.message || 'Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Login</h2>
        
        {error && (
          <Alert variant="danger" style={styles.alert}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleLogin}>
          <input 
            style={styles.input}
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email" 
            required 
          />
          <input 
            style={styles.input}
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
          />
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/forgot-password" style={styles.link}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;