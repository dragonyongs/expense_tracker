import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowRight } from "react-icons/md";
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { IoAddCircleOutline } from "react-icons/io5";
import AdminHader from '../components/AdminHader';

const AdminMembers = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [pendingMembersCount, setPendingMembersCount] = useState(0);
    const [password, setPassword] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [roles, setRoles] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        fetchMembers();
        fetchStatuses();
        fetchRoles();
        fetchTeams();
    }, []);

    useEffect(() => {
        filterMembers();
    }, [selectedCategory, members]);

    const filterMembers = () => {
        let filtered = [...members];
    
        if (selectedCategory === '요청') {
            filtered = members.filter(member => member.status_id.status_name === 'pending');
        } else if (selectedCategory === '전체') {
            filtered = members.filter(member => member.role_id.role_name !== 'super_admin');
        }
    
        // 요청 카테고리에서의 pending 멤버 수를 직접 계산
        const filterPendingMembers = filtered.filter(member => member.status_id.status_name === 'pending');
        setPendingMembers(filterPendingMembers);
        setPendingMembersCount(filterPendingMembers.length); // 직접 계산한 값을 사용
        setFilteredMembers(filtered);
    };
    
    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
        setPassword('');
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleOpenDrawer = async (member) => {
        setSelectedMember(member);
        setIsEditing(true);
        setIsOpen(true);

        const response = await axios.get(`${API_URLS.MEMBERS}/${member._id}`);
        const fullMemberData = response.data;

        // 상세 정보가 포함된 멤버로 업데이트
        setSelectedMember(fullMemberData);
    };

    const handleAddDepartment = () => {
        setSelectedMember({ member_name: '', email: '', password: '', position: '', rank: '' });
        setPassword('');
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedMember(null);
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(API_URLS.MEMBERS);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const response = await axios.get(API_URLS.STATUSES);
            setStatuses(response.data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get(API_URLS.TEAMS);
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching Teams:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(API_URLS.ROLES);
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching Roles:', error);
        }
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
                status_id: selectedMember?.status_id?._id || null,
                team_id: selectedMember?.team_id?._id || null,
                password: password.length > 0 ? password : undefined
            };

            console.log(memberData);
            
            if (isEditing) {
                await axios.put(`${API_URLS.MEMBERS}/${selectedMember._id}`, memberData);
            } else {
                await axios.post(API_URLS.MEMBERS, memberData);
            }
            
            await fetchMembers();
            handleCloseDrawer();
        } catch (error) {
            setErrMsg(error.message);
            console.error("Error Save member:", error);
        }
    };

    return (
        <>
            <AdminHader />
            <div className='flex-1 w-full p-4 sm:p-6 dark:bg-gray-800'>
                <ul className='flex gap-x-1 mb-6'>
                    <li 
                        className={`cursor-pointer px-4 py-1 border rounded-full text-sm ${selectedCategory === '전체' ? 'border-blue-600 text-blue-600 bg-white' : 'border-slate-400 bg-white'}`} 
                        onClick={() => handleCategoryClick('전체')}
                    >
                        전체
                    </li>
                    <li 
                        className={`cursor-pointer px-4 py-1 border rounded-full text-sm ${selectedCategory === '요청' ? 'border-blue-600 text-blue-600 bg-white' : 'border-slate-400 bg-white'}`} 
                        onClick={() => handleCategoryClick('요청')}
                    >
                        요청 ({pendingMembersCount})
                    </li>
                </ul>
                <div className="flex items-center justify-between mb-4 px-3">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">회원 목록</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl dark:text-white'
                        onClick={handleAddDepartment}
                    ><IoAddCircleOutline /></button>
                </div>
                <div className='flow-root space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700'>
                    {filteredMembers.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">현재 요청중인 사용자가 없습니다.</p>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredMembers.map(({ _id, member_name, status_id, team_id, photoUrl, createdAt }) => {
                                const isPending = status_id.status_name === 'pending';
                                const statusClass = isPending
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-400';

                                return (
                                    <li
                                        key={_id}
                                        className='py-3 sm:py-4 cursor-pointer'
                                        onClick={() => handleOpenDrawer({ _id, member_name, status_id, team_id, photoUrl, createdAt })}
                                    >
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${statusClass} overflow-hidden flex items-center justify-center`}>
                                                {photoUrl ? (
                                                    <img className="w-10 h-10" src={photoUrl} alt={member_name} />
                                                ) : (
                                                    <span className="text-md font-semibold">
                                                        {isPending ? '대기' : member_name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 ms-4">
                                                <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                    {member_name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                    {isPending ? `미승인` : team_id?.team_name || ''}
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                <MdKeyboardArrowRight className='text-2xl' />
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <CommonDrawer
                    isOpen={isOpen}
                    onClose={toggleDrawer}
                    title={isEditing ? '회원 수정' : '회원 추가'}
                >
                    {selectedMember && (
                        <form>
                            <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                                {errMsg && <div className="text-red-600">{errMsg.toString()}</div>} {/* 에러 메시지 표시 */}
                                
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
                                    value={password}  // 상태에 따라 비밀번호 필드의 값을 설정
                                    onChange={(e) => setPassword(e.target.value)}
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

                                <SelectField
                                    label="소속"
                                    id="team_id"
                                    value={selectedMember?.team_id?._id || ""}
                                    onChange={handleTeamChange}
                                    options={teams.map(team => ({ value: team._id, label: team.team_name}
                                    ))}
                                    placeholder="소속 선택"
                                    required
                                />

                                {/* Member Status */}
                                <SelectField
                                    label="상태"
                                    id="status_id"
                                    value={selectedMember?.status_id?._id || ""}
                                    onChange={handleStatusChange}
                                    options={statuses.map(status => ({ value: status._id, label: status.status_description}
                                    ))}
                                    placeholder="상태 선택"
                                    required
                                />

                                <SelectField
                                    label="권한"
                                    id="role_id"
                                    value={selectedMember?.role_id?._id || ""}
                                    onChange={handleRoleChange}
                                    options={roles.map(role => ({ value: role._id, label: role.role_description}
                                    ))}
                                    placeholder="권한 선택"
                                    required
                                />

                                <hr className='my-2 border-slate-200 dark:border-slate-600'/>

                                <InputField 
                                    label="오피스 계정" 
                                    id="office_account" 
                                    value={selectedMember.email}
                                    onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                                    placeholder="계정 아이디 입력(이메일)"
                                    disabled
                                />

                                <InputField 
                                    label="VPN" 
                                    id="vpn_account" 
                                    value=""
                                    placeholder="VPN 아이디 입력"
                                    disabled
                                />

                                <InputField 
                                    type="password"
                                    label="VPN 패스워드" 
                                    id="vpn_password" 
                                    value=""
                                    placeholder="VPN 비밀번호 입력"
                                    disabled
                                />
                            </div>
                            
                            {/* Save Button */}
                            <div className="flex flex-col gap-3 pt-4 p-6">
                                <button type="button" onClick={handleSave} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                    {isEditing ? '수정' : '추가'}
                                </button>
                                <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600 dark:text-slate-400">
                                    안할래요
                                </button>
                            </div>
                        </form>
                    )}
                </CommonDrawer>
            </div>
        </>
    );
};

export default AdminMembers;

                                        {/* <span className={`ml-2 p-2 text-xs font-semibold text-center rounded-lg ${member.status_id.status_name === 'pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-600'}`}>
                                            {member.status_id.status_description}
                                        </span> */}