import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Pending from './pages/Pending';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminMembers from './pages/AdminMembers';
import AdminDepartments from './pages/AdminDepartments.jsx';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import { AuthProvider } from './context/AuthProvider';

import './App.css';

const App = () => {

    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* public routes */}
                    <Route path="signin" element={<Signin />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="pending" element={<Pending />} />

                     {/* protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin/members" element={
                        <ProtectedRoute>
                            <AdminMembers />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/departments" element={
                        <ProtectedRoute>
                            <AdminDepartments />
                        </ProtectedRoute>
                    } />

                    {/* catch all */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
};

export default App;
