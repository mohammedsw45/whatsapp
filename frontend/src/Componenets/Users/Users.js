import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';
import profile_avatar from "../../images/profile.png";
import UserInstance from '../UserInstance/UserInstance';
import SERVER_IP from '../../config';
import { ImUserPlus } from "react-icons/im";
import {Link } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  const [currentProfile, setcurrentProfile] = useState(null); // State for authenticated user

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError("No access token found. Please log in.");
      return;
    }

    // Fetch user data for all users
    axios.get(`${SERVER_IP}/chatting/chats/profiles/`, {
      headers: {
        'Authorization': `Bearer ${token}` // Add Bearer token to headers
      }
    })
    .then(response => {
      setUsers(response.data.profiles);
      setFilteredUsers(response.data.profiles); // Initialize filtered users
      console.log(response.data.profiles)
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setError("Failed to fetch user data");
    });

    // Fetch data for the authenticated user
    axios.get(`${SERVER_IP}/account/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setcurrentProfile(response.data); // Store the authenticated user data
    })
    .catch(error => {
      console.error("Error fetching current user data:", error);
      setError("Failed to fetch current user data");
    });
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    const filtered = users.filter(user => {
      const fullName = `${user.user.first_name} ${user.user.last_name}`.trim() || user.user.username;
      return fullName.toLowerCase().includes(searchText.toLowerCase());
    });
    setFilteredUsers(filtered);
  }, [searchText, users]);

  return (
    <div className='users'>
      <div className="heading">
        <div className="heading-avatar">
          <div className="heading-avatar-icon">
            {currentProfile ? (
              <a href="/my-profile/profile-page">
                <img 
                  src={currentProfile.profile_picture ? `${currentProfile.profile_picture}` : profile_avatar} 
                  alt="profile avatar" 
                />
              </a>
            ) : (
              <img src={profile_avatar} alt="profile avatar" />
            )}
          </div>
        </div>
        {currentProfile && (
          <div className="user-info">
            <h4>{currentProfile.user.first_name} {currentProfile.user.last_name}</h4>
          </div>
        )}
        <div className='add_chat'>
        <Link to="/register"><ImUserPlus /></Link>
        </div>
      </div>

      <div className="searchBox">
        <div className="searchBox-input">
          <input
            id="searchText"
            type="text"
            name="searchText"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className='user-list'>
        {error ? (
          <p>{error}</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers
            .filter(user => user.id !== (currentProfile ? currentProfile.id : null)) 
            .map(user => (
              <UserInstance
                key={user.id}
                user={{
                  id: user.user.id,
                  name: `${user.user.first_name} ${user.user.last_name}`.trim() || user.user.username,
                  avatar: user.profile_picture || profile_avatar, 
                  time: new Date(user.updated_at).toLocaleTimeString(), 
                  link: 'chats/chat.html'
                }}
              />
            ))
        ) : (
          <p>No users available</p>
        )}
      </div>

    </div>
  );
}

export default Users;