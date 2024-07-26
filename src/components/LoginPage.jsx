import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, provider, signInWithPopup } from '../firebase';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(state?.message || '');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${backendUrl}/login`, formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard', { state: { message: 'Login successful' } });
      } else {
        setError('No token received from the server.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const { email } = result.user;

        // Send the user details to the backend
        const response = await axios.post(`${backendUrl}/google-login`, { email });
        if (response.data.token) {
            // Save the token and navigate
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard', { state: { message: response.data.message || 'Login successful' } });
        } else if (response.data.message) {
            // Show message from backend
            setError(response.data.message);
        }
    } catch (error) {
        console.error('Error during Google sign-in:', error.message || error);
        setError('Google sign-in failed. Please try other method.');
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {successMessage && (
          <div className="mb-4 text-green-500">
            {successMessage}
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="text-white bg-[#050708] hover:bg-[#050708]/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 me-2 mb-2 w-full justify-center"
          >
            Login
          </button>
        </form>
        <button
          type="button"
          className="text-black bg-white border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 me-2 mb-2 w-full justify-center"
          onClick={handleGoogleLogin}
        >
          <svg
            className="w-4 h-4 me-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 19"
          >
            <path
              fillRule="evenodd"
              d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
              clipRule="evenodd"
            />
          </svg>
          Sign in with Google
        </button>
        <p className="mt-4 text-center">
          Do not have an account?{' '}
          <Link to="TaskM/register" className="text-red-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
