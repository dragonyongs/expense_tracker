import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

const ACCOUNT_URL = '/api/accounts';
const TEAM_URL = '/api/teams';

const AdminAccount = () => {
    const [accounts, setAccounts] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(ACCOUNT_URL);
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    const fetchTeams = async () => {
        try {
            const response = await axios.get(TEAM_URL);
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    useEffect(() => {
        fetchAccounts();
        fetchTeams();
    }, []);

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleAddAccount = () => {
        setSelectedAccount({ account_number: ''});
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
        setSelectedAccount(null);
    };

    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value; // 사용자가 선택한 status의 _id
        const selectedTeam = teams.find(team => team._id === selectedTeamId); // 선택한 status를 찾아서
    
        // selectedStatus가 존재하는지 확인
        if (!selectedTeam) {
            console.error('선택된 팀을 찾을 수 없습니다.');
            return;
        }
    
        // 선택된 상태가 있을 경우에만 selectedMember 업데이트
        setSelectedAccount({
            ...selectedAccount,
            team_id: {
                _id: selectedTeam._id,  // 정확한 _id 설정
                status_name: selectedTeam.team_name,
            }
        });
    };

    const handleSave = async () => {
        try {
            const accountData = {
                ...selectedAccount,
            };

            if (isEditing) {
                // 수정 모드일 때 PUT 요청
                await axios.put(`${ACCOUNT_URL}/${selectedAccount._id}`, accountData);
                console.log("Account updated successfully:", accountData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(ACCOUNT_URL, accountData);
                console.log("Account added successfully:", accountData);
            }
            
            await fetchAccounts();
            
            handleCloseDrawer();
        } catch (error) {
            console.error("Error updating member:", error);
        }
    };

    return (
        <>
            <div className='w-full mt-4 p-4 sm:p-8 dark:bg-gray-800'>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">계좌 목록</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl'
                        onClick={handleAddAccount}
                    ><IoAddCircleOutline /></button>
                </div>
                <div className='flow-root'>
                    {accounts.length === 0 ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            데이터가 없습니다.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {accounts.map(account => (
                                <li key={account._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(account)}>
                                    <div className="flex items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                {account.account_number}
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

            <CommonDrawer isOpen={isOpen} onClose={toggleDrawer} title={isEditing ? '걔좌번호 수정' : '계좌번호 추가'}>
                {selectedAccount && (
                    <form className="h-[calc(100vh-44px)]">
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-[calc(100vh-190px)] px-1">
                            <InputField 
                                label="계좌 번호" 
                                id="account_number" 
                                value={selectedAccount.account_number}
                                onChange={(e) => setSelectedAccount({ ...selectedAccount, account_number: e.target.value })}
                                placeholder="계좌번호 입력"
                            />

                            <div>
                                    <label htmlFor="team_id">사용 팀</label>
                                    <select
                                        id="team_id"
                                        name="team_id"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                        value={selectedAccount?.team_id?._id || ""}  // 현재 상태의 _id 값 설정
                                        onChange={handleTeamChange}
                                    >
                                        <option value="" disabled>팀 선택</option>
                                        {teams.map(team => (
                                            <option key={team._id} value={team._id}>
                                                {team.team_name}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                        </div>
                        {/* 저장 버튼 */}
                        <div className="flex flex-col gap-3 pt-4">
                            <button type="button" onClick={handleSave} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {isEditing ? '수정' : '추가'}
                            </button>
                            <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
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