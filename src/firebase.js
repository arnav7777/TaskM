import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyChoptvc-Pz5jCCbx_tdKM79mXSrDCUFTA",
  authDomain: "taskm-320b8.firebaseapp.com",
  projectId: "taskm-320b8",
  storageBucket: "taskm-320b8.appspot.com",
  messagingSenderId: "697989081528",
  appId: "1:697989081528:web:b8e05ffb2f2f5c258ac74d",
  measurementId: "G-00NQJ90CFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
