import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import setScreenHeight from './utils/setScreenHeight';
import { AuthProvider } from './context/AuthProvider';
import Loading from './components/Loading';

import './App.css';

const Signin = React.lazy(() => import('./pages/Signin'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Pending = React.lazy(() => import('./pages/Pending'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Admin = React.lazy(() => import('./pages/Admin'));
const AdminMembers = React.lazy(() => import('./pages/AdminMembers'));
const AdminDepartments = React.lazy(() => import('./pages/AdminDepartments'));
const AdminTeams = React.lazy(() => import('./pages/AdminTeams'));
const AdminAccount = React.lazy(() => import('./pages/AdminAccount'));
const AdminCard = React.lazy(() => import('./pages/AdminCard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const App = () => {
    React.useEffect(() => {
        setScreenHeight();
        window.addEventListener('resize', setScreenHeight);
        return () => window.removeEventListener('resize', setScreenHeight);
    }, []);
    
    return (
        <AuthProvider>
            <Suspense fallback={<Loading />}>
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

                        <Route path="/transactions" element={
                            <ProtectedRoute>
                                <Transactions />
                            </ProtectedRoute>
                        } />

                        {/* 관리자만 접근 가능 */}
                        <Route path="/admin" element={
                            <ProtectedRoute requiredRoles={['admin']}>
                                <Admin />
                            </ProtectedRoute>
                        } />

                        {/* 관리자와 인사관리자 접근 가능 */}
                        <Route path="/admin/members" element={
                            <ProtectedRoute requiredRoles={['admin', 'hr_admin']}>
                                <AdminMembers />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/departments" element={
                            <ProtectedRoute requiredRoles={['admin', 'hr_admin']}>
                                <AdminDepartments />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/teams" element={
                            <ProtectedRoute requiredRoles={['admin', 'hr_admin']}>
                                <AdminTeams />
                            </ProtectedRoute>
                        } />

                        {/* 관리자와 경지관리자 접근 가능 */}
                        <Route path="/admin/account" element={
                            <ProtectedRoute requiredRoles={['admin', 'ms_admin']}>
                                <AdminAccount />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/card" element={
                            <ProtectedRoute requiredRoles={['admin', 'ms_admin']}>
                                <AdminCard />
                            </ProtectedRoute>
                        } />
                        
                        {/* catch all */}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </AuthProvider>
    );
};

export default App;
