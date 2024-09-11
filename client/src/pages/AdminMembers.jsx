import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowRight } from "react-icons/md";
import axios from "../services/axiosInstance";
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { IoAddCircleOutline } from "react-icons/io5";

const MEMBER_URL = '/api/members';
const STATUS_URL = '/api/status';
const ROLE_URL = '/api/roles';
const TEAM_URL = '/api/teams';

const AdminMembers = () => {
    const [members, setMembers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [roles, setRoles] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchMembers = async () => {
        try {
            const response = await axios.get(MEMBER_URL);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await axios.get(STATUS_URL);
            setStatuses(response.data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get(TEAM_URL);
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching Teams:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(ROLE_URL);
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching Roles:', error);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchStatuses();
        fetchRoles();
        fetchTeams();
    }, []);

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleOpenDrawer = (member) => {
        setSelectedMember(member);
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleAddDepartment = () => {
        setSelectedMember({ member_name: '', email: '' });
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedMember(null);
    };

    const handleStatusChange = (e) => {
        const selectedStatusId = e.target.value; // 사용자가 선택한 status의 _id
        const selectedStatus = statuses.find(status => status._id === selectedStatusId); // 선택한 status를 찾아서
    
        // selectedStatus가 존재하는지 확인
        if (!selectedStatus) {
            console.error('선택된 상태를 찾을 수 없습니다.');
            return;
        }
    
        // 선택된 상태가 있을 경우에만 selectedMember 업데이트
        setSelectedMember({
            ...selectedMember,
            status_id: {
                _id: selectedStatus._id,  // 정확한 _id 설정
                status_name: selectedStatus.status_name,
                status_description: selectedStatus.status_description
            }
        });
    };

    const handleRoleChange = (e) => {
        const selectedRoleId = e.target.value;
        const selectedRole = roles.find(role => role._id === selectedRoleId);

        if (!selectedRole) {
            console.error('선택된 권한을 찾을 수 없습니다.');
            return;
        }

        setSelectedMember({
            ...selectedMember,
            role_id: {
                _id: selectedRole._id,
                role_name: selectedRole.role_name,
                role_description: selectedRole.role_description
            }
        });
    }

    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value;
        const selectedTeam = teams.find(team => team._id === selectedTeamId);

        if (!selectedTeam) {
            console.error('선택된 팀을 찾을 수 없습니다.');
            return;
        }

        setSelectedMember({
            ...selectedMember,
            team_id: {
                _id: selectedTeam._id,
                team_name: selectedTeam.team_name,
            }
        });
    }

    const handleSave = async () => {
        try {
            const memberData = {
                ...selectedMember,
                status_id: selectedMember.status_id._id,
                team_id: selectedMember.team_id._id
            };

            if (isEditing) {
                // 수정 모드일 때 PUT 요청
                await axios.put(`${MEMBER_URL}/${selectedMember._id}`, memberData);
                console.log("Department updated successfully:", memberData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(MEMBER_URL, memberData);
                console.log("Department added successfully:", memberData);
            }
            
            await fetchMembers();

            handleCloseDrawer();
        } catch (error) {
            console.error("Error updating member:", error);
        }
    };

    return (
        <div className='w-full p-4 sm:p-6 dark:bg-gray-800'>
            <div className="flex items-center justify-between mt-2 mb-4 px-3">
                <h5 className="text-lg font-bold leading-none text-gray-900 dark:text-white">회원 목록</h5>
                <button
                    type="button" 
                    className='text-black font-semibold rounded-lg text-2xl'
                    onClick={handleAddDepartment}
                ><IoAddCircleOutline /></button>
            </div>
            <div className='flow-root space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700'>
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {members.map(member => (
                        <li 
                            key={member._id} 
                            className='py-3 sm:py-4 cursor-pointer' 
                            onClick={() => handleOpenDrawer(member)}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-400 overflow-hidden flex items-center justify-center">
                                    {member.photoUrl ? (
                                        <img className="w-10 h-10" src={member.photoUrl} alt={member.member_name} />
                                    ) : (
                                        <span className="text-white text-lg font-semibold">
                                            {member.member_name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 ms-4">
                                    <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                        {member.member_name} 
                                        <span className={`ml-2 p-2 text-xs font-semibold text-center rounded-lg ${member.status_id.status_name === 'pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-600'}`}>
                                            {member.status_id.status_description}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                        {member.email}
                                    </p>
                                </div>
                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                    <MdKeyboardArrowRight className='text-2xl' />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <CommonDrawer
                isOpen={isOpen}
                onClose={toggleDrawer}
                title={isEditing ? '회원 수정' : '회원 추가'}
            >
                {selectedMember && (
                    <form>
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                            {/* Member Name */}
                            <InputField 
                                label="이름" 
                                id="member_name" 
                                value={selectedMember.member_name}
                                onChange={(e) => setSelectedMember({ ...selectedMember, member_name: e.target.value })}
                                placeholder="이름 입력"
                                required
                            />

                            {/* Member Email */}
                            <InputField 
                                label="이메일" 
                                id="email" 
                                value={selectedMember.email}
                                onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                                placeholder="이메일(아이디) 입력" 
                                required
                            />

                            <InputField 
                                label="비밀번호" 
                                id="password"
                                type="password"
                                value={selectedMember.newPassword || ''}  // 새로운 비밀번호는 항상 빈 문자열로 시작
                                onChange={(e) => {
                                    const newPassword = e.target.value;
                                    setSelectedMember({ 
                                        ...selectedMember, 
                                        newPassword: newPassword.length > 0 ? newPassword : null  // 입력이 없으면 null
                                    });
                                }}
                                placeholder="비밀번호 변경 없음" 
                                required={false}  // 비밀번호는 필수 입력이 아님
                            />

                            {/* Member Position */}
                            <InputField 
                                label="직책" 
                                id="position" 
                                value={selectedMember.position || ''}
                                onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })}
                                placeholder="직책 입력"
                                required
                            />


                            {/* Member Rank */}
                            <InputField 
                                label="직급" 
                                id="rank" 
                                value={selectedMember.rank || ''}
                                onChange={(e) => setSelectedMember({ ...selectedMember, rank: e.target.value })}
                                placeholder="직급 입력" 
                                required
                            />

                            <div className="flex flex-col gap-2">
                                <label htmlFor="team_id">소속</label>
                                <select
                                    id="team_id"
                                    name="team_id"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={selectedMember?.team_id?._id || ""}
                                    onChange={handleTeamChange}
                                >
                                    <option value="" disabled>상태 선택</option>
                                    {teams.map(team => (
                                        <option key={team._id} value={team._id}>
                                            {team.team_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Member Status */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="status_id">상태</label>
                                <select
                                    id="status_id"
                                    name="status_id"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={selectedMember?.status_id?._id || ""}
                                    onChange={handleStatusChange}
                                >
                                    <option value="" disabled>상태 선택</option>
                                    {statuses.map(status => (
                                        <option key={status._id} value={status._id}>
                                            {status.status_description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="role_id">권한</label>
                                <select
                                    id="role_id"
                                    name="role_id"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={selectedMember?.role_id?._id || ""}
                                    onChange={handleRoleChange}
                                >
                                    <option value="" disabled>권한 선택</option>
                                    {roles.map(role => (
                                        <option key={role._id} value={role._id}>
                                            {role.role_description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Save Button */}
                        <div className="flex flex-col gap-3 pt-4 p-6">
                            <button type="button" onClick={handleSave} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {isEditing ? '수정' : '추가'}
                            </button>
                            <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
                                안할래요
                            </button>
                        </div>
                    </form>
                )}
            </CommonDrawer>
        </div>
    );
};

export default AdminMembers;
