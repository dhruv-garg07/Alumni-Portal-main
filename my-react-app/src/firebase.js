// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChbTQJadFpP5QSRC4JqS9wuB8qW8yrRCA",
  authDomain: "faculty-portal-70a87.firebaseapp.com",
  projectId: "faculty-portal-70a87",
  storageBucket: "faculty-portal-70a87.firebasestorage.app",
  messagingSenderId: "314100072760",
  appId: "1:314100072760:web:46810a1b401f504b8941cd",
  measurementId: "G-RK4QB8XNTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const auth = getAuth(app);

// Firestore
const db= getFirestore(app);

export {auth, db,storage};