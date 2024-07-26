import React, { useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const avatars = [
  '/assets/avatars/a1.jpg',
  '/assets/avatars/a2.jpg',
  '/assets/avatars/a3.jpg',
  '/assets/avatars/a4.jpg',
  '/assets/avatars/a5.jpg',
];

const AvatarSelector = ({ onSelect, onClose }) => {
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const handleConfirm = async () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);

      try {
        const token = localStorage.getItem("token");
        const { email } = jwtDecode(token); // Assuming email is used to identify the user
        await axios.post(`${backendUrl}/update-avatar`, {
          email,
          avatar: selectedAvatar,
        });
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Choose an Avatar</h2>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`relative w-20 h-20 rounded-full overflow-hidden cursor-pointer ${avatar === selectedAvatar ? 'border-gray-900 border-4' : 'border-transparent'} hover:border-gray-500 border-2`}
              onClick={() => setSelectedAvatar(avatar)}
            >
             <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirm}
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
       >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2"
            >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
