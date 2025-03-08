import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { auth } from './firebase'; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

const PrivateRoute = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // Stop loading once we get the user state
        });

        return () => unsubscribe(); // Cleanup listener when unmounted
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show loading state while checking auth
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
