import React from 'react'
import './Home.css'
import Users from '../Users/Users'
import Chat from '../Chat/Chat'
function Home() {
  return (
    <div className='container'>
        <Users/>
        <Chat/>
    </div>
  )
}

export default Home
