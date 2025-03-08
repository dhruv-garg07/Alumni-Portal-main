import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navbar */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold">Faculty Portal System</h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/messages")} className="p-2 bg-blue-500 text-white rounded">Messages</button>
          <button onClick={() => navigate("/profile")} className="p-2 bg-gray-500 text-white rounded">Profile</button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* Posts Section */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          <div className="bg-white p-4 shadow-md rounded">
            <h3 className="text-lg font-bold text-yellow-600">How to build a gaming laptop</h3>
            <p className="text-sm text-gray-700">Post by Alumni Amar Dubal</p>
            <p className="mt-2 text-gray-600">The first argument is the singular name of the collection your model is for...</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white p-4 shadow-md rounded">
          <h2 className="text-xl font-semibold">Quick Links</h2>
          <ul className="mt-2 space-y-2">
            <li><button onClick={() => navigate("/announcements")} className="text-blue-500">Recent Announcements</button></li>
            <li><button onClick={() => navigate("/events")} className="text-blue-500">Upcoming Events</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
