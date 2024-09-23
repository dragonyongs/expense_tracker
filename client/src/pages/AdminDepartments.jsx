import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import { API_URLS } from '../services/apiUrls';
import CommonDrawer from '../components/CommonDrawer'; // 공통 Drawer 컴포넌트 사용
import InputField from '../components/InputField'; // 공통 Input 컴포넌트 사용
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

// const DEPARTMENTS_URL = '/api/departments';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // 수정 여부를 확인하는 상태 추가
    
    // 부서 리스트를 가져오는 함수
    const fetchDepartments = async () => {
        try {
            const response = await axios.get(API_URLS.DEPARTMENTS);
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

    useEffect(() => {
        fetchDepartments(); // 컴포넌트가 처음 렌더링될 때 부서 리스트 가져오기
    }, []);
    
    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
    };

    // 수정 모드로 모달 열기
    const handleOpenDrawer = (department) => {
        setSelectedDepartment(department);
        setIsEditing(true); // 수정 모드로 설정
        setIsOpen(true);
    };

    // 추가 모드로 모달 열기
    const handleAddDepartment = () => {
        setSelectedDepartment({ department_name: '' }); // 빈 객체로 초기화
        setIsEditing(false); // 추가 모드로 설정
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedDepartment(null);
    };

    const handleSave = async () => {
        try {
            const departmentData = {
                ...selectedDepartment
            };
            
            if (isEditing) {
                // 수정 모드일 때 PUT 요청
                await axios.put(`${API_URLS.DEPARTMENTS}/${selectedDepartment._id}`, departmentData);
                console.log("Department updated successfully:", departmentData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(API_URLS.DEPARTMENTS, departmentData);
                console.log("Department added successfully:", departmentData);
            }
            
            // 부서 리스트 다시 가져오기
            await fetchDepartments();
            
            handleCloseDrawer(); // 완료 후 모달 닫기
        } catch (error) {
            console.error("Error saving department:", error);
        }
    };

    return (
        <>
            <div className='flex-1 w-full p-4 sm:p-6 dark:bg-gray-800'>
                <div className="flex items-center justify-between mt-2 mb-4 px-3">
                    <h5 className="text-2xl font-bold leading-none text-gray-900 dark:text-white">본부 목록</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-3xl dark:text-white'
                        onClick={handleAddDepartment}
                    ><IoAddCircleOutline /></button>
                </div>
                <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700">
                    <div className='flow-root'>
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {departments.map(department => (
                                <li key={department._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(department)}>
                                    <div className="flex items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                {department.department_name}
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
                </div>
            </div>
            <CommonDrawer isOpen={isOpen} onClose={toggleDrawer} title={isEditing ? '본부 수정' : '본부 추가'}>
                {selectedDepartment && (
                    <form>
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                            <InputField 
                                label="본부 이름" 
                                id="department_name" 
                                value={selectedDepartment.department_name}
                                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, department_name: e.target.value })}
                                placeholder="부서 이름 입력"
                            />
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

export default AdminDepartments;
