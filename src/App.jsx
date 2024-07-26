import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import statement
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import KanbanBoard from './components/KanbanBoard';
import Navbar from './components/Navbar';
import Layout from './components/Layout';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.username;
  } catch (error) {
    console.error('Failed to decode token:', error.message);
    return null;
  }
};

const AppContent = () => {
  const location = useLocation();
  const noNavbarPaths = ['/login', '/register' , '/Register' ,'/Login' ];
  const [userAccess, setUserAccess] = useState(null);
  const [userIdtemp, setUserIdtemp] = useState(null);
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchData = async (userId) => {
      try {
        const response = await axios.get('http://localhost:5000/admindetails', {
          params: { username: userId },
        });
        setUserIdtemp(response.data[0].id);
        setUserAccess(response.data[0].access);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (userId) {
      fetchData(userId);
    }
  }, [userId]);

  return (
    <>
      {!noNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated() ? (
              <Layout>
                <KanbanBoard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
