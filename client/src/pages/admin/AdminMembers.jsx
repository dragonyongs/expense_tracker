import React, { useState, useEffect } from 'react';
import useAdminMembers from '../../hooks/useAdminMembers';
import AdminHeader from '../../components/AdminHeader';
import AdminMemberToolbar from '../../components/admin/AdminMemberToolbar';
import MemberManagement from '../../components/admin/MemberManagement';
import { API_URLS } from '../../services/apiUrls';
import axios from "../../services/axiosInstance";
import * as XLSX from 'xlsx';

const AdminMembers = () => {
    const {
        filteredMembers,
        pendingMembersCount,
        resignedMembersCount,
        filteredMembersCount,
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
    const [password, setPassword] = useState('');
    const [file, setFile] = useState(null);
    const [usersData, setUsersData] = useState([]);
    const [uploadStatus, setUploadStatus] = useState({ successCount: 0, errorCount: 0 });

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
        setSelectedMember({ member_name: '', email: '', password: '', position: '', rank: '', role_id: '', status_id: '', team_id: '', is_admin_created: true, is_password_reset: true });
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleDownload = () => {
        window.location.href = API_URLS.MEMBERS_BACKUP;
    };
    
    const handleSave = async () => {
        try {
            const updatedMember = { ...selectedMember };
            if (password) { 
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

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const phoneTypeMap = {
        '회사': 'company_phone',
        '개인': 'personal_mobile',
        '업무': 'work_mobile',
        '팩스': 'fax'
    };
    
    const addressTypeMap = {
        '집': 'home',
        '회사': 'work',
        '배송': 'delivery'
    };
    
    const dateTypeMap = {
        '생일': 'birthday',
        '입사': 'entry',
        '퇴사': 'leave'
    };

    const getTeamIdByName = async (teamName) => {
        try {
            const response = await axios.get('/api/teams/');
            const teams = response.data; // 팀 목록
    
            // 팀 이름과 매칭되는 팀의 _id 찾기
            const matchedTeam = teams.find(team => team.team_name === teamName);
            
            return matchedTeam ? matchedTeam._id : null; // 매칭된 팀의 _id 반환
        } catch (error) {
            console.error('팀 정보를 가져오는 데 오류가 발생했습니다:', error);
            return null; // 오류 발생 시 null 반환
        }
    };

    const getStatusIdByName = async (statusName) => {
        try {
            const response = await axios.get('/api/statuses/');
            const statuses = response.data; // 상태 목록
    
            // 상태 이름과 매칭되는 상태의 _id 찾기
            const matchedStatus = statuses.find(status => status.status_description === statusName);
            
            return matchedStatus ? matchedStatus._id : null; // 매칭된 상태의 _id 반환
        } catch (error) {
            console.error('상태 정보를 가져오는 데 오류가 발생했습니다:', error);
            return null; // 오류 발생 시 null 반환
        }
    };

    const getRoleIdByName = async (roleName) => {
        try {
            const response = await axios.get('/api/roles/');
            const roles = response.data; // 역할 목록
    
            // 역할 이름과 매칭되는 역할의 _id 찾기
            const matchedRole = roles.find(role => role.role_description === roleName);
            
            return matchedRole ? matchedRole._id : null; // 매칭된 역할의 _id 반환
        } catch (error) {
            console.error('역할 정보를 가져오는 데 오류가 발생했습니다:', error);
            return null; // 오류 발생 시 null 반환
        }
    };
    
    const handleUpload = async () => {
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
    
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
                const usersArray = [];
                for (let index = 1; index < rows.length; index++) {
                    const row = rows[index];
                    if (row.length < 16) continue;
    
                    const teamId = await getTeamIdByName(row[0]);
                    const statusId = await getStatusIdByName(row[15]);
                    const roleId = await getRoleIdByName(row[16]);
    
                    const phones = parsePhones({'개인':row[4], '회사':row[5], 'extension':row[6], "업무":row[7] });
                    const addresses = parseAddresses({'집':row[9],'회사':row[10], '배송':row[11]});
                    const dates = parseDates({'입사': row[12], '퇴사':row[13], '생일':row[14]});
                    const user = {
                        member_name: row[1]?.trim() || '',
                        email: row[8]?.trim() || '',
                        rank: row[3]?.trim() || '',
                        position: row[2]?.trim() || '',
                        team_id: teamId,
                        status_id: statusId,
                        role_id: roleId,
                        phones,
                        addresses,
                        dates,
                        introduction: row[17]?.trim() || '',
                        is_admin_created: true,
                        is_password_reset: true,
                    };
    
                    usersArray.push(user);
                }
    
                setUsersData(usersArray);
                await saveData(usersArray);
            } catch (error) {
                console.error('파일 처리 오류:', error.message);
                setErrMsg(error.message);
            }
        };
    
        reader.readAsArrayBuffer(file);
    };
    
    // 전화번호 파싱
    const parsePhones = (phonesData) => {
        const phones = [];
    
        Object.entries(phonesData).forEach(([key, value]) => {
            if (value) {
                const phoneType = phoneTypeMap[key];
                if (phoneType) {
                    phones.push({
                        phone_type: phoneType,
                        phone_name: key,
                        phone_number: value?.trim(),
                        extension: key === '회사' && phonesData.extension !== undefined ? phonesData.extension : null,
                    });
                }
            }
        });
    
        return phones;
    };
    
    // const parsePhones = (phoneString) => {
    //     if (!phoneString) return [];
    //     return phoneString.split(',').map(phone => {
    //         const [type, number] = phone.split(':');
    //         const extensionMatch = number.match(/\(([^)]+)\)/);
    //         const phoneNumber = number.replace(/\s*\([^)]+\)\s*/, '').trim();
    //         return {
    //             phone_type: phoneTypeMap[type.trim()] || type.trim(),
    //             phone_name: type.trim(),
    //             phone_number: phoneNumber,
    //             extension: extensionMatch ? extensionMatch[1] : '',
    //         };
    //     });
    // };
    
    // 주소 파싱
    const parseAddresses = (addressesData) => {
        const addresses = [];
    
        Object.entries(addressesData).forEach(([key, value]) => {
            if (value) {
                const fullAddress = value?.trim();
                const [line1, line2WithPostal] = fullAddress.split(',');
                const postalCodeMatch = line2WithPostal ? line2WithPostal.match(/\[([^\]]+)\]/) : null;
    
                addresses.push({
                    address_type: addressTypeMap[key?.trim()] || key.trim(),
                    address_name: key?.trim(),
                    address_line1: line1?.trim(),
                    address_line2: postalCodeMatch 
                        ? line2WithPostal.replace(postalCodeMatch[0], '')?.trim() 
                        : (line2WithPostal || '')?.trim(),
                    postal_code: postalCodeMatch ? postalCodeMatch[1] : '',
                });
            }
        });
    
        return addresses;
    };
    // const parseAddresses = (addressString) => {
    //     if (!addressString) return [];
    //     return addressString.split(',').map(address => {
    //         const [name, fullAddress] = address.split(':');
    //         const [line1, line2WithPostal] = fullAddress.split(' / ');
    //         // const postalCodeMatch = line2WithPostal.match(/\(([^)]+)\)/);
    //         const postalCodeMatch = line2WithPostal.match(/\[([^\]]+)\]/);

    //         return {
    //             address_type: addressTypeMap[name.trim()] || name.trim(),
    //             address_name: name.trim(),
    //             address_line1: line1.trim(),
    //             address_line2: postalCodeMatch ? line2WithPostal.replace(postalCodeMatch[0], '').trim() : '',
    //             postal_code: postalCodeMatch ? postalCodeMatch[1] : '',
    //         };
    //     });
    // };
    
    // 날짜 파싱
    const excelDateToJSDate = (excelDate) => {
        const baseDate = new Date(1900, 0, 1);
        const jsDate = new Date(baseDate.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000); 
        return jsDate;
    };
    
    const parseDates = (datesData) => {
        const dates = [];
        Object.entries(datesData).forEach(([key, value]) => {
            if (value) {
                const dateType = dateTypeMap[key];
                if (dateType) {
                    dates.push({
                        date_type: dateType,
                        date_name: key,
                        date: excelDateToJSDate(value),
                    });
                }
            }
        });
    
        return dates;
    };
    // const parseDates = (dateString) => {
    //     if (!dateString) return [];
    //     return dateString.split(',').map(dateEntry => {
    //         const [name, date] = dateEntry.split(':');
    //         return {
    //             date_type: dateTypeMap[name.trim()] || name.trim(),
    //             date_name: name.trim(),
    //             date: new Date(date.trim()),
    //         };
    //     });
    // };
    
    const saveData = async (usersArray) => {

        // 초기 카운트 설정
        let successCount = 0;
        let errorCount = 0;

        for (const user of usersArray) {
            if (!user.member_name || !user.email) {
                console.warn('빈 칸이 있는 사용자 정보가 있어 저장하지 않습니다:', user);
                errorCount++; // 실패 카운트 증가
                continue;
            }

            try {
                // 이메일로 기존 멤버 검색
                const existingMemberResponse = await axios.get(`/api/members/email?email=${user.email}`);
                const { found, member } = existingMemberResponse.data;

                if (found) {
                    console.log('기존 멤버가 이미 존재합니다. 저장하지 않습니다:', member.email);
                    errorCount++; // 실패 카운트 증가
                    continue;
                }

                // 새로운 멤버 생성 요청
                const response = await axios.post('/api/members', user);

                // 응답 상태 코드가 201인 경우에만 성공으로 처리
                if (response.status === 201) {
                    successCount++; // 성공 카운트 증가
                    const memberId = response.data.member._id;
                    const profileId = response.data.profile._id;

                    console.log('새 멤버 생성 완료:', response.data, memberId, profileId, user);

                    // 추가 데이터 저장
                    await addRelatedData(memberId, profileId, user);
                } else {
                    console.warn('멤버 생성 실패:', user.email);
                    errorCount++; // 실패 카운트 증가
                }

            } catch (error) {
                console.error('사용자 생성 오류:', error.response?.data || error.message);
                setErrMsg(error.message);
                errorCount++; // 실패 카운트 증가
            }
        }

        // 최종 카운트 상태 업데이트
        setUploadStatus({ successCount, errorCount });
    };
    
    
    const addRelatedData = async (memberId, profileId, user) => {
        // 전화번호 추가
        if (user.phones && user.phones.length > 0) {
            for (const phone of user.phones) {
                try {
                    const phoneData = {
                        phone_type: phone.phone_type,
                        phone_name: phone.phone_name,
                        phone_number: phone.phone_number,
                        extension: phone.extension,
                        member_id: memberId,
                    };
                    const savedPhone = await axios.post('/api/phones', phoneData);
                    await axios.patch(`/api/profiles/${profileId}`, {
                        $push: { phones: savedPhone.data._id }
                    });
                } catch (error) {
                    console.error('전화번호 저장 오류:', error.response?.data || error.message);
                }
            }
        }
    
        // 주소 추가
        if (user.addresses && user.addresses.length > 0) {
            for (const address of user.addresses) {
                try {
                    const addressData = {
                        address_type: address.address_type,
                        address_name: address.address_name,
                        address_line1: address.address_line1,
                        address_line2: address.address_line2,
                        postal_code: address.postal_code,
                        member_id: memberId,
                    };
                    const savedAddress = await axios.post('/api/addresses', addressData);
                    await axios.patch(`/api/profiles/${profileId}`, {
                        $push: { addresses: savedAddress.data._id }
                    });
                } catch (error) {
                    console.error('주소 저장 오류:', error.response?.data || error.message);
                }
            }
        }
    
        // 기념일 추가
        if (user.dates && user.dates.length > 0) {
            for (const date of user.dates) {
                try {
                    const dateData = {
                        date_type: date.date_type,
                        date_name: date.date_name,
                        date: date.date,
                        member_id: memberId,
                    };
                    const savedDate = await axios.post('/api/dates', dateData);
                    await axios.patch(`/api/profiles/${profileId}`, {
                        $push: { dates: savedDate.data._id }
                    });
                } catch (error) {
                    console.error('기념일 저장 오류:', error.response?.data || error.message);
                }
            }
        }
    };
    return (
        <>
            <AdminHeader />
            <div className="pt-4 px-4 pb-24 sm:pt-6 sm:px-6 sm:pb-28">
                <AdminMemberToolbar
                    selectedCategory={selectedCategory}
                    categoryCounts={{ pending: pendingMembersCount, resigned: resignedMembersCount, filtered: filteredMembersCount }}
                    onCategorySelect={handleCategoryChange}
                    onAddMember={handleAddMember}ㅋ
                    onUpload={() => setIsUploadOpen(true)}
                    onDownload={handleDownload}
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
                    handleFileChange={handleFileChange}
                    handleUpload={handleUpload}
                    usersData={usersData}
                    uploadStatus={uploadStatus}
                />
            </div>
        </>
    );
};

export default AdminMembers;