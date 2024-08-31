// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './Chats.css';
// import profile_avatar from "../../images/profile.png";
// import SERVER_IP from '../../config';
// import { ImUserPlus } from "react-icons/im";
// import { IoLogOutOutline } from "react-icons/io5";
// import { Link, useNavigate } from 'react-router-dom';
// import ChatInstance from '../ChatInstance/ChatInstance';
// import Chat from '../Chat/Chat';

// function Chats() {
//   const [chats, setChats] = useState([]);
//   const [filteredChats, setFilteredChats] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [error, setError] = useState(null);
//   const [currentProfile, setCurrentProfile] = useState(null);
//   const [selectedChatId, setSelectedChatId] = useState(null);
//   const [currentProfileId, setCurrentProfileId] = useState(null);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     navigate('/login');
//     window.location.reload();
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (!token) {
//       setError("No access token found. Please log in.");
//       return;
//     }

//     axios.get(`${SERVER_IP}/chatting/chats/`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     })
//     .then(response => {
//       setChats(response.data.chats);
//       setFilteredChats(response.data.chats);
//       if (response.data.chats.length > 0) {
//         setSelectedChatId(response.data.chats[0].id);
//       }
//     })
//     .catch(error => {
//       console.error("Error fetching data:", error);
//       setError("Failed to fetch chats data");
//     });

//     axios.get(`${SERVER_IP}/account/me/`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     })
//     .then(response => {
//       setCurrentProfile(response.data);
//       setCurrentProfileId(response.data.id);
//     })
//     .catch(error => {
//       console.error("Error fetching current user data:", error);
//       setError("Failed to fetch current user data");
//     });
//   }, []);

//   useEffect(() => {
//     const filtered = chats.filter(chat => {
//       return chat.profiles && chat.profiles.some(profile => {
//         const fullName = `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username;
//         return fullName.toLowerCase().includes(searchText.toLowerCase());
//       });
//     });
//     setFilteredChats(filtered);
//   }, [searchText, chats]);

//   const handleChatClick = (chatId) => {
//     setSelectedChatId(chatId);
//   };

//   return (
//     <div className='chats'>
//       <div className='users'>
//         <div className="heading">
//           <div className="heading-avatar">
//             <div className="heading-avatar-icon">
//               {currentProfile ? (
//                 <a href="/my-profile/profile-page">
//                   <img 
//                     src={currentProfile.profile_picture ? `${currentProfile.profile_picture}` : profile_avatar} 
//                     alt="profile avatar" 
//                   />
//                 </a>
//               ) : (
//                 <img src={profile_avatar} alt="profile avatar" />
//               )}
//             </div>
//           </div>
//           {currentProfile && (
//             <div className="user-info">
//               <h4>{currentProfile.user.first_name} {currentProfile.user.last_name}</h4>
//             </div>
//           )}
//           <div className='add_chat'>
//             <Link to="/users"><ImUserPlus /></Link>
//           </div>
//           <div className='logout'>
//             <button className='logout-btn' onClick={handleLogout}><IoLogOutOutline /></button>
//           </div>
//         </div>

//         <div className="searchBox">
//           <div className="searchBox-input">
//             <input
//               id="searchText"
//               type="text"
//               name="searchText"
//               placeholder="Search"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className='user-list'>
//           {error ? (
//             <p>{error}</p>
//           ) : filteredChats.length > 0 ? (
//             filteredChats.map(chat => {
//               if (!chat.profiles || chat.profiles.length === 0) return null;

//               let profile = chat.profiles[0];
//               if (chat.profiles.length > 1 && chat.profiles[0].id.toString() === currentProfileId?.toString()) {
//                 profile = chat.profiles[1];
//               }
            
//               const user = profile.user || {};

//               return (
//                 <button
//                   key={chat.id}
//                   className="call-chat-btn"
//                   onClick={() => handleChatClick(chat.id)}
//                 >
//                   <ChatInstance
//                     chat={{
//                       id: chat.id,
//                       name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
//                       avatar: profile.profile_picture ? `${SERVER_IP}${profile.profile_picture}` : profile_avatar, 
//                       time: chat.created_at ? new Date(chat.created_at).toLocaleTimeString() : 'N/A',
//                       unread_messages_count: chat.unread_messages_count // Pass unread messages count
//                     }}
//                   />
//                 </button>
//               );
//             })
//           ) : (
//             <p>No chats available</p>
//           )}
//         </div>
//       </div>

//       <div>
//         {selectedChatId && <Chat chatId={selectedChatId} currentProfileId={currentProfileId} />}
//       </div>
//     </div>
//   );
// }

// export default Chats;



// src/Componenets/Chats/Chats.js
// src/Componenets/Chats/Chats.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chats.css';
import profile_avatar from "../../images/profile.png";
import SERVER_IP from '../../config';
import { ImUserPlus } from "react-icons/im";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import ChatInstance from '../ChatInstance/ChatInstance';
import Chat from '../Chat/Chat';
import Users from '../Users/Users'; // Import the Users component

function Chats() {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [showUsers, setShowUsers] = useState(false); // State to toggle users view
  const navigate = useNavigate();

  const handleLogout = () => {
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

    axios.get(`${SERVER_IP}/chatting/chats/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setChats(response.data.chats);
      setFilteredChats(response.data.chats);
      if (response.data.chats.length > 0) {
        setSelectedChatId(response.data.chats[0].id);
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setError("Failed to fetch chats data");
    });

    axios.get(`${SERVER_IP}/account/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setCurrentProfile(response.data);
      setCurrentProfileId(response.data.id);
    })
    .catch(error => {
      console.error("Error fetching current user data:", error);
      setError("Failed to fetch current user data");
    });
  }, []);

  useEffect(() => {
    const filtered = chats.filter(chat => {
      return chat.profiles && chat.profiles.some(profile => {
        const fullName = `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username;
        return fullName.toLowerCase().includes(searchText.toLowerCase());
      });
    });
    setFilteredChats(filtered);
  }, [searchText, chats]);

  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId);
  };

  const handleShowUsers = () => {
    setShowUsers(true);
  };

  const handleBackToChats = () => {
    setShowUsers(false);
  };

  return (
    <div className='chats'>
      {showUsers ? (
        <div>
          <Users onBack={handleBackToChats} /> {/* Pass the function as a prop */}
        </div>
      ) : (
        <div className='chat-view'>
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
                <button onClick={handleShowUsers}><ImUserPlus /></button>
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
                  if (!chat.profiles || chat.profiles.length === 0) return null;

                  let profile = chat.profiles[0];
                  if (chat.profiles.length > 1 && chat.profiles[0].id.toString() === currentProfileId?.toString()) {
                    profile = chat.profiles[1];
                  }
                
                  const user = profile.user || {};

                  return (
                    <button
                      key={chat.id}
                      className="call-chat-btn"
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <ChatInstance
                        chat={{
                          id: chat.id,
                          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
                          avatar: profile.profile_picture ? `${SERVER_IP}${profile.profile_picture}` : profile_avatar, 
                          time: chat.created_at ? new Date(chat.created_at).toLocaleTimeString() : 'N/A',
                          unread_messages_count: chat.unread_messages_count // Pass unread messages count
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
            {selectedChatId && <Chat chatId={selectedChatId} currentProfileId={currentProfileId} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chats;
