import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { genConfig } from 'react-nice-avatar';
import { getAvatar } from '../api/avatarApi';
import { AuthContext } from '../context/AuthProvider';

export const AvatarContext = createContext();

const randomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const AvatarProvider = ({ children }) => {
    const { user } = useContext(AuthContext); // 로그인한 사용자 정보
    const isAdmin = ['admin', 'hr_admin', 'super_admin'].includes(user?.role);

    const [selectedMemberId, setSelectedMemberId] = useState(null); // 관리자가 선택한 사용자 ID
    const currentMemberId = isAdmin ? selectedMemberId || user?.member_id : user?.member_id; // 관리자인 경우 선택된 ID 사용

    const handleSelectUser = (memberId) => {
        if (!isAdmin) return; // 관리자가 아닌 경우 아무것도 하지 않음
        setSelectedMemberId(memberId);
    };
    
    const resetSelectedUser = () => {
        setSelectedMemberId(null); // 선택 초기화
    };
    
    
    const [avatarConfig, setAvatarConfig] = useState({
        sex: 'man',
        shape: 'circle',
        faceColor: randomColor(),
        earSize: 'small',
        hairColor: randomColor(),
        hairStyle: 'normal',
        hatColor: randomColor(),
        hatStyle: 'none',
        eyeStyle: 'circle',
        glassesStyle: 'none',
        noseStyle: 'short',
        mouthStyle: 'laugh',
        shirtStyle: 'hoody',
        eyeBrowStyle: 'up',
        shirtColor: randomColor(),
        bgColor: randomColor(),
        isGradient: false,
    });

    const stylesConfig = {
        sex: ['man', 'woman'],
        hairStyle: ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'],
        hatStyle: ['none', 'beanie', 'turban'],
        eyeStyle: ['circle', 'oval', 'smile'],
        eyeBrowStyle: ['up', 'upWoman'],
        noseStyle: ['short', 'long', 'round'],
        mouthStyle: ['laugh', 'smile', 'peace'],
        shirtStyle: ['hoody', 'short', 'polo'],
        earSize: ['small', 'big'],
        glassesStyle: ['none', 'round', 'square'],
	};

    useEffect(() => {
        const fetchAvatarData = async () => {
            if (!currentMemberId) return; // ID가 없으면 중단
            try {
                const avatarData = await getAvatar(currentMemberId);
                setAvatarConfig(avatarData || genConfig()); // ID에 해당하는 아바타 정보 가져오기
            } catch (error) {
                console.error('아바타 데이터 가져오기 실패:', error);
            }
        };

        fetchAvatarData();
    }, [currentMemberId]);

    const setAdminMode = (memberId) => {
        setSelectedMemberId(memberId); // 관리자가 선택한 사용자 ID 설정
    };

    const resetAdminMode = () => {
        setSelectedMemberId(null); // 관리자 모드 초기화
    };

    const updateAvatarConfig = (key, value) => {
        setAvatarConfig((prevConfig) => ({ ...prevConfig, [key]: value })); // 아바타 설정 업데이트
    };

    const generateRandomColor = useCallback(() => randomColor(), []);

    const randomizeColor = (key) => {
        setAvatarConfig((prevConfig) => ({ ...prevConfig, [key]: generateRandomColor() }));
    };

    const handleStyleChange = (styleKey) => {
        const currentStyle = avatarConfig[styleKey];
        const styleOptions = stylesConfig[styleKey];
        const nextStyle = styleOptions[(styleOptions.indexOf(currentStyle) + 1) % styleOptions.length];

        setAvatarConfig((prevConfig) => ({ ...prevConfig, [styleKey]: nextStyle }));
    };

    const handleStyleAndColorChange = (styleKey, colorKey) => {
        const nextStyle = stylesConfig[styleKey][(stylesConfig[styleKey].indexOf(avatarConfig[styleKey]) + 1) % stylesConfig[styleKey].length];
        
        setAvatarConfig((prevConfig) => ({
        ...prevConfig,
        [styleKey]: nextStyle,
        [colorKey]: generateRandomColor(),
        }));
    };

    // 랜덤 아바타 생성 함수 추가
    const generateRandomAvatar = () => {
        setAvatarConfig(genConfig()); // genConfig를 사용하여 랜덤 아바타 생성
    };

    const value = {
        avatarConfig,
        randomizeColor,
        handleStyleChange,
        handleStyleAndColorChange,
        generateRandomAvatar,
        isAdmin,
        handleSelectUser,
        resetSelectedUser,
        setAdminMode,
        resetAdminMode,
        updateAvatarConfig,
        currentMemberId, // 현재 사용자 ID를 Context로 제공
    };

    return (
        <AvatarContext.Provider value={value}>
            {children}
        </AvatarContext.Provider>
    );
};
