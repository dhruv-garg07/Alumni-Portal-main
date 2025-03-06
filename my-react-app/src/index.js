import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StateProvider } from './StateContext';
import { BrowserRouter as Router } from 'react-router-dom';

console.log("Loaded ENV Variables:", JSON.stringify(process.env, null, 2));
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StateProvider>
    <Router>
      <App />
    </Router>
  </StateProvider>
  
);
