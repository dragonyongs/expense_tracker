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

    const [selectedMemberId, setSelectedMemberId] = useState(null); // 관리자가 선택한 유저 ID
    const [avatarConfig, setAvatarConfig] = useState(null); // 접속자의 기본 아바타 설정
    const [targetAvatarConfig, setTargetAvatarConfig] = useState(null); // 관리자가 수정하려는 타겟 유저의 아바타 설정
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

    const fetchAvatarData = useCallback(async (memberId = currentMemberId) => {
        if (!memberId) return;
        console.log('memberId', memberId);
        
        setIsLoading(true);
        try {
            const avatarData = await getAvatar(memberId);
            const mergedConfig = {
                ...genConfig(), // 기본 아바타 설정
                ...avatarData, // 서버에서 가져온 데이터 병합
                faceColor: avatarData.faceColor || randomSkinTone(),
            };
            if (isAdmin && memberId !== user?.member_id) {
                setTargetAvatarConfig(mergedConfig); // 관리자가 타겟 유저 수정 시
            } else {
                setAvatarConfig(mergedConfig); // 접속자 기본 아바타
            }
        } catch (error) {
            console.error('아바타 데이터를 불러오는 데 실패:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentMemberId, isAdmin, user]);

    useEffect(() => {
        // 초기 로드: 로그인한 사용자 데이터를 가져오기
        if (user?.member_id) {
            fetchAvatarData(user.member_id);
        }
    }, [user, isAdmin]);  // user와 isAdmin 상태가 변경될 때만 호출
    
    useEffect(() => {
        // 관리자가 선택한 사용자 데이터 가져오기
        if (isAdmin && selectedMemberId) {
            fetchAvatarData(selectedMemberId);
        }
    }, [isAdmin, selectedMemberId]);  // isAdmin 또는 selectedMemberId가 변경될 때만 호출
    
    
    const handleTargetAvatarChange = (key, value) => {
        if (!isAdmin) return;
        setTargetAvatarConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
    };

    
    const handleSelectUser = (memberId) => {
        if (!isAdmin) return;
        setSelectedMemberId(memberId);
    };

    const generateRandomAvatar = () => {
        setAvatarConfig({
            ...genConfig(),
            faceColor: randomSkinTone(),
        });
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

    // 스타일 변경 로직 (관리자와 접속자 구분)
    const handleStyleChange = (styleKey) => {
        if (isAdmin && selectedMemberId) {
            // 관리자가 선택한 유저의 아바타 수정
            setTargetAvatarConfig((prevConfig) => {
                const currentStyle = prevConfig[styleKey];
                const styleOptions = stylesConfig[styleKey];
                const nextStyle =
                    styleOptions[(styleOptions.indexOf(currentStyle) + 1) % styleOptions.length];
                return { ...prevConfig, [styleKey]: nextStyle };
            });
        } else {
            // 접속자 자신의 아바타 수정
            setAvatarConfig((prevConfig) => {
                const currentStyle = prevConfig[styleKey];
                const styleOptions = stylesConfig[styleKey];
                const nextStyle =
                    styleOptions[(styleOptions.indexOf(currentStyle) + 1) % styleOptions.length];
                return { ...prevConfig, [styleKey]: nextStyle };
            });
        }
    };

    const handleStyleAndColorChange = (styleKey, colorKey) => {
        if (isAdmin && selectedMemberId) {
            // 관리자가 선택한 유저의 아바타 수정
            setTargetAvatarConfig((prevConfig) => {
                const nextStyle =
                    stylesConfig[styleKey][
                        (stylesConfig[styleKey].indexOf(prevConfig[styleKey]) + 1) %
                            stylesConfig[styleKey].length
                    ];
                return {
                    ...prevConfig,
                    [styleKey]: nextStyle,
                    [colorKey]: generateRandomColor(),
                };
            });
        } else {
            // 접속자 자신의 아바타 수정
            setAvatarConfig((prevConfig) => {
                const nextStyle =
                    stylesConfig[styleKey][
                        (stylesConfig[styleKey].indexOf(prevConfig[styleKey]) + 1) %
                            stylesConfig[styleKey].length
                    ];
                return {
                    ...prevConfig,
                    [styleKey]: nextStyle,
                    [colorKey]: generateRandomColor(),
                };
            });
        }
    };

    const value = {
        avatarConfig,
        isAdmin,
        setSelectedMemberId,
        fetchAvatarData,
        handleTargetAvatarChange,
        randomizeColor,
        handleStyleChange,
        handleStyleAndColorChange,
        generateRandomAvatar,
        handleSelectUser,
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};
