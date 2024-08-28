import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chats.css';
import profile_avatar from "../../images/profile.png";
import SERVER_IP from '../../config';
import { ImUserPlus } from "react-icons/im";
import { IoLogOutOutline } from "react-icons/io5";

import { Link, useNavigate} from 'react-router-dom';
import ChatInstance from '../ChatInstance/ChatInstance';
import Chat from '../Chat/Chat';

function Chats() {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null); // State for authenticated user
  const [selectedChatId, setSelectedChatId] = useState(null); // State for selected chat ID
  const [currentProfileId, setCurrentProfileId] = useState(null); // State for selected chat ID
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear the tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    navigate('/login');
    window.location.reload();
  };

  useEffect(() => {

    


    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError("No access token found. Please log in.");
      return;
    }

    // Fetch chat data for all chats
    axios.get(`${SERVER_IP}/chatting/chats/`, {
      headers: {
        'Authorization': `Bearer ${token}` // Add Bearer token to headers
      }
    })
    .then(response => {
      setChats(response.data.chats);
      setFilteredChats(response.data.chats); // Initialize filtered chats
      setSelectedChatId(response.data.chats[0].id)
      
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setError("Failed to fetch chats data");
    });
    // Fetch data for the authenticated user
    axios.get(`${SERVER_IP}/account/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setCurrentProfile(response.data); // Store the authenticated user data
      setCurrentProfileId(response.data.id)
    })
    .catch(error => {
      console.error("Error fetching current user data:", error);
      setError("Failed to fetch current user data");
    });
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    const filtered = chats.filter(chat => {
      return chat.profiles.some(profile => {
        const fullName = `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username;
        return fullName.toLowerCase().includes(searchText.toLowerCase());
      });
    });
    setFilteredChats(filtered);
  }, [searchText, chats]);

  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId); // Set the selected chat ID
  };

  return (
    <div className='chats'>
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
          <div className='logout'>
            <button className='logout-btn' onClick={handleLogout}><IoLogOutOutline /></button>
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
          ) : filteredChats.length > 0 ? (
            
            filteredChats.map(chat => {
              // Check if profiles exist and are not empty
              if (!chat.profiles || chat.profiles.length === 0) return null;
              
              let profile = chat.profiles[0];
              if (chat.profiles.length > 1 && chat.profiles[0].id.toString() === currentProfile.id.toString()) {
                profile = chat.profiles[1];
              }
            
              const user = profile.user || {}; // Fallback to an empty object if user is undefined

              return (
                <button
                  key={chat.id} // Apply the key to the button
                  className="call-chat-btn"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <ChatInstance
                    chat={{
                      id: chat.id,  // Ensure you're passing chat.id here
                      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
                      avatar: profile.profile_picture ? `${SERVER_IP}${profile.profile_picture}` : profile_avatar, 
                      time: chat.created_at ? new Date(chat.created_at).toLocaleTimeString() : 'N/A',
                    }}
                  />
                </button>
              );
            })
          ) : (
            <p>No chats available</p>
          )}
        </div>

      </div>

      <div>
      <Chat chatId={selectedChatId} currentProfileId={currentProfileId} />
      </div>
    </div>
  );
}

export default Chats;
