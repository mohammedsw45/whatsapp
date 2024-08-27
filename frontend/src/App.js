import './App.css';
import Home from './Componenets/Home/Home';
import Login from './Componenets/Login/Login';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken'); // For example, check for an auth token
};

function App() {
  return (
    <Router>
      <Routes>
        {/* If the user is logged in, redirect to home, else show the login page */}
        <Route 
          path="/login" 
          element={isLoggedIn() ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/" 
          element={isLoggedIn() ? <Home /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
