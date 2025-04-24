// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,    
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

// Your Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDERxYtlo7_R5BUkDUPMw33IcVvLKhFtZw",
  authDomain: "faculty-portal-latest.firebaseapp.com",
  projectId: "faculty-portal-latest",
  storageBucket: "faculty-portal-latest.firebasestorage.app",
  messagingSenderId: "366849146115",
  appId: "1:366849146115:web:37b2ef3ee76788852b3d36",
  measurementId: "G-ZD9XR9CGF4"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Export Firebase services and functions
export { 
  auth, 
  db, 
  storage, 
  provider, 
  onAuthStateChanged,
  signInWithPopup, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,    
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  ref, 
  uploadBytes, 
  getDownloadURL 
};
