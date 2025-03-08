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
  apiKey: "AIzaSyChbTQJadFpP5QSRC4JqS9wuB8qW8yrRCA",
  authDomain: "faculty-portal-70a87.firebaseapp.com",
  projectId: "faculty-portal-70a87",
  storageBucket: "faculty-portal-70a87.appspot.com",
  messagingSenderId: "314100072760",
  appId: "1:314100072760:web:46810a1b401f504b8941cd",
  measurementId: "G-RK4QB8XNTR"
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
