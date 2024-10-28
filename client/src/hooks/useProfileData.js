import { useState, useEffect, useMemo } from 'react';
import axios from '../services/axiosInstance';
import { API_URLS } from '../services/apiUrls';

const useProfileData = (userId) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        loadDaumPostcodeScript().then(() => {
            setIsScriptLoaded(true);
        });
    }, [userId]);
    
    const [data, setData] = useState({
        member: {},
        introduction: '',
        contacts: [],
        addresses: [],
        dates: [],
    });

    const [deletedItems, setDeletedItems] = useState({
        contacts: [],
        addresses: [],
        dates: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadDaumPostcodeScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.async = true;
            script.onload = resolve;
            document.body.appendChild(script);
        });
    };

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const [contactsRes, addressesRes, datesRes, memberRes, profileRes] = await Promise.all([
                axios.get(`${API_URLS.PHONES}/${userId}`),
                axios.get(`${API_URLS.ADDRESSES}/${userId}`),
                axios.get(`${API_URLS.DATES}/${userId}`),
                axios.get(`${API_URLS.MEMBERS}/${userId}`),
                axios.get(`${API_URLS.PROFILES}/${userId}`)
            ]);
            setData({
                member: memberRes.data || {},
                introduction: profileRes.data?.introduction || '',
                contacts: contactsRes.data || [],
                addresses: addressesRes.data || [],
                dates: datesRes.data || [],
                avatarId: profileRes.data.avatar_id,
                profileId: profileRes.data._id,
            });
            setError(null);
        } catch (error) {
            setError('프로필 데이터를 불러오는데 실패했습니다.');
            console.error('데이터 불러오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const updateIntroduction = (value) => {
        setData((prevData) => ({
            ...prevData,
            introduction: value
        }));
    };

    const handleAddItem = (type, newItem) => {
        setData((prevData) => ({
            ...prevData,
            [type]: [...prevData[type], newItem]
        }));
    };

    const handleUpdateItem = (type, index, field, value) => {
        setData((prevData) => {
            const updatedData = {
                ...prevData,
                [type]: prevData[type].map((item, i) =>
                    i === index ? { ...item, [field]: value } : item
                )
            };
            return updatedData;
        });
    };

    const handleRemoveItem = (type, index) => {
        const itemToDelete = data[type][index];
        setData((prevData) => ({
            ...prevData,
            [type]: prevData[type].filter((_, i) => i !== index)
        }));
        if (itemToDelete._id) {
            setDeletedItems((prevDeleted) => ({
                ...prevDeleted,
                [type]: [...prevDeleted[type], itemToDelete._id]
            }));
        }
    };

    const personalContact = useMemo(() => 
        data.contacts.find(contact => contact.phone_type === 'personal_mobile'), 
        [data.contacts]
    );
    
    const companyContact = useMemo(() => 
        data.contacts.find(contact => contact.phone_type === 'company_phone'), 
        [data.contacts]
    );

    const handleDaumPostCode = (index) => {
        if (!isScriptLoaded) return;
    
        new window.daum.Postcode({
            oncomplete: (data) => {
                const fullAddress = data.address;
                const postalCode = data.zonecode;
    
                // useProfileData의 handleUpdateItem 함수로 주소 업데이트
                handleUpdateItem('addresses', index, 'address_line1', fullAddress);
                handleUpdateItem('addresses', index, 'postal_code', postalCode);
            }
        }).open();
    };

    return {
        handleDaumPostCode,
        personalContact,
        companyContact,
        data,
        deletedItems,
        setLoading,
        loading,
        error,
        fetchProfileData,
        handleAddItem,
        handleUpdateItem,
        handleRemoveItem,
        setData,
        updateIntroduction,
    };
};

export default useProfileData;