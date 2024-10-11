import React, { useContext } from 'react';
import { AvatarContext } from '../context/AvatarContext';
import AvatarPreview from './AvatarPreview';

const AvatarComponent = () => {
    const { avatarConfig, randomizeColor, handleStyleChange, handleStyleAndColorChange, generateRandomAvatar } = useContext(AvatarContext); // generateRandomAvatar를 가져옵니다.

    const renderStyleButton = (styleKey, label) => (
        <button 
            onClick={() => handleStyleChange(styleKey)} 
            className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400"
        >
            {label}
        </button>
    );

    const renderStyleAndColorButton = (styleKey, colorKey, label) => (
        <button 
            onClick={() => handleStyleAndColorChange(styleKey, colorKey)} 
            className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400"
        >
            {label}
        </button>
    );

    return (
        <>
            <AvatarPreview avatarConfig={avatarConfig} shape="circle" /> 

            <div className="flex gap-2 mt-4 flex-wrap justify-start mb-4">
                <button onClick={generateRandomAvatar} className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                    랜덤
                </button>
                <button onClick={() => randomizeColor('faceColor')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                    피부
                </button>
                {renderStyleButton('earSize', '귀')}
                {renderStyleAndColorButton('hairStyle', 'hairColor', '헤어')}
                {renderStyleAndColorButton('hatStyle', 'hatColor', '모자')}
                {renderStyleButton('eyeStyle', '눈')}
                {renderStyleButton('glassesStyle', '안경')}
                {renderStyleButton('noseStyle', '코')}
                {renderStyleButton('mouthStyle', '입')}
                {renderStyleAndColorButton('shirtStyle', 'shirtColor', '셔츠')}
                <button onClick={() => randomizeColor('bgColor')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                    배경
                </button>
            </div>
        </>
    );
};

export default AvatarComponent;