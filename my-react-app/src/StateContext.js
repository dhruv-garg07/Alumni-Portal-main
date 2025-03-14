// StateContext.js
import React, { createContext, useState } from 'react';

const StateContext = createContext();

export const StateProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);

  return (
    <StateContext.Provider value={{ isAdmin, setIsAdmin, isProfessor, setIsProfessor }}>
      {children}
    </StateContext.Provider>
  );
};

export default StateContext;
