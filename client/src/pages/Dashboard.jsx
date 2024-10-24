import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('beforeinstallprompt event fired'); // 로그 추가
        };
    
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
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

    const isAppInstalled = () => {
        // 일반적으로 iOS Safari에서 PWA가 설치된 경우
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    };

    return (
        <>
            <Header />
            <div className='flex flex-col w-full'>  
                {user.role === 'super_admin' ? (
                    <div className='p-8'>
                        <p>{user.role}</p>
                    </div>
                ) : (
                    <div className='h-full bg-white dark:bg-slate-800'>
                        <CardBalance role={user.role} />
                        <PayHistory />
                    </div>
                ) }
                {!isAppInstalled() && deferredPrompt && (
                    <div className='z-110 fixed bottom-24 right-6'>
                        <button 
                            onClick={handleInstallClick} 
                            className='py-2 px-4 rounded-full bg-white text-blue-600 border border-blue-100 shadow-md'>
                            Install App
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;
