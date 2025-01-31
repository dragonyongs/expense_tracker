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
    const { user } = useContext(AuthContext);
    const isAdmin = ['admin', 'hr_admin', 'super_admin'].includes(user?.role);

    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [avatarConfig, setAvatarConfig] = useState({});
    const [targetAvatarConfig, setTargetAvatarConfig] = useState({});
    // const [isInitialLoading, setIsInitialLoading] = useState(true);

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

    const currentMemberId = useMemo(() => {
        return isAdmin ? selectedMemberId || user?.member_id : user?.member_id;
    }, [isAdmin, selectedMemberId, user]);

    const fetchAvatarData = useCallback(async (memberId = currentMemberId) => {

        // console.log('currentMemberId', currentMemberId);

        if (!memberId) return;
        try {
            const avatarData = await getAvatar(memberId);
            console.log('avatarData', avatarData);
            // if (isAdmin && memberId !== user?.member_id) {
                setTargetAvatarConfig(avatarData);
            // } else {
            //     setAvatarConfig(avatarData);
            // }
        } catch (error) {
        console.error('Failed to fetch avatar data:', error);
        }
    }, [currentMemberId, isAdmin, user, randomSkinTone]);

    useEffect(() => {
        if (isAdmin && currentMemberId) {
            fetchAvatarData(currentMemberId);
        }
    }, [isAdmin, currentMemberId, fetchAvatarData]);

    const handleTargetAvatarChange = (key, value) => {
        if (!isAdmin) return;
        setTargetAvatarConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
    };

    const handleSelectUser = (currentMemberId) => {
        if (!isAdmin) return;
        // console.log('memberId', currentMemberId);
        setSelectedMemberId(currentMemberId);
         // 선택된 멤버 정보 로드
        fetchAvatarData(currentMemberId);
    };

    const generateRandomAvatar = () => {
        setTargetAvatarConfig({
            ...genConfig(),
            faceColor: randomSkinTone(),
        });
    };

    const randomizeColor = (key) => {
        // if (isAdmin && selectedMemberId !== user?.member_id) {
            setTargetAvatarConfig((prevConfig) => {
                if (key === 'faceColor') {
                    return { ...prevConfig, [key]: generateRandomSkinTone() };
                } else {
                    return { ...prevConfig, [key]: generateRandomColor() };
                }
            });
        // } else {
        //     setAvatarConfig((prevConfig) => {
        //         if (key === 'faceColor') {
        //             return { ...prevConfig, [key]: generateRandomSkinTone() };
        //         } else {
        //             return { ...prevConfig, [key]: generateRandomColor() };
        //         }
        //     });
        // }
    };

    // const handleStyleChange = (styleKey) => {
    //     const currentStyle = avatarConfig[styleKey];
    //     const styleOptions = stylesConfig[styleKey];
    //     const nextStyle = styleOptions[(styleOptions.indexOf(currentStyle) + 1) % styleOptions.length];
    //     setAvatarConfig((prevConfig) => ({ ...prevConfig, [styleKey]: nextStyle }));
    // };

    // const handleStyleAndColorChange = (styleKey, colorKey) => {
    //     const nextStyle = stylesConfig[styleKey][(stylesConfig[styleKey].indexOf(avatarConfig[styleKey]) + 1) % stylesConfig[styleKey].length];
        
    //     setAvatarConfig((prevConfig) => ({
    //     ...prevConfig,
    //     [styleKey]: nextStyle,
    //     [colorKey]: generateRandomColor(),
    //     }));
    // };

    const handleStyleChange = (styleKey) => {

        // if (isAdmin && selectedMemberId && selectedMemberId !== user?.member_id) {
            setTargetAvatarConfig((prevConfig) => {
                // console.log('setTargetAvatarConfig-prevConfig', prevConfig);
                // console.log('handleStyleChange-어드민 선택 프로필', selectedMemberId, user?.member_id);

                const currentStyle = prevConfig[styleKey];
                const styleOptions = stylesConfig[styleKey];
                const nextStyle =
                    styleOptions[(styleOptions.indexOf(currentStyle) + 1) % 
                    styleOptions.length];
                return { ...prevConfig, [styleKey]: nextStyle };
            });
        // } else {
        //     console.log('사용자 프로필');
        //     setAvatarConfig((prevConfig) => {
        //         const currentStyle = prevConfig[styleKey];
        //         const styleOptions = stylesConfig[styleKey];
        //         const nextStyle =
        //             styleOptions[(styleOptions.indexOf(currentStyle) + 1) % styleOptions.length];
        //         return { ...prevConfig, [styleKey]: nextStyle };
        //     });
        // }
    };

    const handleStyleAndColorChange = (styleKey, colorKey) => {
    //     if (isAdmin && selectedMemberId && selectedMemberId !== user?.member_id) {
    //         console.log('handleStyleAndColorChange-어드민 선택 프로필');
            setTargetAvatarConfig((prevConfig) => {
                // console.log('handleStyleAndColorChange-prevConfig', prevConfig);
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
        // } else {
        //     console.log('사용자 프로필');
        //     setAvatarConfig((prevConfig) => {
        //         const nextStyle =
        //             stylesConfig[styleKey][
        //                 (stylesConfig[styleKey].indexOf(prevConfig[styleKey]) + 1) %
        //                 stylesConfig[styleKey].length
        //             ];
                    
        //         return {
        //             ...prevConfig,
        //             [styleKey]: nextStyle,
        //             [colorKey]: generateRandomColor(),
        //         };
        //     });
        // }
    };

    const value = {
        avatarConfig,
        targetAvatarConfig,
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

    // if (isInitialLoading) {
    //     return <div className='flex justify-center items-center h-screen'><p>Loading...</p></div>;
    // }

    return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};