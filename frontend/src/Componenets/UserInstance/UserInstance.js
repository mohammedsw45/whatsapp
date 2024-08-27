
import React from 'react';
import './UserInstance.css'

function UserInstance({ user }) {
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
      </div>
    </div>
  );
}

export default UserInstance;
