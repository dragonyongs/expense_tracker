import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import setScreenHeight from './utils/setScreenHeight';
import { AuthProvider } from './context/AuthProvider';
import Loading from './components/Loading';
import { AvatarProvider } from './context/AvatarContext';
import { MobileProvider } from './context/MobileContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { ThemeProvider } from './context/ThemeColorContext';
import debounce from 'lodash.debounce';

import './App.css';

const NewSignin = React.lazy(() => import('./pages/NewSignin'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Pending = React.lazy(() => import('./pages/Pending'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Teams = React.lazy(() => import('./pages/Teams'));
const Approval = React.lazy(() => import('./pages/approval/Index'));
const Contacts = React.lazy(() => import('./pages/Contacts'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Admin = React.lazy(() => import('./pages/Admin'));
const AdminMembers = React.lazy(() => import('./pages/admin/AdminMembers'));
const AdminProfiles = React.lazy(() => import('./pages/AdminProfiles'));
const AdminDepartments = React.lazy(() => import('./pages/AdminDepartments'));
const AdminTeams = React.lazy(() => import('./pages/AdminTeams'));
const AdminAccount = React.lazy(() => import('./pages/AdminAccount'));
const AdminCard = React.lazy(() => import('./pages/AdminCard'));
const AdminDeposit = React.lazy(() => import('./pages/AdminDeposit'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const ProtectedRouteWrapper = ({ roles, children }) => (
    <ProtectedRoute requiredRoles={roles}>{children}</ProtectedRoute>
);

const Providers = ({ children }) => (
    <AuthProvider>
        <MobileProvider>
            <DarkModeProvider>
                <ThemeProvider>
                    <AvatarProvider>{children}</AvatarProvider>
                </ThemeProvider>
            </DarkModeProvider>
        </MobileProvider>
    </AuthProvider>
);

const App = () => {
    useEffect(() => {
        const registerServiceWorker = async () => {
            if (!('serviceWorker' in navigator)) return;

            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.debug('Service Worker registered:', registration.scope);
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        };

        registerServiceWorker();
    }, []);

    useEffect(() => {
        const handleResize = debounce(() => setScreenHeight(), 100);
        setScreenHeight();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Providers>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* Public routes */}
                        <Route path="signin" element={<NewSignin />} />
                        <Route path="signup" element={<Signup />} />
                        <Route path="pending" element={<Pending />} />

                        {/* Protected routes */}
                        <Route path="/" element={<ProtectedRouteWrapper><Dashboard /></ProtectedRouteWrapper>} />
                        <Route path="/transactions" element={<ProtectedRouteWrapper><Transactions /></ProtectedRouteWrapper>} />
                        <Route path="/teams" element={<ProtectedRouteWrapper><Teams /></ProtectedRouteWrapper>} />
                        <Route path="/approval" element={<ProtectedRouteWrapper><Approval /></ProtectedRouteWrapper>} />
                        <Route path="/contacts" element={<ProtectedRouteWrapper><Contacts /></ProtectedRouteWrapper>} />
                        <Route path="/profile" element={<ProtectedRouteWrapper><Profile /></ProtectedRouteWrapper>} />

                        {/* Admin routes */}
                        <Route path="/admin" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'hr_admin', 'ms_admin']}><Admin /></ProtectedRouteWrapper>} />
                        <Route path="/admin/members" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'hr_admin']}><AdminMembers /></ProtectedRouteWrapper>} />
                        <Route path="/admin/profiles" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'hr_admin']}><AdminProfiles /></ProtectedRouteWrapper>} />
                        <Route path="/admin/departments" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'hr_admin']}><AdminDepartments /></ProtectedRouteWrapper>} />
                        <Route path="/admin/teams" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'hr_admin']}><AdminTeams /></ProtectedRouteWrapper>} />
                        <Route path="/admin/account" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'ms_admin']}><AdminAccount /></ProtectedRouteWrapper>} />
                        <Route path="/admin/card" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'ms_admin']}><AdminCard /></ProtectedRouteWrapper>} />
                        <Route path="/admin/deposit" element={<ProtectedRouteWrapper roles={['super_admin', 'admin', 'ms_admin']}><AdminDeposit /></ProtectedRouteWrapper>} />

                        {/* Catch all */}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </Providers>
    );
};

export default App;
