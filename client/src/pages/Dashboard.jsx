import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0); // 초기 잔액 설정
    const [isLoading, setIsLoading] = useState(true);
    const [userCards, setUserCards] = useState([]);
    const [teamFund, setTeamFund] = useState(0);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(API_URLS.TRANSACTIONS);
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTransactions();
    }, []);

    const handleSaveTransaction = (newTransaction) => {
        const transactionWithKey = { ...newTransaction, _id: newTransaction._id || Date.now() };

        // 트랜잭션 추가
        setTransactions((prevTransactions) => [transactionWithKey, ...prevTransactions]);

        // 잔액 업데이트
        const transactionAmount = transactionWithKey.transaction_amount || 0;

        setCurrentBalance((prevBalance) => prevBalance - transactionAmount);
    };
    
    // 카드 잔액과 관련된 데이터 가져오기
    useEffect(() => {
        const fetchUserCard = async () => {
            if (user?.member_id) {
                try {
                    const response = await axios.get(`${API_URLS.CARD_MEMBER}/${user.member_id}`);
                    if (response.data.length > 0) {
                        const userCard = response.data[0];
                        const currentBalanceWithRollover = userCard.balance + (userCard.rollover_amount || 0) + (userCard.team_fund || 0);
                        setCurrentBalance(currentBalanceWithRollover);
                        setUserCards(response.data); // 카드 정보 저장
                        setTeamFund(userCard.team_fund || 0); // 팀 펀드 저장
                    }
                } catch (error) {
                    console.error('Error fetching user card data:', error);
                }
            }
        };

        fetchUserCard();
    }, [user?.member_id]); // 사용자 member_id가 변경될 때마다 다시 실행

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
                        <CardBalance
                            onSave={handleSaveTransaction}
                            currentBalance={currentBalance} // 부모에서 계산된 카드 잔액
                            teamFund={teamFund} // 팀 펀드
                            userCards={userCards} // 카드 정보
                        />

                        <PayHistory transactions={transactions} isLoading={isLoading} />
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;

    // import { IoShareOutline } from "react-icons/io5";

    {/* <InstallButton /> */}
    // const [deferredPrompt, setDeferredPrompt] = useState(null);
    // const [installState, setInstallState] = useState({
    //     isIOS: false,
    //     isSafari: false,
    //     isChrome: false,
    //     isStandalone: false,
    //     showInstallPrompt: false,
    // });

    // useEffect(() => {
    //     const detectBrowser = () => {
    //         const ua = window.navigator.userAgent;
    //         const iOS = /iPad|iPhone|iPod/.test(ua);
    //         const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    //         const isChrome = /Chrome/.test(ua);
    //         const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
    //                             window.navigator.standalone || 
    //                             document.referrer.includes('android-app://');

    //         setInstallState({
    //             isIOS: iOS,
    //             isSafari: isSafari,
    //             isChrome: isChrome,
    //             isStandalone: isStandalone,
    //             showInstallPrompt: !isStandalone && (iOS || deferredPrompt !== null),
    //         });
    //     };

    //     detectBrowser();

    //     const handleBeforeInstallPrompt = (e) => {
    //         e.preventDefault();
    //         setDeferredPrompt(e);
    //         setInstallState(prev => ({
    //             ...prev,
    //             showInstallPrompt: true,
    //         }));
    //     };

    //     window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    //     window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    //         setInstallState(prev => ({
    //             ...prev,
    //             isStandalone: e.matches,
    //         }));
    //     });

    //     return () => {
    //         window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    //     };
    // }, [deferredPrompt]);

    // const handleInstallClick = async () => {
    //     if (deferredPrompt) {
    //         try {
    //             await deferredPrompt.prompt();
    //             const result = await deferredPrompt.userChoice;
    //             if (result.outcome === 'accepted') {
    //                 console.log('User accepted the install prompt');
    //                 setInstallState(prev => ({
    //                     ...prev,
    //                     showInstallPrompt: false,
    //                 }));
    //             }
    //             setDeferredPrompt(null);
    //         } catch (error) {
    //             console.error('Install prompt error:', error);
    //         }
    //     }
    // };

    // const InstallButton = () => {
    //     const { isIOS, isSafari, showInstallPrompt, isStandalone } = installState;

    //     if (isStandalone) return null;

    //     if (isIOS && isSafari && showInstallPrompt) {
    //         return (
    //             <div className="fixed bottom-24 right-6 flex flex-col items-end z-50">
    //                 <button className="py-2 px-4 rounded-full bg-blue-600 text-white shadow-md mb-2">
    //                     앱 설치하기
    //                 </button>
    //                 <div className="bg-white p-4 rounded-lg shadow-lg text-sm max-w-xs border border-gray-200">
    //                     <p className="font-bold mb-2">설치 방법</p>
    //                     <ol className="space-y-2">
    //                         <li className="flex items-center gap-2">
    //                             <IoShareOutline className="w-5 h-5" />
    //                             공유 버튼을 탭하세요
    //                         </li>
    //                         <li>스크롤을 내려서 <strong>&quot;홈 화면에 추가&quot;</strong>를 선택하세요</li>
    //                         <li>&quot;추가&quot;를 탭하면 설치가 완료됩니다</li>
    //                     </ol>
    //                 </div>
    //             </div>
    //         );
    //     }

    //     if (!isIOS && !isSafari && showInstallPrompt) {
    //         return (
    //             <button 
    //                 onClick={handleInstallClick}
    //                 className="fixed bottom-24 right-6 py-2 px-4 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors z-50"
    //             >
    //                 앱 설치하기
    //             </button>
    //         );
    //     }

    //     return null;
    // };