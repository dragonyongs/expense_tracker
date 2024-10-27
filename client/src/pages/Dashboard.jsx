import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installState, setInstallState] = useState({
        isIOS: false,
        isSafari: false,
        isChrome: false,
        isStandalone: false,
        showInstallPrompt: false
    });

    useEffect(() => {
        // 브라우저 및 플랫폼 감지
        const detectBrowser = () => {
            const ua = window.navigator.userAgent;
            const iOS = /iPad|iPhone|iPod/.test(ua);
            const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
            const isChrome = /Chrome/.test(ua);
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                               window.navigator.standalone || 
                               document.referrer.includes('android-app://');

            setInstallState({
                isIOS: iOS,
                isSafari: isSafari,
                isChrome: isChrome,
                isStandalone: isStandalone,
                showInstallPrompt: !isStandalone && (
                    (iOS && isSafari) || // iOS Safari
                    (!iOS && !deferredPrompt) // 기타 브라우저
                )
            });
        };

        detectBrowser();

        // Android Chrome 설치 프롬프트 감지
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setInstallState(prev => ({
                ...prev,
                showInstallPrompt: true
            }));
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 설치 상태 변경 감지
        window.matchMedia('(display-mode: standalone)').addListener((e) => {
            setInstallState(prev => ({
                ...prev,
                isStandalone: e.matches
            }));
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    setInstallState(prev => ({
                        ...prev,
                        showInstallPrompt: false
                    }));
                }
                setDeferredPrompt(null);
            } catch (error) {
                console.error('Install prompt error:', error);
            }
        }
    };

    const InstallButton = () => {
        const { isIOS, isSafari, showInstallPrompt, isStandalone } = installState;

        if (isStandalone) return null;

        // iOS Safari용 설치 안내
        if (isIOS && isSafari && showInstallPrompt) {
            return (
                <div className="fixed bottom-24 right-6 flex flex-col items-end z-50">
                    <button className="py-2 px-4 rounded-full bg-blue-600 text-white shadow-md mb-2">
                        앱 설치하기
                    </button>
                    <div className="bg-white p-4 rounded-lg shadow-lg text-sm max-w-xs border border-gray-200">
                        <p className="font-bold mb-2">설치 방법</p>
                        <ol className="space-y-2">
                            <li>1. 하단의 <span className="inline-block w-6 h-6 align-middle bg-contain bg-no-repeat bg-center" style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxsaW5lIHgxPSIyMiIgeTE9IjIiIHgyPSIxMSIgeTI9IjEzIj48L2xpbmU+PHBvbHlnb24gcG9pbnRzPSIyMiAyIDEwIDEwIDIwIDIwIDIyIDIiPjwvcG9seWdvbj48L3N2Zz4=')}}"
                            /> 공유 버튼을 탭하세요</li>
                            <li>2. 스크롤을 내려서 <strong>"홈 화면에 추가"</strong>를 선택하세요</li>
                            <li>3. "추가"를 탭하면 설치가 완료됩니다</li>
                        </ol>
                    </div>
                </div>
            );
        }

        // Android Chrome 등 기타 브라우저용 설치 버튼
        if (!isIOS && showInstallPrompt) {
            return (
                <button 
                    onClick={handleInstallClick}
                    className="fixed bottom-24 right-6 py-2 px-4 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors z-50"
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
                {user.role === 'super_admin' ? (
                    <div className='p-8'>
                        <p>{user.role}</p>
                    </div>
                ) : (
                    <div className='h-full bg-white dark:bg-slate-800'>
                        <CardBalance role={user.role} />
                        <PayHistory />
                    </div>
                )}
                <InstallButton />
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