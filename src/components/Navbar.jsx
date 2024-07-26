import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AvatarSelector from "./AvatarSelector"; // Import the AvatarSelector component
const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log(backendUrl);


const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const email = decoded.email;
        setUserId(email);

        // Fetch the user's avatar from the server whenever the userId changes
        const fetchAvatar = async () => {
          try {
            const response = await axios.get(`${backendUrl}/admindetails`, {
              params: { username: email },
            });
            const avatar = response.data[0]?.avatar || '/default-avatar.png';
            setAvatar(avatar);
          } catch (error) {
            console.error("Error fetching avatar:", error);
            setAvatar('/default-avatar.png'); // Use default if error occurs
          }
        };

        fetchAvatar();

      } catch (error) {
        console.error("Failed to decode token:", error.message);
        setUserId(null); // Ensure userId is null if token is invalid
      }
    }
  }, [userId]);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };

  const openAvatarSelector = () => {
    setAvatarSelectorOpen(true);
  };

  const handleAvatarSelect = (selectedAvatar) => {
    setAvatar(selectedAvatar);
    setAvatarSelectorOpen(false);
    // Optionally, save the selected avatar to the server or local storage
  };

  const closeAvatarSelector = () => {
    setAvatarSelectorOpen(false);
  };

  return (
    <>
      <nav className="fixed w-full bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div className="px-3 py-3 xl:px-5 xl:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <a href="#" className="flex ms-2 md:me-auto">
                <img
                  src="./src/assets/image.png"
                  className="h-9 me-3"
                  alt="TaskM Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"></span>
              </a>
            </div>
            <div className="md:flex items-center justify-end rtl:justify-end">
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                aria-expanded={userMenuOpen}
                onClick={toggleUserMenu}
              >
                <span className="sr-only">Open user menu</span>
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white"
                  style={{ backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  aria-label="user photo"
                >
                  {!avatar && (
                    <span className="text-gray-500 text-lg">
                      {userId ? userId.charAt(0) + userId.charAt(1) : "??"}
                    </span>
                  )}
                </div>

              </button>
              {userMenuOpen && (
                <div
                  className="z-50 my-4 text-base bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-2 top-full mt-1"
                  id="user-dropdown"
                >
                  <div className="px-4 py-3">
                    <span className="block text-sm text-gray-900 dark:text-white">
                      User
                    </span>
                    <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                      {userId || "Guest"}
                    </span>
                  </div>
                  <ul className="py-2" aria-labelledby="user-menu-button">
                    <li>
                      <button
                        onClick={openAvatarSelector}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Choose Avatar
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {avatarSelectorOpen && (
        <AvatarSelector
          onSelect={handleAvatarSelect}
          onClose={closeAvatarSelector}
        />
      )}
    </>
  );
};

export default Navbar;
