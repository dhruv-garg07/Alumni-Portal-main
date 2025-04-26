import { useState } from "react";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import {db} from "../firebase";  

const AddMembersModal = ({ selectedChat, connections, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (userName) => {
    setSelectedUsers((prev) =>
      prev.includes(userName)
        ? prev.filter((u) => u !== userName)
        : [...prev, userName]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user!");
      return;
    }

    try {
      const chatRef = doc(db, "groups", selectedChat.id);

      // Push each selected user into participants array
      selectedUsers.forEach(async (user) => {
        await updateDoc(chatRef, {
          participants: arrayUnion(user),
        });
      });

      alert("Members added!");
      onClose();
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  // Filter out users already in the group
  const availableConnections = connections.filter(
    (user) => !selectedChat.participants.includes(user.userName)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Add Members</h2>

        <div className="max-h-40 overflow-auto border p-2 rounded">
          {availableConnections.map((user) => (
            <label key={user.userName} className="flex items-center space-x-2 p-1">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.userName)}
                onChange={() => toggleUserSelection(user.userName)}
                className="cursor-pointer"
              />
              <span>{user.userName}</span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded mr-2">
            Cancel
          </button>
          <button onClick={handleAddMembers} className="px-4 py-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};


export default AddMembersModal;
