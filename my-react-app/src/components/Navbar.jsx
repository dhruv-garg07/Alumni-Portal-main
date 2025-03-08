import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth } from "../firebase";



const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out user
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };


  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Portal Title */}
      <h1 className="text-2xl font-bold">
        <Link to="/" className="hover:underline">Faculty Portal</Link>
    </h1>

      {/* Navigation Buttons */}
      <div className="space-x-4">
        <button 
          onClick={() => navigate("/messages")} 
          className="p-2 bg-blue-500 text-white rounded"
        >
          Messages
        </button>
        <button 
          onClick={() => navigate("/profile")} 
          className="p-2 bg-gray-500 text-white rounded"
        >
          Profile
        </button>
        <button 
          onClick={handleLogout} 
          className="p-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
