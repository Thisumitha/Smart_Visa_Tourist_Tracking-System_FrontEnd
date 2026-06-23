import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

// A simple PrivateRoute wrapper to check if the user is authenticated
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('accessToken');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" />} />
                
                {/* Public Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Route */}
                <Route 
                    path="/admin" 
                    element={
                        <PrivateRoute>
                            <AdminDashboard />
                        </PrivateRoute>
                    } 
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
