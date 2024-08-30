// import React from 'react';
// import PropTypes from 'prop-types';
// import './ChatInstance.css';

// function ChatInstance({ chat }) {
//   return (
//     <div className='ChatInstance'>
//       <div className="sideBar-avatar">
//           <div className="avatar-icon">
//             <img src={chat.avatar} alt={chat.name || 'Chat Avatar'} />
//           </div>
//       </div>
//       <div className="sideBar-main">
//         <div className="sideBar-name">
//           <span className="name-meta">
//             {chat.name}
//           </span>
//         </div>
//         <div className="sideBar-time">
//           <span className="time-meta">
//             {chat.time}
//           </span>
//         </div>
//         <div className="sideBar-num-notifications">
//           <span className="num-notifications">
//             10
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // PropTypes for validation
// ChatInstance.propTypes = {
//   chat: PropTypes.shape({
//     id: PropTypes.number,
//     name: PropTypes.string.isRequired,
//     avatar: PropTypes.string.isRequired,
//     time: PropTypes.string.isRequired,
//   }).isRequired
// };

// export default ChatInstance;


import React from 'react';
import PropTypes from 'prop-types';
import './ChatInstance.css';

function ChatInstance({ chat }) {
  return (
    <div className='ChatInstance'>
      <div className="sideBar-avatar">
        <div className="avatar-icon">
          <img src={chat.avatar} alt={chat.name || 'Chat Avatar'} />
        </div>
      </div>
      <div className="sideBar-main">
        <div className="sideBar-name">
          <span className="name-meta">
            {chat.name}
          </span>
        </div>
        <div className="sideBar-time">
          <span className="time-meta">
            {chat.time}
          </span>
        </div>
        <div className="sideBar-num-notifications">
          {chat.unread_messages_count > 0 && (
            <span className="num-notifications">
              {chat.unread_messages_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// PropTypes for validation
ChatInstance.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    unread_messages_count: PropTypes.number // Add this prop type
  }).isRequired
};

export default ChatInstance;
