import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
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

                     {/* protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
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
