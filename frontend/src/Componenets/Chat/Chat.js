// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios';
// import { IoMdSend } from "react-icons/io";
// import { FaMicrophone, FaRegSmile } from "react-icons/fa";
// import './Chat.css';
// import SERVER_IP from '../../config'; // Ensure this imports the correct server IP
// import profile_avatar from "../../images/profile.png";


// function Chat({ chatId }) {
//   const [chatData, setChatData] = useState(null);
//   const [currentProfile, setCurrentProfile] = useState(null); // State for the current profile
//   const [receiverProfile, setReceiverProfile] = useState(null); // State for the receiver profile
//   const [error, setError] = useState(null);
//   const [messageText, setMessageText] = useState(''); // State for message text
//   const [currentProfileId, setCurrentProfileId] = useState(null); // State for the current profile ID
//   const textareaRef = useRef(null);
//   const lastMessageRef = useRef(null); // Ref to focus on the last message

//   // Fetch the current user's profile data on component mount
//   useEffect(() => {
//     const fetchCurrentProfile = async () => {
//       try {
//         const token = localStorage.getItem('accessToken');
//         const response = await axios.get(`${SERVER_IP}/account/me/`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
//         setCurrentProfile(response.data);
//         setCurrentProfileId(response.data.id);
//       } catch (error) {
//         console.error("Error fetching current user data:", error);
//         setError("Failed to fetch current user data");
//       }
//     };

//     fetchCurrentProfile();
//   }, []); // Empty dependency array means this effect runs once on mount

//   // Function to fetch chat data
//   const fetchChatData = useCallback(async () => {
//     if (!chatId || !currentProfileId) return; // Return if no chatId or currentProfileId is provided

//     try {
//       const token = localStorage.getItem('accessToken');
//       const response = await axios.get(`${SERVER_IP}/chatting/chats/${chatId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         }
//       });

//       // Set chat data and extract the current profile
//       setChatData(response.data.chat);

//       // Set the receiver profile
//       const receiver = response.data.chat.profiles.find(profile => profile.id !== currentProfileId);
//       setReceiverProfile(receiver);

//     } catch (error) {
//       console.error("Error fetching chat data:", error);
//       setError("Failed to fetch chat data");
//     }
//   }, [chatId, currentProfileId]);

//   // Memoized function for handling WebSocket messages
//   const handleWebSocketMessage = useCallback((event) => {
//     console.log('WebSocket message received:', event.data);
//     fetchChatData();
//   }, [fetchChatData]);

//   // WebSocket setup
//   useEffect(() => {
//     if (!chatId || !currentProfileId) return;

//     // const socketInstance = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/${currentProfileId}/`);
//     const socketInstance = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/`);
//     console.log("****************************************");
//     console.log(socketInstance);
//     console.log("****************************************");

//     socketInstance.onopen = () => {
//       console.log("WebSocket connection opened");
//     };

//     socketInstance.onmessage = (event) => {
//       handleWebSocketMessage(event);
//     };

//     socketInstance.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     socketInstance.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     // Cleanup WebSocket connection on component unmount
//     return () => {
//       socketInstance.close();
//     };
//   }, [chatId, currentProfileId, handleWebSocketMessage]);

//   // Fetch chat data when chatId or currentProfileId changes
//   useEffect(() => {
//     fetchChatData();
//   }, [chatId, currentProfileId, fetchChatData]);

//   // Adjust textarea height on input
//   useEffect(() => {
//     const adjustHeight = () => {
//       if (textareaRef.current) {
//         textareaRef.current.style.height = 'auto';
//         textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//       }
//     };

//     adjustHeight(); // Adjust height on initial render

//     const textarea = textareaRef.current;
//     textarea.addEventListener('input', adjustHeight);

//     return () => {
//       textarea.removeEventListener('input', adjustHeight);
//     };
//   }, []);

//   // Scroll to the last message whenever chat data changes
//   useEffect(() => {
//     if (lastMessageRef.current) {
//       lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatData]);

//   // Function to handle message send
//   const handleSendMessage = async (event) => {
//     event.preventDefault(); // Prevent the form from submitting the traditional way

//     if (!messageText.trim()) return; // Don't send empty messages

//     try {
//       const token = localStorage.getItem('accessToken');
//       await axios.post(`${SERVER_IP}/chatting/chats/${chatId}/messages/create/`, {
//         text: messageText,
//       }, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         }
//       });

//       setMessageText(''); // Clear the textarea
//       fetchChatData(); // Refresh chat data to include the new message

//     } catch (error) {
//       console.error("Error sending message:", error);
//       setError("Failed to send message");
//     }
//   };

//   return (
//     <div className='conversation'>
//       <div className="heading">
//         <a className='prof-navigate' href="my-profile/profile-page.html">
//           <div className="heading-avatar">
//             <div className="heading-avatar-icon">
//               {chatData && receiverProfile && (
//                 <img 
//                     src={receiverProfile.profile_picture ?`${SERVER_IP}${receiverProfile.profile_picture}` : profile_avatar} 
//                     alt="profile avatar" 
//                   />
//               )}
                  
              
//             </div>
//           </div>
//           <div className='conversation-name'>
//             <span>{receiverProfile ? `${receiverProfile.user.first_name} ${receiverProfile.user.last_name}`  : "Loading..."}</span>
//           </div>
//         </a>
//       </div>

//       <div className='messages'>
//         {error ? (
//           <p>{error}</p>
//         ) : chatData ? (
//           chatData.messages.map((message, index) => (
//             <div 
//               className="message-body" 
//               key={message.id} // Ensure each message has a unique key
//               ref={index === chatData.messages.length - 1 ? lastMessageRef : null} // Attach ref to last message
//             >
//               <div className={`${message.sender === currentProfileId ? 'message-main-sender' : 'message-main-receiver'}`}>
//                 <div className={message.sender === currentProfileId ? 'sender' : 'receiver'}>
//                   <div className={message.sender === currentProfileId ? 'sender-message-text' : 'receiver-message-text'}>
//                     {message.text}
//                   </div>
//                   <span className="message-time pull-right">
//                     {new Date(message.timestamp).toLocaleTimeString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No messages available</p>
//         )}
//       </div>

//       <form className="reply" onSubmit={handleSendMessage}>
//         <div className="reply-emojis">
//           <FaRegSmile />
//         </div>
//         <div className="reply-main">
//           <textarea
//             className="form-control"
//             rows="1"
//             id="message-textarea"
//             name="message"
//             ref={textareaRef}
//             value={messageText}
//             onChange={(e) => setMessageText(e.target.value)}
//           />
//         </div>
//         <div className="reply-recording">
//           <FaMicrophone />
//         </div>
//         <button type="submit" className="reply-send">
//           <IoMdSend />
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Chat;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { IoMdSend } from "react-icons/io";
import { FaMicrophone, FaRegSmile } from "react-icons/fa";
import './Chat.css';
import SERVER_IP from '../../config'; // Ensure this imports the correct server IP
import profile_avatar from "../../images/profile.png";

function Chat({ chatId }) {
  const [chatData, setChatData] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [CreatedMessage, setCreatedMessage] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const textareaRef = useRef(null);
  const lastMessageRef = useRef(null);
  const unreadMessagesRef = useRef(null);


  // Fetch the current user's profile data on component mount
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${SERVER_IP}/account/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCurrentProfile(response.data);
        setCurrentProfileId(response.data.id);
      } catch (error) {
        console.error("Error fetching current user data:", error);
        setError("Failed to fetch current user data");
      }
    };

    fetchCurrentProfile();
  }, []);

  // Function to fetch chat data
  const fetchChatData = useCallback(async () => {
    if (!chatId || !currentProfileId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${SERVER_IP}/chatting/chats/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setChatData(response.data.chat);

      const receiver = response.data.chat.profiles.find(profile => profile.id !== currentProfileId);
      setReceiverProfile(receiver);
    } catch (error) {
      console.error("Error fetching chat data:", error);
      setError("Failed to fetch chat data");
    }
  }, [chatId, currentProfileId]);

  // WebSocket setup
  useEffect(() => {
    if (!chatId || !currentProfileId) return;

    const socketInstance = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatId}/`);

    socketInstance.onopen = () => console.log("WebSocket connection opened");
    socketInstance.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      fetchChatData();
    };
    socketInstance.onclose = () => console.log("WebSocket connection closed");
    socketInstance.onerror = (error) => console.error("WebSocket error:", error);

    return () => socketInstance.close();
  }, [chatId, currentProfileId, fetchChatData]);

  // Fetch chat data when chatId or currentProfileId changes
  useEffect(() => {
    fetchChatData();
  }, [chatId, currentProfileId, fetchChatData]);

  // PATCH request to mark messages as read when the component loads
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!chatId || !currentProfileId) return;

      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.patch(`http://127.0.0.1:8000/chatting/readedmessages/${chatId}/update/`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Messages marked as read:', response.data);
        setCreatedMessage(false);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markMessagesAsRead();
  }, [chatId, currentProfileId, CreatedMessage]);

  // Adjust textarea height on input
  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    adjustHeight();

    const textarea = textareaRef.current;
    textarea.addEventListener('input', adjustHeight);

    return () => textarea.removeEventListener('input', adjustHeight);
  }, []);

  // Scroll to the last message whenever chat data changes
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatData]);

  

  // Function to handle message send
  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!messageText.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${SERVER_IP}/chatting/chats/${chatId}/messages/create/`, {
        text: messageText,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessageText('');
      setCreatedMessage(true);
      fetchChatData();
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  // Split messages into read and unread
  const unreadMessages = chatData ? chatData.messages.filter(message => !message.is_read && message.sender !== currentProfileId) : [];
  const readMessages = chatData ? chatData.messages.filter(message => !unreadMessages.includes(message)) : [];


  useEffect(() => {
    if (unreadMessages.length > 0 && unreadMessagesRef.current) {
      unreadMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [unreadMessages]);

  
  return (
    <div className='conversation'>
      <div className="heading">
        <a className='prof-navigate' href="my-profile/profile-page.html">
          <div className="heading-avatar">
            <div className="heading-avatar-icon">
              {chatData && receiverProfile && (
                <img 
                  src={receiverProfile.profile_picture ? `${SERVER_IP}${receiverProfile.profile_picture}` : profile_avatar} 
                  alt="profile avatar" 
                />
              )}
            </div>
          </div>
          <div className='conversation-name'>
            <span>{receiverProfile ? `${receiverProfile.user.first_name} ${receiverProfile.user.last_name}` : "Loading..."}</span>
          </div>
        </a>
      </div>

      <div className='messages'>
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            {readMessages.length > 0 && (
              <>
                {readMessages.map((message, index) => (
                  <div 
                    className="message-body" 
                    key={message.id}
                    ref={index === readMessages.length - 1 ? lastMessageRef : null}
                  >
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
                ))}
              </>
            )}
            {unreadMessages.length > 0 && (
              <>
                <h3 ref={unreadMessagesRef}>Unread Messages ({unreadMessages.length})</h3>

                {unreadMessages.map((message, index) => (
                  <div 
                    className="message-body" 
                    key={message.id}
                    ref={index === 0 ? lastMessageRef : null}
                  >
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
                ))}
              </>
            )}
          </>
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
            id="message-textarea"
            name="message"
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
