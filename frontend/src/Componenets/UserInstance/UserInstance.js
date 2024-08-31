
// import React from 'react';
// import './UserInstance.css'

// function UserInstance({ user }) {
//   return (
//     <div className='userInstance'>
//       <div className="sideBar-avatar">
//         <a href={user.link}>
//           <div className="avatar-icon">
//             <img src={user.avatar} alt={user.name}/>
//           </div>
//         </a>
//       </div>
//       <div className="sideBar-main">
//         <div className="sideBar-name">
//           <span className="name-meta">
//             {user.name}
//           </span>
//         </div>
//         <div className="sideBar-time">
//           <span className="time-meta">
//             {user.time}
//           </span>
//         </div>

//         <div>
//           <button>Chat</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserInstance;


import React from 'react';
import './UserInstance.css';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

function UserInstance({ user, onChatClick }) {
  return (
    <div className='userInstance'>
      <div className="sideBar-avatar">
        <a href={user.link}>
          <div className="avatar-icon">
            <img src={user.avatar} alt={user.name}/>
          </div>
        </a>
      </div>
      <div className="sideBar-main">
        <div className="sideBar-name">
          <span className="name-meta">
            {user.name}
          </span>
        </div>
        <div className="sideBar-time">
          <span className="time-meta">
            {user.time}
          </span>
        </div>

        <div className="sideBar-chat">
          <button onClick={() => onChatClick(user.id)}><IoChatbubbleEllipsesOutline /></button> 
        </div>
      </div>
    </div>
  );
}

export default UserInstance;
