import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

const TEAM_URL = '/api/teams';

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchTeams = async () => {
        try {
            const response = await axios.get(TEAM_URL);
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }

    useEffect(() => {
        fetchTeams();
    }, []);

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleAddTeam = () => {
        setSelectedTeam({ team_name: ''});
        setIsEditing(false);
        setIsOpen(true);
    };

    // 수정 모드로 모달 열기
    const handleOpenDrawer = (teams) => {
        setSelectedTeam(teams);
        setIsEditing(true); // 수정 모드로 설정
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedTeam(null);
    };

    const handleSave = async () => {
        try {
            const teamData = {
                ...selectedTeam,
            };

            if (isEditing) {
                // 수정 모드일 때 PUT 요청
                await axios.put(`${TEAM_URL}/${selectedTeam._id}`, teamData);
                console.log("Team updated successfully:", teamData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(TEAM_URL, teamData);
                console.log("Team added successfully:", teamData);
            }
            
            await fetchTeams();

            handleCloseDrawer();
        } catch (error) {
            console.error("Error updating member:", error);
        }
    };

    return (
        <>
            <div className='w-full mt-4 p-4 sm:p-8 dark:bg-gray-800'>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">팀 목록</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl'
                        onClick={handleAddTeam}
                    ><IoAddCircleOutline /></button>
                </div>
                <div className='flow-root'>
                    {teams.length === 0 ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            데이터가 없습니다.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {teams.map(team => (
                                <li key={team._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(team)}>
                                    <div className="flex items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                {team.team_name}
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

            <CommonDrawer isOpen={isOpen} onClose={toggleDrawer} title={isEditing ? '팀 수정' : '팀 추가'}>
                {selectedTeam && (
                    <form className="p-4 h-[calc(100vh-44px)]">
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-[calc(100vh-190px)]">
                            <InputField 
                                label="팀 이름" 
                                id="team_name" 
                                value={selectedTeam.team_name}
                                onChange={(e) => setSelectedTeam({ ...selectedTeam, team_name: e.target.value })}
                                placeholder="팀 이름 입력"
                            />
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

export default AdminTeams