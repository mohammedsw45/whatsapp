import React, { useRef, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { FaRegSmile } from "react-icons/fa";
import avatar1 from "../../images/avatar1.png";
import './Chat.css';

function Chat() {
  const textareaRef = useRef(null);

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
              <img src={avatar1} alt='avatar1'/>
            </div>
          </div>
          <div className='conversation-name'>
            <span>Mohgammed Hashesho</span>
          </div>
        </a>
      </div>

      <div className='messages'>
        <div className="message-body">
          <div className="message-main-receiver">
            <div className="receiver">
              <div className="receiver-message-text">
                Hey, wasupp..! vgfgvb fff
              </div>
              <span className="message-time pull-right">
                8:56 pm
              </span>
            </div>
          </div>
        </div>

        <div className="message-body">
          <div className="message-main-sender">
            <div className="sender">
              <div className="sender-message-text">
                shopping...!
              </div>
              <span className="message-time pull-right">
                9:05 pm
              </span>
            </div>
          </div>
        </div>
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
