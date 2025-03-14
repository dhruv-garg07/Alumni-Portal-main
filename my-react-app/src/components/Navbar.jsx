import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom"; 
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path
  const [activeTab, setActiveTab] = useState(location.pathname); // Track active tab
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Update active tab whenever the route changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out user
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Left - Portal Title */}
      <h1 className="text-2xl font-bold text-gray-800">
        <Link to="/" className="hover:underline">Faculty Portal</Link>
      </h1>

      {/* Center - Search Bar */}
      <div className="relative flex items-center w-1/3">
        <span className="absolute left-3 text-gray-500">🔍</span>
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Right - Navigation */}
      <div className="flex items-center space-x-6 text-gray-700">
        <button 
          onClick={() => navigate("/messages")}
          className={`px-3 py-1 rounded ${activeTab === "/messages" ? "bg-gray-200 text-gray-900 font-semibold" : "hover:text-blue-500"}`}
        >
          Messages
        </button>

        <button 
          onClick={() => navigate("/profile")}
          className={`px-3 py-1 rounded ${activeTab === "/profile" ? "bg-gray-200 text-gray-900 font-semibold" : "hover:text-blue-500"}`}
        >
          Profile
        </button>

        <button 
          onClick={handleLogout} 
          className="text-gray-600 hover:text-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
