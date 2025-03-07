import { useState, useEffect } from 'react';
import axios from '../services/axiosInstance';
import { API_URLS } from '../services/apiUrls';

const useAdminMembers = () => {
    const [members, setMembers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [roles, setRoles] = useState([]);
    const [teams, setTeams] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [resignedMembers, setResignedMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [pendingMembersCount, setPendingMembersCount] = useState(0);
    const [resignedMembersCount, setResignedMembersCount] = useState(0);
    const [filteredMembersCount, setFilteredMembersCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

    const fetchData = async (url, setState) => {
        try {
            const response = await axios.get(url);
            setState(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            setErrMsg(error.message || 'fetchData를 불러오는 중 문제가 발생했습니다.');
        }
    };

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                fetchData(API_URLS.MEMBERS, setMembers),
                fetchData(API_URLS.STATUSES, setStatuses),
                fetchData(API_URLS.ROLES, setRoles),
                fetchData(API_URLS.TEAMS, setTeams),
            ]);
            setIsLoading(false);
        } catch(error) {
            setErrMsg(error.message || '데이터를 불러오는 중 문제가 발생했습니다.');
        }

    };

    const updateMember = async (updatedMember) => {
        try {
            const response = await axios.put(`${API_URLS.MEMBERS}/${updatedMember._id}`, updatedMember);
            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member._id === updatedMember._id ? response.data : member
                )
            );
        } catch (error) {
            console.error('Error updating member:', error);
            setErrMsg(error.message || '멤버를 수정하는 중 문제가 발생했습니다.');
        }
    };

    const addMember = async (newMember) => {
        try {
            const response = await axios.post(API_URLS.MEMBERS, newMember);
            setMembers((prevMembers) => [...prevMembers, response.data]);
        } catch (error) {
            console.error('Error adding member:', error);
            setErrMsg(error.message || '멤버를 추가하는 중 문제가 발생했습니다.');
        }
    };

    const deleteMember = async (memberId) => {
        try {
            await axios.delete(`${API_URLS.MEMBERS}/${memberId}`);
            setMembers((prevMembers) =>
                prevMembers.filter((member) => member._id !== memberId)
            );
        } catch (error) {
            console.error('Error deleting member:', error);
            setErrMsg(error.message || '멤버를 삭제하는 중 문제가 발생했습니다.');
        }
    };

    const deleteProfile = async (profileId) => {
        try {
            await axios.delete(`${API_URLS.PROFILES}/${profileId}`);
            setProfiles((prevProfiles) =>
                prevProfiles.filter((profile) => profile._id !== profileId)
            );
        } catch (error) {
            console.error('Error deleting profile:', error);
            setErrMsg(error.message || '프로필을 삭제하는 중 문제가 발생했습니다.');
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (members.length > 0) {
            filterMembers();
        }
    }, [members]);

    const filterMembers = (category) => {
        if (isLoading) return;

        const allPending = members.filter((member) => member.status_id?.status_name === 'pending');
        const allResigned = members.filter((member) => member.status_id?.status_name === 'resigned');

        let filtered = members.filter((member) => member.role_id?.role_name !== 'super_admin' && member.status_id?.status_name !== 'resigned');
        if (category === '요청') filtered = allPending;
        if (category === '퇴사') filtered = allResigned;

        setPendingMembers(allPending);
        setResignedMembers(allResigned);
        setPendingMembersCount(allPending.length);
        setResignedMembersCount(allResigned.length);
        setFilteredMembersCount(filtered.length);
        setFilteredMembers(filtered);
    };

    return {
        errMsg,
        members,
        statuses,
        roles,
        teams,
        pendingMembersCount,
        resignedMembersCount,
        filteredMembersCount,
        filteredMembers,
        fetchAllData,
        filterMembers,
        updateMember, // 멤버 업데이트 함수
        addMember,    // 멤버 추가 함수
        deleteMember, // 멤버 삭제 함수
        deleteProfile,
    };
};

export default useAdminMembers;