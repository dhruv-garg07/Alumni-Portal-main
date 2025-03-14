import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="w-full max-w-6xl flex gap-6">
        
        {/* Sidebar */}
        <div className="w-1/4 bg-white p-4 shadow-md rounded">
          <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-3">
            <li>
              <button onClick={() => navigate("/announcements")} className="text-blue-500 hover:underline">
                Recent Announcements
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/events")} className="text-blue-500 hover:underline">
                Upcoming Events
              </button>
            </li>
          </ul>
        </div>

        {/* Main Section (Can be extended later if needed) */}
        <div className="flex-1 bg-white p-4 shadow-md rounded">
          <h2 className="text-xl font-semibold text-gray-700">Welcome to the Faculty Portal</h2>
          <p className="text-gray-500">Stay updated with announcements and events.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
