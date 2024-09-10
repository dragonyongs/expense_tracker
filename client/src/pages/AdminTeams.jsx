import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

const TEAM_URL = '/api/teams';
const DEPARTMENT_URL = '/api/departments';

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [departments, setDepartments] = useState([]);
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

    const fetchDepartments = async () => {
        try {
            const response = await axios.get(DEPARTMENT_URL);
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

    useEffect(() => {
        fetchTeams();
        fetchDepartments();
    }, []);

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleAddTeam = () => {
        setSelectedTeam({ 
            team_name: '',
            department_id: ''
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    // 수정 모드로 모달 열기
    const handleOpenDrawer = (team) => {
        setSelectedTeam(team);
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedTeam(null);
    };

    const handleDepartmentChange = (e) => {
        const selectedDepartmentId = e.target.value;
        const selectedDepartment = departments.find(department => department._id === selectedDepartmentId);

        if (!selectedDepartment) {
            console.error('선택된 본부를 찾을 수 없습니다.');
            return;
        }
    
        setSelectedTeam({
            ...selectedTeam,
            department_id: {
                _id: selectedDepartment._id,
                department_name: selectedDepartment.department_name
            }
        });
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

    const groupTeamsByDepartment = () => {
        return departments.reduce((grouped, department) => {
            grouped[department.department_name] = teams.filter(team => team.department_id._id === department._id);
            return grouped;
        }, {});
    };

    const groupedTeams = groupTeamsByDepartment();

    return (
        <>
            <div className="w-full p-4 sm:p-6 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <h5 className="text-lg font-bold leading-none text-gray-900 dark:text-white">팀 목록</h5>
                        <button
                            type="button"
                            className="text-black font-semibold rounded-lg text-2xl"
                        onClick={handleAddTeam}
                        ><IoAddCircleOutline /></button>
                    </div>
                
                    <div className='flow-root'>
                        {teams.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                데이터가 없습니다.
                            </div>
                        ) : (
                            Object.keys(groupedTeams).map(departmentName => (
                                <div key={departmentName} className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700 mb-4">
                                    <h6 className="text-sm font-bold text-gray-500 dark:text-white">{departmentName}</h6>
                                    {groupedTeams[departmentName].length === 0 ? <p className="pb-3 text-center">소속된 팀이 없습니다.</p> : (

                                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 mt-2">
                                        {groupedTeams[departmentName].map(team => (
                                            <li key={team._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(team)}>
                                                <div className="flex items-center">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-md font-medium text-gray-900 truncate dark:text-white">
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
                            ))
                        )}
                    </div>
              
            </div>

            <CommonDrawer isOpen={isOpen} onClose={toggleDrawer} title={isEditing ? '팀 수정' : '팀 추가'}>
                {selectedTeam && (
                    <form>
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                            <InputField 
                                label="팀 이름" 
                                id="team_name" 
                                value={selectedTeam.team_name}
                                onChange={(e) => setSelectedTeam({ ...selectedTeam, team_name: e.target.value })}
                                placeholder="팀 이름 입력"
                            />

                            <div className="flex flex-col gap-2">
                                <label htmlFor="department_id">본부</label>
                                <select
                                    id="department_id"
                                    name="department_id"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={selectedTeam?.department_id?._id || ""}
                                    onChange={handleDepartmentChange}
                                >
                                    <option value="" disabled>본부 선택</option>
                                    {departments.map(department => (
                                        <option key={department._id} value={department._id}>
                                            {department.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* 저장 버튼 */}
                        <div className="flex flex-col gap-3 pt-4 p-6">
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