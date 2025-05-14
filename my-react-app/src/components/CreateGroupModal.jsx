import { useState, useEffect, useMemo } from "react";
import {
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "../firebase";

const CreateGroupModal = ({ connections, onClose, currentUser }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [detailedConnections, setDetailedConnections] = useState([]);

  // ⬇️ Fetch full user info once
  useEffect(() => {
    if (connections.length === 0) {
      setDetailedConnections([]);
      return;
    }

    const fetchDetails = async () => {
      const collectionsToSearch = ["Users", "Professors", "admin"];

      const getProfile = async (userName) => {
        for (const coll of collectionsToSearch) {
          const q = query(collection(db, coll), where("userName", "==", userName));
          const snap = await getDocs(q);
          if (!snap.empty) return snap.docs[0].data();
        }
        return {}; // fallback
      };

      const enriched = await Promise.all(
        connections.map(async (conn) => {
          const profile = await getProfile(conn.userName);
          return { ...conn, ...profile };
        })
      );

      setDetailedConnections(enriched);
    };

    fetchDetails();
  }, [connections]);

  // ⬇️ Filtering enriched connections
  const filteredConnections = useMemo(() => {
    return detailedConnections.filter((user) => {
      return (
        (!collegeFilter || user.college?.toLowerCase().includes(collegeFilter.toLowerCase())) &&
        (!yearFilter || user.joiningYear?.toString().includes(yearFilter))
      );
    });
  }, [detailedConnections, collegeFilter, yearFilter]);

  const allVisibleSelected = filteredConnections.every((u) => selectedUsers.includes(u.userName));

  if (!currentUser) return null;

  const toggleUserSelection = (userName) => {
    setSelectedUsers((prev) =>
      prev.includes(userName) ? prev.filter((u) => u !== userName) : [...prev, userName]
    );
  };

  const handleSelectAll = () => {
    const visibleUsernames = filteredConnections.map((u) => u.userName);
    const allSelected = visibleUsernames.every((u) => selectedUsers.includes(u));

    if (allSelected) {
      setSelectedUsers((prev) => prev.filter((u) => !visibleUsernames.includes(u)));
    } else {
      const newSelections = new Set([...selectedUsers, ...visibleUsernames]);
      setSelectedUsers([...newSelections]);
    }
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
        admin: currentUser.userName,
      });

      alert("Group created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

        <input
          type="text"
          placeholder="Enter Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Filter by College"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="p-2 border rounded w-1/2"
          />
          <input
            type="text"
            placeholder="Filter by Joining Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="p-2 border rounded w-1/2"
          />
        </div>

        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={handleSelectAll}
            className="cursor-pointer mr-2"
          />
          <span>Select All</span>
        </div>

        <div className="max-h-40 overflow-auto border p-2 rounded">
          {filteredConnections.map((user) => (
            <label key={user.userName} className="flex items-center space-x-2 p-1">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.userName)}
                onChange={() => toggleUserSelection(user.userName)}
                className="cursor-pointer"
              />
              <span>{user.name} <span className="text-sm text-gray-500">({user.college}, {user.joiningYear})</span></span>
            </label>
          ))}
          {filteredConnections.length === 0 && (
            <p className="text-gray-500 text-sm">No users match the filters.</p>
          )}
        </div>

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
