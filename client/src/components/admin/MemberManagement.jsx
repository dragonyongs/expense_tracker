import React, { useState }from 'react';
import MemberList from './MemberList';
import CommonDrawer from '../CommonDrawer';
import AdminDrawer from '../AdminDrawer';
import InputField from '../InputField';
import SelectField from '../SelectField';
import axios from "../../services/axiosInstance"; 
import { API_URLS } from '../../services/apiUrls';

const MemberManagement = ({
    isOpen,
    isEditing,
    members,
    statuses,
    roles,
    teams,
    selectedMember,
    setSelectedMember,
    onMemberSelect,
    onCloseDrawer,
    onSave,
    errMsg,
    isStatusDrawerOpen,
    isRolesDrawerOpen,
    setIsStatusDrawerOpen,
    setIsRolesDrawerOpen,
    deleteMember,
    fetchAllData,
    password,
    isUploadOpen,
    isDataDownloadOpen,
    handleFileChange,
    handleUpload,
    usersData,
    uploadStatus,
}) => {
    
    const [newPassword, setNewPassword] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    
    const handleInputChange = (field, value) => {
        if(field === 'password') {
            setNewPassword(value);
            setSelectedMember({ ...selectedMember, [field]: newPassword });
        }
        setSelectedMember({ ...selectedMember, [field]: value });
    };

    const generateRandomPassword = () => {
        const length = 8;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    };

    const handlePasswordReset = async () => {
        const randomPassword = generateRandomPassword(); // 랜덤 비밀번호 생성 함수
    
        try {
            const response = await axios.post(
                `${API_URLS.MEMBERS}/${selectedMember._id}/reset-password`,
                {
                    password: randomPassword,
                    is_password_reset: true,
                }
            );
    
            if (response.data.success) {
                setResetPassword(randomPassword);
                alert("비밀번호가 초기화되었습니다. 사용자에게 전달하세요.");
            } else {
                alert(`비밀번호 초기화 실패: ${response.data.message}`);
            }
        } catch (err) {
            console.error(err);
            // 에러 응답 처리
            alert(
                err.response?.data?.error || 
                "비밀번호 초기화 중 알 수 없는 오류가 발생했습니다."
            );
        }
    };
    
    const handleCopyPassword = () => {
        navigator.clipboard.writeText(resetPassword).then(() => {
            alert("비밀번호가 클립보드에 복사되었습니다.");
        });
    };
    
    return (
        <div>
            {/* Member List */}
            <MemberList members={members} onMemberSelect={onMemberSelect} />

            {/* Common Drawer */}
            <CommonDrawer isOpen={isOpen} onClose={onCloseDrawer} title={isEditing ? '회원 수정' : '회원 추가'}>
                {selectedMember && (
                    <form>
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                            {errMsg && <div className="text-red-600">{errMsg}</div>}

                            <InputField
                                label="이름"
                                id="member_name"
                                value={selectedMember.member_name || ''}
                                onChange={(e) => handleInputChange('member_name', e.target.value)}
                                placeholder="이름 입력"
                            />

                            <InputField
                                label="이메일"
                                id="email"
                                value={selectedMember.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="이메일 입력"
                            />
                            <div>
                                <InputField 
                                    label="비밀번호" 
                                    id="password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    showReset={isEditing}
                                    onReset={handlePasswordReset}
                                    placeholder="비밀번호 변경 없음" 
                                    required={false} 
                                />
                                {resetPassword && (
                                    <div className="mt-2 text-sm">
                                        <span className="font-semibold">초기화된 비밀번호: </span>
                                        <span>{resetPassword}</span>
                                        <button
                                            className="ml-2 text-blue-600 hover:underline"
                                            onClick={handleCopyPassword}
                                        >
                                            복사
                                        </button>
                                    </div>
                                )}
                            </div>
                            <SelectField
                                label="소속"
                                id="team_id"
                                value={selectedMember?.team_id?._id || ''}
                                onChange={(e) => handleInputChange('team_id', { _id: e.target.value })}
                                options={teams.map((team) => ({
                                    value: team._id,
                                    label: team.team_name,
                                }))}
                            />

                            <InputField 
                                label="직급" 
                                id="rank" 
                                value={selectedMember.rank || ''}
                                onChange={(e) => setSelectedMember({ ...selectedMember, rank: e.target.value })}
                                placeholder="직급 입력" 
                                required
                            />

                            <InputField 
                                label="직책" 
                                id="position" 
                                value={selectedMember.position || ''}
                                onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })}
                                placeholder="직책 입력"
                                required
                            />

                            <SelectField
                                label="상태"
                                id="status_id"
                                value={selectedMember?.status_id?._id || ''}
                                onChange={(e) => handleInputChange('status_id', { _id: e.target.value })}
                                options={statuses.map((status) => ({
                                    value: status._id,
                                    label: status.status_description,
                                }))}
                                onManageClick={() => setIsStatusDrawerOpen(true)}
                                required
                            />

                            <SelectField
                                label="권한"
                                id="role_id"
                                value={selectedMember?.role_id?._id || ''}
                                onChange={(e) => handleInputChange('role_id', { _id: e.target.value })}
                                options={roles.map((role) => ({
                                    value: role._id,
                                    label: role.role_description,
                                }))}
                                onManageClick={() => setIsRolesDrawerOpen(true)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-4 p-6">
                            <button type="button" onClick={onSave} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {isEditing ? '수정' : '추가'}
                            </button>
                            <button type="button" onClick={onCloseDrawer} className="w-full text-slate-600 dark:text-slate-400">
                                안할래요
                            </button>
                        </div>
                    </form>
                )}
            </CommonDrawer>

            {/* Status Drawer */}
            <AdminDrawer
                isOpen={isStatusDrawerOpen}
                onClose={() => setIsStatusDrawerOpen(false)}
                name="status"
                apiUrl="/api/statuses"
                onSelect={(status) => handleInputChange('status_id', status)}
                onSaveComplete={fetchAllData}
            />

            {/* Roles Drawer */}
            <AdminDrawer
                isOpen={isRolesDrawerOpen}
                onClose={() => setIsRolesDrawerOpen(false)}
                name="role"
                apiUrl="/api/roles"
                onSelect={(role) => handleInputChange('role_id', role)}
                onSaveComplete={fetchAllData}
            />


            <CommonDrawer
                isOpen={isUploadOpen}
                onClose={onCloseDrawer}
                title='파일 업로드'>

                <div className='px-6'>
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpload}>업로드</button>
                    {/* <pre>{JSON.stringify(usersData, null, 2)}</pre> */}
                </div>

                {/* 업로드 상태 메시지 */}
                {uploadStatus.successCount > 0 || uploadStatus.errorCount > 0 ? (
                    <div className="mt-6 px-6 py-4 border-t border-slate-200">
                        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
                            <div className="text-sm text-gray-700">
                                <strong>{uploadStatus.successCount}</strong>명의 사용자가 성공적으로 업로드되었습니다.
                                {uploadStatus.errorCount > 0 && (
                                    <span className="ml-2 text-red-600">
                                        {uploadStatus.errorCount}명의 사용자 업로드 실패.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}

            </CommonDrawer>

            <CommonDrawer
                isOpen={isDataDownloadOpen}
                onClose={onCloseDrawer}
                title='파일 백업 다운로드'>

                <h1>백업 Drawer!</h1>

            </CommonDrawer>
        </div>
    );
};

export default MemberManagement;
