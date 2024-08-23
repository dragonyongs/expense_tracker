import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Pending from './pages/Pending';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminMembers from './pages/AdminMembers';
import AdminDepartments from './pages/AdminDepartments';
import AdminTeams from './pages/AdminTeams';
import AdminAccount from './pages/AdminAccount';
import AdminCard from './pages/AdminCard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import setScreenHeight from './utils/setScreenHeight';

import { AuthProvider } from './context/AuthProvider';

import './App.css';

const App = () => {

    React.useEffect(() => {
        setScreenHeight();
        
        window.addEventListener('resize', setScreenHeight);
        return () => window.removeEventListener('resize', setScreenHeight);
    }, []);
    
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

                    <Route path="/admin/teams" element={
                        <ProtectedRoute>
                            <AdminTeams />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/account" element={
                        <ProtectedRoute>
                            <AdminAccount />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/card" element={
                        <ProtectedRoute>
                            <AdminCard />
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
