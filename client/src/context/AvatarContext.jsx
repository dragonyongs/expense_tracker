import React, { createContext, useState, useCallback, useEffect, useContext, useMemo } from 'react';
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

const randomSkinTone = () => {
    const skinTones = [
        '#f9d5b4', '#f7c8a6', '#eac09d', '#e3a984',
        '#f5e0d3', '#eac7b1', '#d8a08c', '#c68672',
        '#7d4b3b', '#603d30', '#4a2c22', '#3a231b',
    ];
    return skinTones[Math.floor(Math.random() * skinTones.length)];
};

export const AvatarProvider = ({ children }) => {
    const { user } = useContext(AuthContext); // 로그인한 사용자 정보
    const isAdmin = ['admin', 'hr_admin', 'super_admin'].includes(user?.role);

    const [selectedMemberId, setSelectedMemberId] = useState(null); // 관리자가 선택한 사용자 ID
    const [avatarConfig, setAvatarConfig] = useState({
        sex: 'man',
        shape: 'circle',
        faceColor: '#e3a984', //randomSkinTone() 초기화 체크로 주석처리
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
    const [isLoading, setIsLoading] = useState(false);

    const currentMemberId = useMemo(() => {
        return isAdmin ? selectedMemberId || user?.member_id : user?.member_id;
    }, [isAdmin, selectedMemberId, user]);

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

    const generateRandomColor = useCallback(() => randomColor(), []);
    const generateRandomSkinTone = useCallback(() => randomSkinTone(), []);

    const fetchAvatarData = useCallback(async () => {
        if (!currentMemberId) return;
        setIsLoading(true);
        try {
            const avatarData = await getAvatar(currentMemberId);
            const mergedConfig = {
                ...genConfig(),
                ...avatarData,
                faceColor: avatarData.faceColor || randomSkinTone(),
                face: avatarData.face || 'defaultFace',
            };
            setAvatarConfig(mergedConfig);
        } catch (error) {
            console.error('아바타 데이터 가져오기 실패:', error);
            setAvatarConfig({
                ...genConfig(),
                faceColor: randomSkinTone(),
                face: 'defaultFace',
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentMemberId]);

    useEffect(() => {
        if (!currentMemberId && user?.member_id) {
            setSelectedMemberId(user.member_id);
        }
    }, [user?.member_id, currentMemberId]);

    useEffect(() => {
        fetchAvatarData();
    }, [fetchAvatarData]);

    const handleSelectUser = (memberId) => {
        if (!isAdmin) return;
        setSelectedMemberId(memberId);
    };

    const resetSelectedUser = () => setSelectedMemberId(null);

    const setAdminMode = (memberId) => setSelectedMemberId(memberId);
    const resetAdminMode = () => setSelectedMemberId(null);

    const updateAvatarConfig = (key, value) => {
        setAvatarConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
    };

    const randomizeColor = (key) => {
        setAvatarConfig((prevConfig) => {
            if (key === 'faceColor') {
                return { ...prevConfig, [key]: generateRandomSkinTone() };
            } else {
                return { ...prevConfig, [key]: generateRandomColor() };
            }
        });
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

    const generateRandomAvatar = () => {
        setAvatarConfig({
            ...genConfig(),
            faceColor: randomSkinTone(),
        });
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
        currentMemberId,
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};