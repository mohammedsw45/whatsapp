import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { IoMdSend } from "react-icons/io";
import { FaMicrophone, FaRegSmile } from "react-icons/fa";
import './Chat.css';
import SERVER_IP from '../../config'; // Ensure this imports the correct server IP

function Chat({ chatId, currentProfileId }) {
  const [chatData, setChatData] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null); // State for the current profile
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState(''); // State for message text
  const textareaRef = useRef(null);

  // Function to fetch chat data
  const fetchChatData = async () => {
    if (!chatId) return; // Return if no chatId is provided

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${SERVER_IP}/chatting/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      // Set chat data
      setChatData(response.data.chat);

      // Extract and set the current profile
      const profile = response.data.chat.profiles.find(profile => profile.id === currentProfileId);
      setCurrentProfile(profile);

    } catch (error) {
      console.error("Error fetching chat data:", error);
      setError("Failed to fetch chat data");
    }
  };

  // Fetch chat data when chatId or currentProfileId changes
  useEffect(() => {
    fetchChatData();
  }, [chatId, currentProfileId]);

  // Adjust textarea height on input
  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    adjustHeight(); // Adjust height on initial render

    // Adjust height on input change
    const textarea = textareaRef.current;
    textarea.addEventListener('input', adjustHeight);

    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, []);

  // Function to handle message send
  const handleSendMessage = async (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    if (!messageText.trim()) return; // Don't send empty messages

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${SERVER_IP}/chatting/chats/${chatId}/messages/create/`, {
        text: messageText,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setMessageText(''); // Clear the textarea
      fetchChatData(); // Refresh chat data to include the new message

    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  return (
    <div className='conversation'>
      <div className="heading">
        <a className='prof-navigate' href="my-profile/profile-page.html"> 
          <div className="heading-avatar">
             <div className="heading-avatar-icon">
                {chatData && chatData.profiles && chatData.profiles.length > 1 && (
                  chatData.profiles[0].id === currentProfileId ? (
                    <img src={`${SERVER_IP}${chatData.profiles[1].profile_picture}`} alt="avatar1" />
                  ) : (
                    <img src={`${SERVER_IP}${chatData.profiles[0].profile_picture}`} alt="avatar2" />
                  )
                )}
             </div>
          </div>
          <div className='conversation-name'>
            <span>{chatData ? chatData.title : "Loading..."}</span>
          </div>
        </a>
      </div>

      <div className='messages'>
        {error ? (
          <p>{error}</p>
        ) : chatData ? (
          chatData.messages.map(message => (
            <div className="message-body" key={message.id}>
              <div className={`${message.sender === currentProfileId ? 'message-main-sender' : 'message-main-receiver'}`}>
                <div className={message.sender === currentProfileId ? 'sender' : 'receiver'}>
                  <div className={message.sender === currentProfileId ? 'sender-message-text' : 'receiver-message-text'}>
                    {message.text}
                  </div>
                  <span className="message-time pull-right">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No messages available</p>
        )}
      </div>

      <form className="reply" onSubmit={handleSendMessage}>
        <div className="reply-emojis">
          <FaRegSmile />
        </div>
        <div className="reply-main">
          <textarea
            className="form-control"
            rows="1"
            id="message-textarea" // Unique ID for textarea
            name="message" // Name attribute for textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </div>
        <div className="reply-recording">
          <FaMicrophone />
        </div>
        <button type="submit" className="reply-send">
          <IoMdSend />
        </button>
      </form>
    </div>
  );
}

export default Chat;
