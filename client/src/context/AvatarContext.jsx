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
    const { user } = useContext(AuthContext);

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
        shirtColor: randomColor(),
        bgColor: randomColor(),
        isGradient: false,
    });

    const stylesConfig = {
        sex: ['man', 'woman'],
        hairStyle: ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'],
        hatStyle: ['none', 'beanie', 'turban'],
        eyeStyle: ['circle', 'oval', 'smile'],
        noseStyle: ['short', 'long', 'round'],
        mouthStyle: ['laugh', 'smile', 'peace'],
        shirtStyle: ['hoody', 'short', 'polo'],
        earSize: ['small', 'big'],
        glassesStyle: ['none', 'round', 'square'],
	};

    const memberId = user?.member_id;

    useEffect(() => {
        const fetchAvatarData = async () => {
            try {
                const avatarData = await getAvatar(memberId);
                if (avatarData) {
                    setAvatarConfig(avatarData);
                } else {
                    console.log("아바타 데이터가 없습니다, 랜덤 값을 사용합니다.");
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log("아바타 데이터가 없어 랜덤 값을 사용합니다.");
                } else {
                    console.error('Error fetching avatar data:', error.message);
                }
            }
        };
    
        if (memberId) {
            fetchAvatarData();
        }
    }, [memberId]);
    

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
    };

    return (
        <AvatarContext.Provider value={value}>
            {children}
        </AvatarContext.Provider>
    );
};
