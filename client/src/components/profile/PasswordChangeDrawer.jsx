import React, { useState, useEffect } from 'react'
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
// import axios from "../../services/axiosInstance"; 
// import { API_URLS } from '../../services/apiUrls';
import useMediaQuery from '../../hooks/useMediaQuery';
import useViewportHeight from '../../hooks/useViewportHeight';
import InputField from '../../components/InputField';
import { DRAWER_STYLES } from '../../styles/drawerStyles';
import { FaChevronDown } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';
import PasswordValidation from '../PasswordValidation';
import useDrawerTheme from '../../hooks/useDrawerTheme';

const PasswordChangeDrawer = ({ isOpen, onClose, onSave, memberId, title, successMsg, errMsg }) => {
    useDrawerTheme(isOpen);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [fetchErrMsg, setFetchErrMsg] = useState('');
    const isMobile = useMediaQuery('(max-width:768px)');
    const viewportHeight = useViewportHeight();
    const styles = DRAWER_STYLES(isMobile, viewportHeight);

    // useEffect(() => {
    //     const fetchCurrentPassword = async () => {
    //         try {
    //             setIsLoading(true);
    //             const response = await axios.get(`${API_URLS.MEMBERS}/${memberId}`); 
    //             setCurrentPassword(response.data.password); 
    //         } catch (error) {
    //             console.error('현재 비밀번호를 가져오는 데 실패했습니다.', error);
    //             setFetchErrMsg('현재 비밀번호를 가져오는 데 실패했습니다.');
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     if (isOpen) {
    //         fetchCurrentPassword();
    //     }
    // }, [isOpen, memberId]);

    const isPasswordMatch = confirmPassword === password && confirmPassword.length > 0;

    const handleSave = async () => {
        if (!isPasswordMatch) {
            return;
        }

        try {
            setIsLoading(true);
            await onSave(password, currentPassword);
        } catch (error) {
            console.error('저장 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        onClose();
    }

    return (
        <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' className="rounded-tr-lg rounded-tl-lg" style={isMobile ? styles.mobile : styles.desktop}>
            <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
                <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                <button onClick={handleClose} className='text-2xl dark:text-slate-300 mb-4'>
                    <FaChevronDown />
                </button>
            </div>
            <div className='dark:bg-slate-800'>
                <div className={`overflow-y-auto no-scrollbar ${isMobile ? 'h-profileDrawerMobile-screen' : 'h-profileDrawer-screen'} pb-6 px-6 flex flex-col space-y-4`}>
                    <InputField
                        label="현재 비밀번호"
                        id="currentPassword"
                        type="password"
                        value={currentPassword || ""}
                        className="bg-white border border-slate-200"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="기존 비밀번호 입력"
                        required={true}
                    />
                    
                    {currentPassword && <InputField
                        label="비밀번호"
                        id="password"
                        type="password"
                        value={password || ""}
                        className="bg-white border border-slate-200"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="8자리 이상 특수기호, 영문 대문자 포함"
                        required={true}
                    />}
                    
                    {currentPassword && !confirmPassword && <PasswordValidation password={password} />}

                    { password.length >= 8 && <div className="relative">
                        <InputField
                            label="비밀번호 확인"
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword || ""}
                            className={`border 
                                ${confirmPassword
                                    ? isPasswordMatch ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                                    : 'bg-white border-slate-200'
                            }`}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="동일한 비밀번호 입력"
                            required={true}
                        />
                        <div className="mt-1 text-sm">
                            {confirmPassword && (
                                isPasswordMatch ? (
                                    <p className="text-green-600">동일한 비밀번호입니다.</p>
                                ) : (
                                    <p className="text-red-600">비밀번호가 일치하지 않습니다.</p>
                                )
                            )}
                        </div>
                    </div> }

                    {errMsg && <div className="text-center text-red-500 mt-2">{errMsg}</div>}
                    {successMsg && <div className="text-center text-green-500 mt-2">{successMsg}</div>}

                </div>

                {/* 저장 버튼 */}
                <div className="flex flex-col gap-3 pt-4 p-6">
                    <div className='flex justify-between gap-y-4 gap-x-2'>
                        <button type="button" onClick={handleSave} className={`overflow-hidden min-h-10 flex justify-center items-center flex-1 w-full text-white ${isLoading ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700`}>
                            {isLoading ? <ThreeDots color='#ffffff' width={'40px'} height={'auto'} /> : "비밀번호 변경"}
                        </button>
                    </div>
                    <button type="button" onClick={handleClose} className="w-full text-slate-600 dark:text-orange-300">
                        취소
                    </button>
                </div>
            </div>
        </Drawer>
    )
}

export default PasswordChangeDrawer;