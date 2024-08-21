import React, { useEffect, useState } from 'react';
import Tab from '../components/Tab';
import axios from "../services/axiosInstance";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { Drawer, Button, TextField } from '@mui/material'; // Material-UI의 Drawer, Button, TextField 가져오기

const MEMBER_URL = '/api/members';
const STATUS_URL = '/api/status';

const AdminMembers = () => {
    const [members, setMembers] = useState([]);
    const [statuses, setStatuses] = useState([]); // 상태 목록 관리
    const [drawerOpen, setDrawerOpen] = useState(false); // Drawer 상태 관리
    const [selectedMember, setSelectedMember] = useState(null); // 선택한 멤버 정보 관리

    useEffect(() => {
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

        fetchMembers();
        fetchStatuses();
    }, []);

    // Drawer를 여는 함수
    const handleOpenDrawer = (member) => {
        setSelectedMember(member); // 선택된 멤버 설정
        setDrawerOpen(true); // Drawer 열기
    };

    // Drawer를 닫는 함수
    const handleCloseDrawer = () => {
        setDrawerOpen(false); // Drawer 닫기
        setSelectedMember(null); // 선택된 멤버 초기화
    };

    // 상태 선택 시 업데이트하는 함수
    const handleStatusChange = (e) => {
        const selectedStatusName = e.target.value;
        const selectedStatus = statuses.find(status => status.status_name === selectedStatusName);

        setSelectedMember({
            ...selectedMember,
            status_id: {
                ...selectedMember.status_id,
                _id: selectedStatus._id, // status_id의 _id 업데이트
                status_name: selectedStatus.status_name,
                status_description: selectedStatus.status_description
            }
        });
    };

    // 저장 처리
    const handleSave = () => {
        const memberDataToSave = {
            ...selectedMember,
            status_id: selectedMember.status_id._id // status_id 필드에 _id만 남기기
        };
        console.log("Save member details:", memberDataToSave);
        // API 호출 로직 추가
        handleCloseDrawer();
    };

    return (
        <>
            <Tab />
            <div className='w-full p-4 sm:p-8 dark:bg-gray-800'>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">회원 목록</h5>
                </div>
                <div className='flow-root'>
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {members.map(member => (
                            <li 
                                key={member._id} 
                                className='py-3 sm:py-4 cursor-pointer' 
                                onClick={() => handleOpenDrawer(member)} // 클릭 시 Drawer 열기
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-400 overflow-hidden flex items-center justify-center">
                                        {member.photoUrl ? (
                                            <img className="w-9 h-9" src={member.photoUrl} alt={member.member_name} />
                                        ) : (
                                            <span className="text-white text-lg font-semibold">
                                                {member.member_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 ms-4">
                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
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

                {/* Drawer UI */}
                <Drawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={handleCloseDrawer}
                    sx={{ width: 375, flexShrink: 0, '& .MuiDrawer-paper': { width: 375 } }}
                >
                    <div className="flex justify-between py-2 px-4 bg-slate-100">
                        <h5 className="text-lg font-bold">회원 상세 정보</h5>
                        <button onClick={handleCloseDrawer}>
                            <MdClose className='text-2xl'/>
                        </button>
                    </div>
                    <div className="p-4">
                        {selectedMember && (
                            <>
                                <TextField
                                    label="이름"
                                    fullWidth
                                    value={selectedMember.member_name}
                                    onChange={(e) => setSelectedMember({ ...selectedMember, member_name: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    label="이메일"
                                    fullWidth
                                    value={selectedMember.email}
                                    onChange={(e) => setSelectedMember({ ...selectedMember, email: e.target.value })}
                                    margin="dense"
                                />

                                <select
                                    id="default"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={selectedMember.status_id.status_name}
                                    onChange={handleStatusChange}
                                >
                                    <option value="" disabled>상태 선택</option>
                                    {statuses.map(status => (
                                        <option key={status._id} value={status.status_name}>
                                            {status.status_description}
                                        </option>
                                    ))}
                                </select>

                                <Button variant="contained" color="primary" fullWidth onClick={handleSave}>
                                    저장
                                </Button>
                            </>
                        )}
                    </div>
                </Drawer>
            </div>
        </>
    );
};

export default AdminMembers;
