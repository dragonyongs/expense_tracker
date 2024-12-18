import React, { useState, useEffect } from 'react';
import useAdminMembers from '../../hooks/useAdminMembers';
import AdminHeader from '../../components/AdminHeader';
import AdminMemberToolbar from '../../components/admin/AdminMemberToolbar';
import MemberManagement from '../../components/admin/MemberManagement';

const AdminMembers = () => {
    const {
        filteredMembers,
        pendingMembersCount,
        resignedMembersCount,
        filterMembers,
        fetchAllData,
        statuses,
        roles,
        teams,
        updateMember,
        addMember,
        deleteMember,
        errMsg: hookErrMsg,
    } = useAdminMembers();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [errMsg, setErrMsg] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isStatusDrawerOpen, setIsStatusDrawerOpen] = useState(false);
    const [isRolesDrawerOpen, setIsRolesDrawerOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDataDownloadOpen, setIsDataDownloadOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [password, setPassword] = useState(''); // 비밀번호 변경용 상태

    useEffect(() => {
        setErrMsg(hookErrMsg);
    }, [hookErrMsg]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        filterMembers(category);
    };

    const handleMemberSelect = (id) => {
        const member = filteredMembers.find((m) => m._id === id);
        if (member) {
            setSelectedMember(member);
            setIsEditing(true);
            setIsOpen(true);
        }
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedMember(null);
        setIsEditing(false);
        setIsUploadOpen(false);
        setIsDataDownloadOpen(false);
    };

    const handleAddMember = () => {
        setSelectedMember({ member_name: '', email: '', password: '', position: '', rank: '' });
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleSave = async () => {
        try {
            const updatedMember = { ...selectedMember };
            if (password) { // 비밀번호가 입력된 경우만 업데이트
                updatedMember.password = password;
            }
            if (isEditing) {
                await updateMember(selectedMember);
            } else {
                await addMember(selectedMember);
            }
        } catch (error) {
            console.error(error);
            setErrMsg(error.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setPassword('');
            setIsOpen(false);
        }
    };

    return (
        <>
            <AdminHeader />
            <div className="p-4 sm:p-6">
                <AdminMemberToolbar
                    selectedCategory={selectedCategory}
                    categoryCounts={{ pending: pendingMembersCount, resigned: resignedMembersCount }}
                    onCategorySelect={handleCategoryChange}
                    onAddMember={handleAddMember}
                    onUpload={() => setIsUploadOpen(true)} // 업로드 드로워 열기
                    onDownload={() => setIsDataDownloadOpen(true)} // 다운로드 드로워 열기
                />
                <MemberManagement
                    isOpen={isOpen}
                    isEditing={isEditing}
                    members={filteredMembers}
                    statuses={statuses}
                    roles={roles}
                    teams={teams}
                    errMsg={errMsg}
                    isStatusDrawerOpen={isStatusDrawerOpen}
                    isRolesDrawerOpen={isRolesDrawerOpen}
                    isUploadOpen={isUploadOpen}
                    isDataDownloadOpen={isDataDownloadOpen}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                    onMemberSelect={handleMemberSelect}
                    onCloseDrawer={handleCloseDrawer}
                    onSave={handleSave}
                    setIsStatusDrawerOpen={setIsStatusDrawerOpen}
                    setIsRolesDrawerOpen={setIsRolesDrawerOpen}
                    deleteMember={deleteMember}
                    fetchAllData={fetchAllData}
                    password={password}
                />
            </div>
        </>
    );
};

export default AdminMembers;