import React from 'react';
import './Users.css';
import profile_avatar from "../../images/profile.png";
import avatar1 from "../../images/avatar1.png";
import avatar2 from "../../images/avatar2.png";
import avatar3 from "../../images/avatar3.png";
import avatar4 from "../../images/avatar4.png";
import avatar5 from "../../images/avatar5.png";
import avatar6 from "../../images/avatar6.png";
import UserInstance from '../UserInstance/UserInstance';

// Define user data
const users = [
  { id: 1, name: 'Mohgammed Hashesho', avatar: avatar1, time: '10:18', link: 'chats/chat.html' },
  { id: 2, name: 'Yasser Husaan', avatar: avatar2, time: '11:20', link: 'chats/chat.html' },
  { id: 3, name: 'Ahmmed Baraka', avatar: avatar3, time: '12:15', link: 'chats/chat.html' },
  { id: 4, name: 'Ali Jasem', avatar: avatar4, time: '13:30', link: 'chats/chat.html' },
  { id: 5, name: 'Dr Omer', avatar: avatar5, time: '14:45', link: 'chats/chat.html' },
  { id: 6, name: 'Sadeq', avatar: avatar6, time: '15:00', link: 'chats/chat.html' },
];

function Users() {
  return (
    <div className='users'>
      <div className="heading">
        <div className="heading-avatar">
          <div className="heading-avatar-icon">
            <a href="my-profile/profile-page.html"> 
              <img src={profile_avatar} alt='profile avatar'/>
            </a>
          </div>
        </div>
      </div>
      <div className="searchBox">
        <div className="searchBox-input">
          <input id="searchText" type="text" name="searchText" placeholder="Search"/>
        </div>
      </div>

      <div className='user-list'>
        {users.map(user => (
          <UserInstance key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Users;
