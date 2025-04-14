import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-6xl flex gap-6">
        
        {/* Sidebar */}
        <div className="w-1/4 bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Need Help?</h2>
          <ul className="space-y-3">
            {/* Contact Us Section in Sidebar */}
            <li>
              <h3 className="text-lg font-semibold text-gray-600">Contact Us</h3>
              <p className="text-gray-500">Get in touch with our support team for assistance.</p>
              <div className="mt-4">
                <p className="text-gray-600">
                  <strong>Email:</strong> support@facultyportal.com
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong> +1 234 567 890
                </p>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-800">Send us a message</button>
            </li>
          </ul>
        </div>

        {/* Main Section */}
        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Welcome to the Faculty Portal</h2>
          <p className="text-lg text-gray-500 mb-4">
            The Faculty Portal is your gateway to connecting with alumni and faculty members, creating meaningful connections, and building groups for collaborative efforts.
          </p>

    
          {/* FAQ Section */}
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-semibold text-gray-700">Who can create groups in the portal?</h4>
              <p className="text-gray-600">Only faculty members have the ability to create groups within the portal. These groups can be used to foster communication and collaboration among their connections.</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-semibold text-gray-700">How do I send a connection request to a faculty member?</h4>
              <p className="text-gray-600">To send a connection request to a faculty member, visit their profile and click on the "Send Connection Request" button. Faculty members can review and accept or decline these requests.</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-semibold text-gray-700">How can I manage my connection requests?</h4>
              <p className="text-gray-600">You can view and manage your connection requests in the "Connections" section of your profile. From there, you can accept or decline incoming requests.</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-semibold text-gray-700">What can I do if I receive a lot of connection requests?</h4>
              <p className="text-gray-600">You can filter connection requests based on different criteria and accept or decline them based on your preferences. This helps keep your network organized.</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h4 className="font-semibold text-gray-700">Can I send messages to my connections?</h4>
              <p className="text-gray-600">Yes, once a connection request is accepted, you can send private messages to that person. This allows for easy communication within the portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
