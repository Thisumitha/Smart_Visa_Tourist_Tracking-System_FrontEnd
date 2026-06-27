import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ImmigrationDashboard from './pages/Immigration/ImmigrationDashboard';
import HotelDashboard from './pages/Hotel/HotelDashboard';
import AgencyDashboard from './pages/Agency/AgencyDashboard';

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
                
                {/* Protected Routes */}
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/admin/:tab" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/immigration" element={<PrivateRoute><ImmigrationDashboard /></PrivateRoute>} />
                <Route path="/immigration/:tab" element={<PrivateRoute><ImmigrationDashboard /></PrivateRoute>} />
                <Route path="/hotel" element={<PrivateRoute><HotelDashboard /></PrivateRoute>} />
                <Route path="/agency" element={<PrivateRoute><AgencyDashboard /></PrivateRoute>} />
                <Route path="/agency/:tab" element={<PrivateRoute><AgencyDashboard /></PrivateRoute>} />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
