import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.js";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Fetch matching professors from Firestore
  const fetchSuggestions = async (queryText) => {
    if (!queryText.trim()) {
      setSuggestions([]); // Clear suggestions if input is empty
      return;
    }

    const q = query(
      collection(db, "Professors"),
      where("name", ">=", queryText),
      where("name", "<=", queryText + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);

    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setSuggestions(results);
  };

  // Debounce effect: Waits 500ms before fetching suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 100);

    return () => clearTimeout(delayDebounce); // Cleanup on re-run
  }, [searchQuery]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectProfessor = (professor) => {
    setSearchQuery(professor.name);
    setSuggestions([]); // Hide suggestions
    navigate(`/profile/${professor.name}`); // Navigate to profile
  };

  return (
    <div className="relative w-1/3">
      {/* Search Input */}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-500">🔍</span>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md">
          {suggestions.map((prof) => (
            <li
              key={prof.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectProfessor(prof)}
            >
              {prof.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
