import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { IoMdSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { FaRegSmile } from "react-icons/fa";
import avatar1 from "../../images/avatar1.png";
import './Chat.css';
import SERVER_IP from '../../config'; // Ensure this imports the correct server IP

function Chat({ chatId, currentProfileId }) {
  const [chatData, setChatData] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!chatId) return; // Return if no chatId is provided

    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${SERVER_IP}/chatting/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setChatData(response.data.chat);
        console.log(chatData);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setError("Failed to fetch chat data");
      }
    };

    fetchChatData();
  }, [chatId]);

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
              <div className={`message-main-${message.sender === chatData.users[0] ? 'sender' : 'receiver'}`}>
                <div className={message.sender === chatData.users[0] ? 'sender' : 'receiver'}>
                  <div className={message.sender === chatData.users[0] ? 'sender-message-text' : 'receiver-message-text'}>
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

      <div className="reply">
        <div className="reply-emojis">
          <FaRegSmile />
        </div>
        <div className="reply-main">
          <textarea
            className="form-control"
            rows="1"
            id="comment"
            ref={textareaRef}
          />
        </div>
        <div className="reply-recording">
          <FaMicrophone />
        </div>
        <div className="reply-send">
          <IoMdSend />
        </div>
      </div>
    </div>
  );
}

export default Chat;
