import { useState } from "react";
import {
    db,
    collection, 
    addDoc, 
    
} from "../firebase";  

const CreateGroupModal = ({ connections, onClose, currentUser}) => {
 
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  if (!currentUser) return null;

  const toggleUserSelection = (userName) => {
    setSelectedUsers((prev) =>
      prev.includes(userName)
        ? prev.filter((u) => u !== userName) // Remove if already selected
        : [...prev, userName] // Add if not selected
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty!");
      return;
    }
    if (selectedUsers.length === 0) {
      alert("Please select at least one participant.");
      return;
    }

    const participants = [...selectedUsers, currentUser.userName];

    try {
      await addDoc(collection(db, "groups"), {
        name: groupName,
        participants: participants,
        createdBy: currentUser.userName,
        createdAt: new Date(),
      });

      alert("Group created successfully!");
      onClose(); // Close modal
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

        {/* Group Name Input */}
        <input
          type="text"
          placeholder="Enter Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        {/* Participants List */}
        <div className="max-h-40 overflow-auto border p-2 rounded">
          {connections.map((user) => (
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
          <button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-500 text-white rounded">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
