import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Assuming the CSS file is named Login.css
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    try {
      const response = await axios.post('http://192.168.104.65:8000/account/login/', {
        email,
        password,
      });

      const { access, refresh } = response.data;

      // Save tokens to local storage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Redirect to home page after successful login
      navigate('/'); // Navigate to the home page
      window.location.reload();
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="form-container">
      <div className="form-body">
        <form onSubmit={handleLogin} className="the-form">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input type="submit" value="Log In" />
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div className="form-footer">
        <div>
          <span>Don't have an account?</span> <a href=".">Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
