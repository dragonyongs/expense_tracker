import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // iOS 디바이스 확인
        const checkIOSDevice = () => {
            const ua = window.navigator.userAgent;
            const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
            const webkit = !!ua.match(/WebKit/i);
            setIsIOS(iOS && webkit && !ua.match(/CriOS/i));
        };

        // PWA가 이미 설치되었는지 확인
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            if (isStandalone) {
                setInstalled(true);
            }
        };

        // 설치 가능 여부 확인
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        checkIOSDevice();
        checkInstalled();
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => setInstalled(true));
        
        // Cleanup function
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', () => setInstalled(true));
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            try {
                const result = await deferredPrompt.prompt();
                if (result.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    setIsInstallable(false);
                } else {
                    console.log('User dismissed the install prompt');
                }
                setDeferredPrompt(null);
            } catch (error) {
                console.error('Install prompt error:', error);
            }
        }
    };

    const renderInstallButton = () => {
        if (installed) {
            return null; // 이미 설치된 경우 버튼 숨김
        }

        if (isIOS) {
            return (
                <div className="fixed bottom-24 right-6 flex flex-col items-end">
                    <button className="py-2 px-4 rounded-full bg-white text-blue-600 border border-blue-100 shadow-md mb-2">
                        iOS 설치 방법
                    </button>
                    <div className="bg-white p-4 rounded-lg shadow-lg text-sm max-w-xs">
                        1. Safari 브라우저의 공유 버튼을 탭하세요<br/>
                        2. "홈 화면에 추가" 를 선택하세요<br/>
                        3. "추가"를 탭하세요
                    </div>
                </div>
            );
        }

        if (isInstallable) {
            return (
                <button 
                    onClick={handleInstallClick}
                    className="fixed bottom-24 right-6 py-2 px-4 rounded-full bg-white text-blue-600 border border-blue-100 shadow-md hover:bg-blue-50 transition-colors"
                >
                    앱 설치하기
                </button>
            );
        }

        return null;
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
                )}
                {renderInstallButton()}
            </div>
        </>
    );
};

export default Dashboard;


{/*
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



*/}