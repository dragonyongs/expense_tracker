import { useState, useEffect, useMemo } from 'react';
import axios from '../services/axiosInstance';
import { API_URLS } from '../services/apiUrls';

const useProfileData = (userId, setProfile) => {

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        if (userId) {
            loadDaumPostcodeScript().then(() => {
                setIsScriptLoaded(true);
            });
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchProfileData();
        }
    }, [userId]);

    const [data, setData] = useState({
        member: {},
        introduction: '',
        phones: [],
        addresses: [],
        dates: [],
        avatarId: null, 
    });

    const [deletedItems, setDeletedItems] = useState({
        phones: [],
        addresses: [],
        dates: []
    });

    const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
        try {
            const [phonesRes, addressesRes, datesRes, memberRes, profileRes] = await Promise.all([
                axios.get(`${API_URLS.PHONES}/${userId}`),
                axios.get(`${API_URLS.ADDRESSES}/${userId}`),
                axios.get(`${API_URLS.DATES}/${userId}`),
                axios.get(`${API_URLS.MEMBERS}/${userId}`),
                axios.get(`${API_URLS.PROFILES}/${userId}`)
            ]);

            const sortedDates = datesRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));


            const phoneTypeOrder = {
                company_phone: 1,
                work_mobile: 2,
                fax: 3,
                personal_mobile: 4
            };

            const sortedPhones = phonesRes.data.sort((a, b) => {
                return (phoneTypeOrder[a.phone_type] || 5) - (phoneTypeOrder[b.phone_type] || 5);
            });

            const profileData = {
                member: memberRes.data || {},
                introduction: profileRes.data?.introduction || '',
                phones: sortedPhones || [],
                addresses: addressesRes.data || [],
                dates: sortedDates || [],
                avatarId: profileRes.data.avatar_id,
                profileId: profileRes.data._id,
            };

            setData(profileData);
            setError(null);

            return profileData;
        } catch (error) {
            setError('프로필 데이터를 불러오는데 실패했습니다.');
            console.error('데이터 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateIntroduction = (value) => {
        setData((prevData) => ({
            ...prevData,
            introduction: value
        }));
    };

    const getItemName = (itemType, value) => {
        const nameMapping = {
            address: {
                home: '집',
                work: '회사',
                delivery: '배송',
            },
            phone: {
                company_phone: '회사',
                work_phone: '업무',
                work_mobile: '업무용 모바일',
                personal_mobile: '개인',
            },
            date: {
                entry: '입사',
                birthday: '생일',
                leave: '퇴사',
                loa: '휴직',
            },
        };
    
        return nameMapping[itemType]?.[value] || '없음';
    };
    
    const handleAddItem = (field, newItem) => {
        const validatedItem = {};
    
        if (field === 'addresses') {
            validatedItem.address_type = newItem.address_type || '';
            validatedItem.address_line1 = newItem.address_line1 || '';
            validatedItem.address_line2 = newItem.address_line2 || '';
            validatedItem.postal_code = newItem.postal_code || '';
            validatedItem.address_name = getItemName('address', validatedItem.address_type);
        } else if (field === 'phones') {
            validatedItem.phone_type = newItem.phone_type || '';
            validatedItem.phone_number = newItem.phone_number || '';
            validatedItem.extension = newItem.extension || '';
            validatedItem.phone_name = getItemName('phone', validatedItem.phone_type);
        } else if (field === 'dates') {
            validatedItem.date_type = newItem.date_type || '';
            validatedItem.date = newItem.date || '';
            validatedItem.date_name = getItemName('date', validatedItem.date_type);
        }
    
        setProfile((prevProfile) => ({
            ...prevProfile,
            [field]: [...(prevProfile[field] || []), validatedItem],
        }));
    };
    
    const handleUpdateItem = (key, index, field, value) => {
        setProfile((prevProfile) => {
            const updatedItems = [...(prevProfile[key] || [])];
            if (index < 0 || index >= updatedItems.length) {
                console.error(`Invalid index: ${index} for key: ${key}`);
                return prevProfile;
            }
    
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            };
    
            if (field === 'address_type' || field === 'phone_type' || field === 'date_type') {
                const itemType = field === 'address_type' ? 'address' : field === 'phone_type' ? 'phone' : 'date';
                updatedItems[index][`${itemType}_name`] = getItemName(itemType, value);
            }
    
            return { ...prevProfile, [key]: updatedItems };
        });
    };

    const handleRemoveItem = (type, index, setDeletedItems) => {
        setProfile((prevProfile) => {
            const items = prevProfile[type] || [];
    
            if (index < 0 || index >= items.length) {
                console.error(`Item to delete not found at index: ${index}`);
                return prevProfile;
            }
    
            const itemToDelete = items[index];
    
            if (itemToDelete && itemToDelete._id) {

                setDeletedItems((prevDeleted) => {
                    const updatedDeletedItems = { ...prevDeleted };
    
                    if (!updatedDeletedItems[type].includes(itemToDelete._id)) {
                        updatedDeletedItems[type] = [...updatedDeletedItems[type], itemToDelete._id];
                    }
    
                    return updatedDeletedItems;
                });
            }
    
            return {
                ...prevProfile,
                [type]: items.filter((_, i) => i !== index), // 삭제할 아이템 제외
            };
        });
    };
    
    const personalContact = useMemo(() => 
        data.phones.find(contact => contact.phone_type === 'personal_mobile'), 
        [data.phones]
    );
    
    const companyContact = useMemo(() => 
        data.phones.find(contact => contact.phone_type === 'company_phone'), 
        [data.phones]
    );

    const handleDaumPostCode = (index) => {
        if (!isScriptLoaded) return;
    
        new window.daum.Postcode({
            oncomplete: (data) => {
                const fullAddress = data.address;
                const postalCode = data.zonecode;
    
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
        setIsLoading,
        isLoading,
        error,
        fetchProfileData,
        handleAddItem,
        handleUpdateItem,
        handleRemoveItem,
        setData,
        setProfile,
        setDeletedItems,
        updateIntroduction,
    };
};

export default useProfileData;