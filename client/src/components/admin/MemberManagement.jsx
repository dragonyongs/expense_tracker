import React from 'react';
import MemberList from './MemberList';
import CommonDrawer from '../CommonDrawer';
import AdminDrawer from '../AdminDrawer';
import InputField from '../InputField';
import SelectField from '../SelectField';

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
}) => {
    
    const handleInputChange = (field, value) => {
        setSelectedMember({ ...selectedMember, [field]: value });
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

                            <InputField 
                                label="비밀번호" 
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="비밀번호 변경 없음" 
                                required={false} 
                            />
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
                onSelect={(status) => handleInputChange('status_id', status)}
                onSaveComplete={fetchAllData}
            />

            {/* Roles Drawer */}
            <AdminDrawer
                isOpen={isRolesDrawerOpen}
                onClose={() => setIsRolesDrawerOpen(false)}
                name="role"
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
