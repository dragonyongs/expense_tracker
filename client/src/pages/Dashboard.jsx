import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';

const useFetchData = (fetchFunction) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await fetchFunction();
            setError(null);
        } catch (err) {
            setError(handleError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return { fetchData, isLoading, error };
};

const handleError = (error) => {
    if (error.response) {
        return error.response.data.message || "오류가 발생했습니다.";
    } else if (error.message) {
        return error.message || "오류가 발생했습니다.";
    } else if (error.request) {
        return "서버로부터 응답을 받지 못했습니다. 네트워크 문제일 수 있습니다.";
    } else {
        return "알 수 없는 오류가 발생했습니다.";
    }
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [cardBalance, setCardBalance] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [userCards, setUserCards] = useState([]);
    const [teamFund, setTeamFund] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [cacheNotification, setCacheNotification] = useState(''); // 캐시 알림 상태 추가

    const { fetchData: fetchTransactions, isLoading: isLoadingTransactions, error: transactionError } = useFetchData(async () => {
        const response = await axios.get(API_URLS.TRANSACTIONS);
        setTransactions(response.data);
    });

    const { fetchData: fetchUserCard, isLoading: isLoadingUserCard } = useFetchData(async () => {
        if (user?.member_id) {
            const response = await axios.get(`${API_URLS.CARD_MEMBER}/${user.member_id}`);
            if (response.data.length > 0) {
                const userCard = response.data[0];
                const currentBalanceWithRollover = userCard.balance + (userCard.rollover_amount || 0) + (userCard.team_fund || 0);
                setCurrentBalance(currentBalanceWithRollover);
                setUserCards(response.data);
                setCardBalance(userCard.balance || 0);
                setTeamFund(userCard.team_fund || 0);
            }
        }
    });

    // 서비스 워커 메시지 수신
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === "CACHE_USED") {
                    setCacheNotification(`캐시된 데이터를 사용 중입니다: ${event.data.url}`);
                }
            });
        }
    }, []);

    // 캐시 알림 자동 숨김
    useEffect(() => {
        if (cacheNotification) {
            const timer = setTimeout(() => setCacheNotification(''), 5000); // 5초 후 알림 사라짐
            return () => clearTimeout(timer);
        }
    }, [cacheNotification]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        fetchUserCard();
    }, [user?.member_id]);

    const handleSaveTransaction = async (newTransaction) => {

        const transactionData = {
            card_id: newTransaction.card_id,
            expense_card: newTransaction.expense_card,
            expense_type: newTransaction.expense_type,
            merchant_name: newTransaction.merchant_name,
            menu_items: newTransaction.menu_items || [],
            transaction_type: "expense",
            transaction_amount: newTransaction.transaction_amount,
            transaction_date: newTransaction.transaction_date,
            is_deducted: false,
        };

        try {
            if (newTransaction._id) {
                await axios.put(`${API_URLS.TRANSACTIONS}/${newTransaction._id}`, transactionData);
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }

            await fetchTransactions();
            await fetchUserCard(); 
        } catch (error) {
            console.error("handleSaveTransaction-Error saving transaction:", error);
            setErrMsg(handleError(error));
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            await axios.delete(`${API_URLS.TRANSACTIONS}/${transactionId}`);
    
            await fetchTransactions();
            await fetchUserCard();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            setErrMsg(handleError(error));
        }
    };

    return (
        <>
            <Header />
            <div className='flex flex-col w-full'>  
                {cacheNotification && (
                    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded shadow-md">
                        {cacheNotification}
                    </div>
                )}
                {user.role === 'super_admin' ? (
                    <div className='p-8'>
                        <p>{user.role}</p>
                    </div>
                ) : (
                    <div className='h-full bg-white dark:bg-slate-800'>
                        <CardBalance
                            onSave={handleSaveTransaction}
                            onDelete={handleDeleteTransaction}
                            currentBalance={currentBalance}
                            teamFund={teamFund}
                            userCards={userCards}
                            cardBalance={cardBalance}
                            errMsg={errMsg}
                            // setErrMsg={setErrMsg}
                        />
                        <PayHistory
                            transactions={transactions}
                            onDelete={handleDeleteTransaction}
                            userCards={userCards}
                            isLoading={isLoadingTransactions || isLoadingUserCard}
                            errMsg={errMsg}
                            setErrMsg={setErrMsg}
                        />
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