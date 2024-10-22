import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);   

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            setDeferredPrompt(null);
            });
        }
    };

    return (
        <>
            <Header />
            <div className='flex flex-col w-full'>  
                {user.role === ('super_admin') ? (
                    <div className='p-8'>
                        <p>{user.role}</p>
                    </div>
                ) : (
                    <div className='h-full bg-white dark:bg-slate-800'>
                        <CardBalance role={user.role} />
                        <PayHistory />
                    </div>
                ) }
                <div className='fixed bottom-4 right-8'>
                    <button onClick={handleInstallClick}>Install App</button>
                </div>
            </div>
            
        </>
    );
};

export default Dashboard;
