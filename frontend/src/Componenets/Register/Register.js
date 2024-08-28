import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Assuming a separate CSS file for the Register component
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone_number: '',
    profile_picture: null,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_picture: e.target.files[0] });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://192.168.1.98:8000/account/register/', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);

      // Navigate to login page after successful registration
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-body">
        <h1>Register</h1>
        <form onSubmit={handleRegister} className="the-form">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            id="phone_number"
            placeholder="Enter your phone number"
            value={formData.phone_number}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="profile_picture">Profile Picture</label>
          <input
            type="file"
            name="profile_picture"
            id="profile_picture"
            onChange={handleFileChange}
            required
          />

          <input type="submit" value="Register" />
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-footer">
          <div>
            <span>Already have an account?</span> <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
