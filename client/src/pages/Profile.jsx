import React, { useState } from 'react'
import { LuBuilding, LuSmartphone, LuHome, LuCalendarDays } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
import { LiaFaxSolid } from "react-icons/lia";
import { TbUserEdit } from "react-icons/tb";
import { RiSignpostLine } from "react-icons/ri";
import Avatar, { genConfig } from 'react-nice-avatar';
import ProfileDrawer from '../components/ProfileDrawer';
import InputField from '../components/InputField';

const randomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const Profile = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState({sample: "sample"});

    // 아바타 설정 상태
    const [avatarConfig, setAvatarConfig] = useState({
        sex: 'man',
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
 	   hairStyle: ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'],
  	   hatStyle: ['none', 'beanie', 'turban'],
   	   eyeStyle: ['circle', 'oval', 'smile'],
       noseStyle: ['short', 'long', 'round'],
       mouthStyle: ['laugh', 'smile', 'peace'],
       shirtStyle: ['hoody', 'short', 'polo'],
	};

{/*
    const handleChange = (key, value) => {
        console.log(key,value)
        setAvatarConfig({ ...avatarConfig, [key]: value });
    };
*/}
    const randomizeColor = (key) => {
        setAvatarConfig({ ...avatarConfig, [key]: randomColor() });
    };
    
    const handleStyleChange = (styleKey) => {
        const currentStyle = avatarConfig[styleKey];
        const styleOptions = stylesConfig[styleKey];
        const currentIndex = styleOptions.indexOf(currentStyle);
        const nextIndex = (currentIndex + 1) % styleOptions.length;
        const nextStyle = styleOptions[nextIndex];

        setAvatarConfig((prevConfig) => ({
            ...prevConfig,
            [styleKey]: nextStyle,
        }));
    };
    
    const handleStyleAndColorChange = (styleKey, colorKey) => {
    	const currentStyle = avatarConfig[styleKey];
    	const styleOptions = stylesConfig[styleKey];
    	const currentIndex = styleOptions.indexOf(currentStyle);
    	const nextIndex = (currentIndex + 1) % styleOptions.length;
    	const nextStyle = styleOptions[nextIndex];

    	setAvatarConfig((prevConfig) => ({
           ...prevConfig,
          [styleKey]: nextStyle,
          [colorKey]: randomColor(),  // 색상 랜덤화
        }));
	};

{/*
    const handleStyleAndColorChange = (styleKey, styleValue, colorKey) => {
        setAvatarConfig((prevConfig) => ({
            ...prevConfig,
            [styleKey]: styleValue,
            [colorKey]: randomColor(),  // 색상 랜덤화
        }));
    };
*/}
    const generateRandomAvatar = () => {
        setAvatarConfig(genConfig()); // 전체 랜덤 설정 불러오기
    };
    
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

    const handleOpenDrawer = () => {
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    return (
        <>
            <header className={`flex justify-between items-center py-4 pl-6 pr-3 dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>프로필</span>
                </div>
                <button className='flex justify-center p-3 dark:text-slate-300 rounded-md active:bg-gray-100 active:text-gray-400 dark:active:bg-slate-600 dark:active:text-slate-400' onClick={handleOpenDrawer}><TbUserEdit className='w-6 h-6'/></button>
            </header>
            <div className='flex flex-col gap-y-3 px-4 pb-4 dark:bg-slate-800'>

                <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                    <div className='absolute top-6 right-6 text-md text-slate-500'>
                        입사 N년차
                    </div>
                    <div className='flex justify-center items-center w-24 h-24 bg-slate-100 rounded-xl overflow-hidden'>
                        <Avatar className="w-full h-full rounded-none" style={{borderRadius: 'none'}} {...avatarConfig} />
                    </div>
                    <div className='font-bold text-3xl'>
                        홍길동
                    </div>

                    <div>
                        <p className='text-slate-800'>
                            1900.00.00(양) 🎂
                        </p>
                        <p className='text-slate-500'><span className='font-semibold text-slate-800'>StarRich Advisor</span> 퍼블리싱팀 팀장</p>
                        <p className='text-slate-500'>What is good today, may be a cliche tomorrow.</p>
                    </div>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <LuSmartphone /> <p className='font-normal text-lg'>010-0000-0000</p>
                        </div>
                        <div className='flex items-center gap-x-2'>
                            <AiOutlineMail /> <p className='font-normal text-lg'>myemail@starrih.co.kr</p>
                        </div>
                    </div>
                    <div className='flex gap-x-3 mt-4'>
                        <button className='w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>이미지 저장</button>
                        <button className='w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>QR 연락처</button>
                    </div>
                </div>

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuBuilding /><span className='w-10 text-nowrap'>회사</span>
                            </div>
                            <span className=''>02-0000-0000 (155)</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuSmartphone /><span className='w-10 text-nowrap'>업무</span>
                            </div>
                            <span className=''>010-0000-0000</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuSmartphone /><span className='w-10 text-nowrap'>개인</span>
                            </div>
                            <span className=''>010-0000-0000</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LiaFaxSolid /><span className='w-10 text-nowrap'>팩스</span>
                            </div>
                            <span className=''>02-569-8470</span>
                        </li>
                    </ul>
                </div>

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuBuilding /><span className='w-7 text-nowrap'>회사</span>
                            </div>
                            <span className=''>서울시 강남구 강남대로62길 23, 역삼빌딩 3층</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuHome /><span className='w-7 text-nowrap'>집</span>
                            </div>
                            <span className=''>서울시 동대문구 약령시로00길 00, 0동 000호(청량리동)</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <RiSignpostLine /><span className='w-7 text-nowrap'>택배</span>
                            </div>
                            <span className=''>서울시 강남구 강남대로62길 3, 한진빌딩 5층</span>
                        </li>
                    </ul>
                </div>

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>입사</span>
                            </div>
                            <span className=''>2017년 2월 1일</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>퇴사</span>
                            </div>
                            <span className=''>2022년 3월 30일</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>재입사</span>
                            </div>
                            <span className=''>2022년 10월 2일</span>
                        </li>
                    </ul>
                </div>
            </div>

            <ProfileDrawer
                isOpen={isOpen}
                title={"프로필 수정"}
                onClose={handleCloseDrawer}
                >
                {/* 아바타 미리보기 및 설정 */}
                <div className="flex flex-col items-center mb-4">
                    {/* 아바타 미리보기 */}
                    <Avatar className="w-24 h-24" {...avatarConfig} />
                    
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
                        {renderStyleButton('noseStyle', '코')}
                        {renderStyleButton('mouthStyle', '입')}
                        {renderStyleAndColorButton('shirtStyle', 'shirtColor', '셔츠')}
                        <button onClick={() => randomizeColor('bgColor')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            배경
                        </button>
                    </div>
                    
                    {/* 아이콘 버튼 */}
                    {/*
                    <div className="flex gap-2 mt-4 flex-wrap justify-start mb-4">
                        <button onClick={generateRandomAvatar} className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            랜덤
                        </button>
                        
                        <button onClick={() => randomizeColor('faceColor')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            피부
                        </button>
                        <button onClick={() => handleChange('earSize', avatarConfig.earSize === 'small' ? 'big' : 'small')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            귀
                        </button>
                        */}
                        {/* 헤어 스타일과 색상 변경 */}
                        {/*
                        <button 
                            onClick={() => handleStyleAndColorChange(
                                'hairStyle', 
                                avatarConfig.hairStyle === 'normal' ? 'thick' : 
                                avatarConfig.hairStyle === 'thick' ? 'mohawk' : 
                                'normal', 
                                'hairColor' // 헤어 색상도 함께 랜덤화
                            )} 
                            className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400"
                        >
                            헤어
                        </button>
                        */}
                        {/* 모자 스타일과 색상 변경 */}
                        {/*
                        <button 
                            onClick={() => handleStyleAndColorChange(
                                'hatStyle', 
                                avatarConfig.hatStyle === 'none' ? 'beanie' : avatarConfig.hatStyle === 'beanie' ? 'turban' : 'none',
                                'hatColor'
                            )} 
                            className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400"
                        >
                            모자
                        </button>
*/}
                        {/* 눈 스타일 변경 */}
                        {/*
                        <button onClick={() => handleChange('eyeStyle', avatarConfig.eyeStyle === 'circle' ? 'oval' : avatarConfig.eyeStyle === 'oval' ? 'smile' : 'circle')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            눈
                        </button>
*/}
                        {/* 코 스타일 변경 */}
                        {/*
                        <button onClick={() => handleChange('noseStyle', avatarConfig.noseStyle === 'short' ? 'long' : avatarConfig.noseStyle === 'long' ? 'round' : 'short')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            코
                        </button>
*/}
                        {/* 입 스타일 변경 */}
                        {/*
                        <button onClick={() => handleChange('mouthStyle', avatarConfig.mouthStyle === 'laugh' ? 'smile' : avatarConfig.mouthStyle === 'smile' ? 'peace' : 'laugh')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            입
                        </button>
*/}
                        {/* 셔츠 스타일과 색상 변경 */}
                        {/*
                        <button 
                            onClick={() => handleStyleAndColorChange(
                                'shirtStyle', 
                                avatarConfig.shirtStyle === 'hoody' ? 'short' : avatarConfig.shirtStyle === 'short' ? 'polo' : 'hoody',
                                'shirtColor'
                            )} 
                            className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400"
                        >
                            셔츠
                        </button>
*/}
                        {/* 배경 색상 변경 */}
                        {/*
                        <button onClick={() => randomizeColor('bgColor')} className="px-4 py-2 bg-white border border-gray-400 text-gray-600 rounded-md dark:bg-slate-600 dark:border-transparent dark:text-slate-400">
                            배경
                        </button>
                    </div>*/}

                </div>
                <div className="flex flex-col space-y-4 dark:text-slate-400">
                    {/* 주소 입력 필드 */}
                    <InputField
                    label="주소 타입"
                    id="address_type"
                    value={profile.address_type || ''}
                    onChange={(e) => setProfile({ ...profile, address_type: e.target.value })}
                    placeholder="예: 집주소, 회사주소, 배송지"
                    required
                    />
                    <InputField
                    label="주소 명칭"
                    id="address_name"
                    value={profile.address_name || ''}
                    onChange={(e) => setProfile({ ...profile, address_name: e.target.value })}
                    placeholder="예: 우주스페이스"
                    required
                    />
                    <InputField
                    label="기본 주소"
                    id="address_line1"
                    value={profile.address_line1 || ''}
                    onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                    placeholder="예: 서울시 강남구 강남대로62길 23"
                    required
                    />
                    <InputField
                    label="세부 주소 (선택)"
                    id="address_line2"
                    value={profile.address_line2 || ''}
                    onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
                    placeholder="예: 역삼빌딩 3층"
                    />
                    <InputField
                    label="우편번호"
                    id="postal_code"
                    value={profile.postal_code || ''}
                    onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                    placeholder="우편번호 입력"
                    required
                    />

                    {/* 연락처 입력 필드 */}
                    <InputField
                    label="전화 타입"
                    id="phone_type"
                    value={profile.phone_type || ''}
                    onChange={(e) => setProfile({ ...profile, phone_type: e.target.value })}
                    placeholder="예: 개인휴대폰, 업무용휴대폰, 회사전화"
                    required
                    />
                    <InputField
                    label="전화 번호"
                    id="phone_number"
                    value={profile.phone_number || ''}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    placeholder="예: 010-0000-0000"
                    required
                    />
                    <InputField
                    label="내선 번호 (선택)"
                    id="extension"
                    value={profile.extension || ''}
                    onChange={(e) => setProfile({ ...profile, extension: e.target.value })}
                    placeholder="내선 번호 (회사 전화일 경우)"
                    />
                </div>
                </ProfileDrawer>
        </>
    )
}

export default Profile;