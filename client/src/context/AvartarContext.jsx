import React, { createContext, useState, useCallback } from 'react';
import { genConfig } from 'react-nice-avatar'; // genConfig를 import합니다.

const randomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
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
        generateRandomAvatar
    };

    return (
        <AvatarContext.Provider value={value}>
            {children}
        </AvatarContext.Provider>
    );
};
