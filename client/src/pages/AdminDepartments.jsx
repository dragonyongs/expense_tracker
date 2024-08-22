import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import Tab from '../components/Tab';
import { MdKeyboardArrowRight, MdClose } from "react-icons/md";
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';

const DEPARTMENTS_URL = '/api/departments';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // 수정 여부를 확인하는 상태 추가
    
    // 부서 리스트를 가져오는 함수
    const fetchDepartments = async () => {
        try {
            const response = await axios.get(DEPARTMENTS_URL);
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
                await axios.put(`${DEPARTMENTS_URL}/${selectedDepartment._id}`, departmentData);
                console.log("Department updated successfully:", departmentData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(DEPARTMENTS_URL, departmentData);
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
            <Tab />
            <div className='w-full mt-4 p-4 sm:p-8 dark:bg-gray-800'>
                <div>Departments</div>
                <ul>
                    {departments.map(department => (
                        <li key={department._id} onClick={() => handleOpenDrawer(department)}>{department.department_name}</li>
                    ))}
                </ul>
                {/* 추가 버튼 */}
                <button 
                    type="button" 
                    onClick={handleAddDepartment} 
                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                    추가
                </button>
            </div>
            <Drawer
                    open={isOpen}
                    onClose={toggleDrawer}
                    direction='right'
                    size={'320px'}
                >
                    <div className="flex justify-between py-2 px-4">
                        <h5 className="text-lg font-bold">{isEditing ? '본부 수정' : '본부 추가'}</h5>
                        <button onClick={handleCloseDrawer}>
                            <MdClose className='text-2xl'/>
                        </button>
                    </div>
                    {selectedDepartment && (
                        <form className="p-4 h-[calc(100vh-44px)]">
                            <div className="flex w-full flex-col gap-6 overflow-y-auto h-[calc(100vh-190px)]">
                                <div>
                                    <label htmlFor="department_name">본부 이름</label>
                                    <input 
                                        id="department_name"
                                        name="department_name"
                                        type="text" 
                                        className="w-full rounded-md border-0 bg-slate-100 placeholder:text-slate-400" 
                                        placeholder="부서 이름 입력" 
                                        value={selectedDepartment?.department_name || ''}
                                        onChange={(e) => setSelectedDepartment({ ...selectedDepartment, department_name: e.target.value })}
                                        required
                                    />
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
            </Drawer>
        </>
    )
}

export default AdminDepartments;
