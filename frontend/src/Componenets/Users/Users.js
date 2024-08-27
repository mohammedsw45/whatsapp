// // export default Users;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './Users.css';
// import profile_avatar from "../../images/profile.png";
// import UserInstance from '../UserInstance/UserInstance';

// function Users() {
//   const [users, setUsers] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Retrieve token from local storage
//     const token = localStorage.getItem('accessToken');

//     if (!token) {
//       setError("No access token found. Please log in.");
//       return;
//     }

//     // Fetch user data from the API using Axios
//     axios.get('http://192.168.104.65:8000/account/profiles/', {
//       headers: {
//         'Authorization': `Bearer ${token}` // Add Bearer token to headers
//       }
//     })
//     .then(response => {
//       // Update the state with the profiles from the API response
//       setUsers(response.data.profiles);
//     })
//     .catch(error => {
//       // Handle error
//       console.error("Error fetching data:", error);
//       setError("Failed to fetch user data");
//     });
//   }, []); // No dependency on token; it'll be read fresh on each render

//   return (
//     <div className='users'>
//       <div className="heading">
//         <div className="heading-avatar">
//           <div className="heading-avatar-icon">
//             <a href="my-profile/profile-page.html"> 
//               <img src={profile_avatar} alt='profile avatar'/>
//             </a>
//           </div>
//         </div>
//       </div>
//       <div className="searchBox">
//         <div className="searchBox-input">
//           <input id="searchText" type="text" name="searchText" placeholder="Search"/>
//         </div>
//       </div>

//       <div className='user-list'>
//         {error ? (
//           <p>{error}</p>
//         ) : users.length > 0 ? (
//           users.map(user => (
//             <UserInstance
//               key={user.id}
//               user={{
//                 id: user.user.id,
//                 name: `${user.user.first_name} ${user.user.last_name}`.trim() || user.user.username,
//                 avatar: user.profile_picture || profile_avatar, // Use the profile picture if available, else default avatar
//                 time: new Date(user.updated_at).toLocaleTimeString(), // Format the updated_at time
//                 link: 'chats/chat.html'
//               }}
//             />
//           ))
//         ) : (
//           <p>No users available</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Users;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';
import profile_avatar from "../../images/profile.png";
import UserInstance from '../UserInstance/UserInstance';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Retrieve token from local storage
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError("No access token found. Please log in.");
      return;
    }

    // Fetch user data from the API using Axios
    axios.get('http://192.168.104.65:8000/account/profiles/', {
      headers: {
        'Authorization': `Bearer ${token}` // Add Bearer token to headers
      }
    })
    .then(response => {
      // Update the state with the profiles from the API response
      setUsers(response.data.profiles);
      setFilteredUsers(response.data.profiles); // Initialize filtered users
    })
    .catch(error => {
      // Handle error
      console.error("Error fetching data:", error);
      setError("Failed to fetch user data");
    });
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    // Filter users based on the search text
    const filtered = users.filter(user => {
      const fullName = `${user.user.first_name} ${user.user.last_name}`.trim() || user.user.username;
      return fullName.toLowerCase().includes(searchText.toLowerCase());
    });
    setFilteredUsers(filtered);
  }, [searchText, users]); // Re-run the effect when searchText or users change

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
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserInstance
              key={user.id}
              user={{
                id: user.user.id,
                name: `${user.user.first_name} ${user.user.last_name}`.trim() || user.user.username,
                avatar: user.profile_picture || profile_avatar, // Use the profile picture if available, else default avatar
                time: new Date(user.updated_at).toLocaleTimeString(), // Format the updated_at time
                link: 'chats/chat.html'
              }}
            />
          ))
        ) : (
          <p>No users available</p>
        )}
      </div>
    </div>
  );
}

export default Users;
