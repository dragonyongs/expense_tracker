import React, { useState } from 'react'
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import axios from "../../services/axiosInstance"; 
import { API_URLS } from '../../services/apiUrls';
import useMediaQuery from '../../hooks/useMediaQuery';
import useViewportHeight from '../../hooks/useViewportHeight';
import InputField from '../../components/InputField';
import { DRAWER_STYLES } from '../../styles/drawerStyles';
import { FaChevronDown } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';
import PasswordValidation from '../PasswordValidation';

const PasswordChangeDrawer = ({ isOpen, onClose, onSave, memberId, title }) => {

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const isMobile = useMediaQuery('(max-width: 640px)');
    const viewportHeight = useViewportHeight();
    const styles = DRAWER_STYLES(isMobile, viewportHeight);

    const handleSave = async () => {
        if (password !== confirmPassword) {
            setErrMsg("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            setIsLoading(true);
            setErrMsg('');
            await onSave(password);
            await onSave();
        } catch (error) {
            console.error('저장 오류:', error);
            setErrMsg('프로필 저장에 실패했습니다.'); // 사용자에게 오류 메시지 표시
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' className="rounded-tr-lg rounded-tl-lg" style={isMobile ? styles.mobile : styles.desktop}>
            <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
                <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                <button onClick={onClose} className='text-2xl dark:text-slate-300 mb-4'>
                    <FaChevronDown />
                </button>
            </div>
            <div className='dark:bg-slate-800'>
                <div className={`overflow-y-auto ${isMobile ? 'h-profileDrawerMobile-screen' : 'h-profileDrawer-screen'} pb-6 px-6 flex flex-col space-y-4`}>
                    <InputField
                        label="비밀번호"
                        id="password"
                        type="password"
                        value={password || ""}
                        className="bg-white border border-slate-200"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="8자리 이상 특수기호, 영문 대문자 포함"
                        required={true}
                    />
                    <PasswordValidation password={password} />
                    <InputField
                        label="비밀번호 확인"
                        id="password"
                        type="password"
                        value={confirmPassword || ""}
                        className="bg-white border border-slate-200"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="동일한 비밀번호 입력"
                        required={true}
                    />
                </div>
                {/* 저장 버튼 */}
                <div className="flex flex-col gap-3 pt-4 p-6">
                    <div className='flex justify-between gap-y-4 gap-x-2'>
                        <button type="button" onClick={handleSave} className={`overflow-hidden min-h-10 flex justify-center items-center flex-1 w-full text-white ${isLoading ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700`}>
                            {isLoading ? <ThreeDots color='#ffffff' width={'40px'} height={'auto'} /> : "비밀번호 변경"}
                        </button>
                    </div>
                    <button type="button" onClick={onClose} className="w-full text-slate-600 dark:text-orange-300">
                        취소
                    </button>
                </div>
            </div>
        </Drawer>
    )
}

export default PasswordChangeDrawer;