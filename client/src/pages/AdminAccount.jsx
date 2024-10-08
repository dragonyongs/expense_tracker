import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import { API_URLS } from '../services/apiUrls';
import AdminHader from '../components/AdminHader';

const BANK_COLORS = {
    '하나': 'bg-emerald-700',
    'KB': 'bg-amber-600',
    '신한': 'bg-blue-700',
    '기업': 'bg-blue-800',
    '기타': 'bg-slate-800'
};

const AdminAccount = () => {
    const [accounts, setAccounts] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        fetchData(API_URLS.ACCOUNTS, setAccounts);
        fetchData(API_URLS.TEAMS, setTeams);
    }, []);

    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    const resetTransaction = () => ({
        account_number: '', bank_name: '', team_id: ''
    });

    const toggleDrawer = () => setIsOpen(prev => !prev);

    const handleAddAccount = () => {
        setSelectedAccount(resetTransaction());
        setIsEditing(false);
        setIsOpen(true);
    };

    // 수정 모드로 모달 열기
    const handleOpenDrawer = (accounts) => {
        setSelectedAccount(accounts);
        setIsEditing(true); // 수정 모드로 설정
        setIsOpen(true);
    };
    

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedAccount(resetTransaction());
    };

    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value; // 사용자가 선택한 status의 _id
        const selectedTeam = teams.find(team => team._id === selectedTeamId); // 선택한 status를 찾아서
    
        // selectedTeam이 존재하는지 확인
        if (!selectedTeam) {
            console.error('선택된 팀을 찾을 수 없습니다.');
            return;
        }
    
        // 선택된 상태가 있을 경우에만 selectedTeam 업데이트
        setSelectedAccount({
            ...selectedAccount,
            team_id: {
                _id: selectedTeam._id,  // 정확한 _id 설정
                team_name: selectedTeam.team_name,
            }
        });
    };
    
    const handleError = (error) => {
        if (error.response) {
            return error.response.data.error || "오류가 발생했습니다.";
        } else if (error.request) {
            return "서버로부터 응답을 받지 못했습니다. 네트워크 문제일 수 있습니다.";
        } else {
            return error.message || "알 수 없는 오류가 발생했습니다.";
        }
    };

    const handleSave = async () => {
        const accountData = { ...selectedAccount };

        try {
            if (isEditing) {
                // 수정 모드일 때 PUT 요청
                await axios.put(`${API_URLS.ACCOUNTS}/${selectedAccount._id}`, accountData);
                console.log("Account updated successfully:", accountData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(API_URLS.ACCOUNTS, accountData);
                console.log("Account added successfully:", accountData);
            }
            
            await fetchData(API_URLS.ACCOUNTS, setAccounts);
            
            handleCloseDrawer();
        } catch (error) {
            setErrMsg(handleError(error));
        }
    };

    const getBankColor = (bankName) => {
        return BANK_COLORS[bankName] || BANK_COLORS['기타'];  // 지정된 은행명이 없으면 기본색 적용
    };

    return (
        <>
            <AdminHader />
            <div className="flex-1 w-full p-4 sm:p-6 dark:bg-gray-800">
                <div className="flex items-center justify-between mt-2 mb-4 px-3">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">계좌 목록</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl dark:text-white'
                        onClick={handleAddAccount}
                    >
                        <IoAddCircleOutline />
                    </button>
                </div>
                <div className='flow-root'>
                    <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700'>
                        {accounts.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                데이터가 없습니다.
                            </div>
                        ) : (
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {accounts.map(account => (
                                        <li key={account._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(account)}>
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full border overflow-hidden flex items-center justify-center dark:border-none ${getBankColor(account.bank_name)}`}>
                                                    <span className="text-white text-sm font-normal">
                                                        {account.bank_name.slice(0, 2)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0 ms-4">
                                                    <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                        {account.account_number}
                                                    </p>
                                                    <p className="text-slate-700 dark:text-slate-400">
                                                        {account.team_id.team_name}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                    <MdKeyboardArrowRight className='text-2xl' />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                        )}
                    </div>
                </div>
            </div>

            <CommonDrawer isOpen={isOpen} onClose={toggleDrawer} title={isEditing ? '계좌번호 수정' : '계좌번호 추가'}>
                {selectedAccount && (
                    <form>
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                            {errMsg && <div className="text-red-600">{errMsg}</div>}

                            <InputField 
                                label="계좌 번호" 
                                id="account_number" 
                                value={selectedAccount.account_number}
                                onChange={(e) => setSelectedAccount({ ...selectedAccount, account_number: e.target.value })}
                                placeholder="계좌번호 입력"
                                required
                            />

                            <InputField
                                label="은행명"
                                id="bank_name"
                                value={selectedAccount.bank_name}
                                onChange={(e) => setSelectedAccount({ ...selectedAccount, bank_name: e.target.value })}
                                placeholder="은행명 입력"
                                required
                            />

                            <SelectField
                                label="소속"
                                id="team_id"
                                value={selectedAccount?.team_id?._id || ""}
                                onChange={handleTeamChange}
                                options={teams.map(team => ({ value: team._id, label: team.team_name}
                                ))}
                                placeholder="팀 선택"
                                required
                            />
                        </div>
                        {/* 저장 버튼 */}
                        <div className="flex flex-col gap-3 pt-4 p-6">
                            <button type="button" onClick={handleSave} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {isEditing ? '수정' : '추가'}
                            </button>
                            <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600 dark:text-slate-400">
                                취소
                            </button>
                        </div>
                    </form>
                )}
            </CommonDrawer>
        </>
    )
}

export default AdminAccount