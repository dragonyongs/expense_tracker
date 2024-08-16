import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import { AuthProvider } from './context/AuthProvider';

import './App.css';

const App = () => {

    return (
        <AuthProvider>
            <Routes>
                <Route path="/*" element={<Layout />}>
                    <Route path="login" element={<Login />} />
                    
                    {/* catch all */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
};

export default App;
