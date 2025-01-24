import React from 'react';
import Avatar from 'react-nice-avatar';

const AvatarPreview = ({ 
    shape = 'circle', 
    avatarConfig = {}, 
    isLoading = false, 
    className = "w-24 h-24" 
}) => {
    // 로딩 상태 처리
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // avatarConfig가 비어있거나 필수 속성이 없는 경우 처리
    if (!avatarConfig || !avatarConfig.faceColor) {
        return <div>Loading avatar...</div>;
    }

    return (
        <div className="avatar-preview flex items-center justify-center">
            <Avatar 
                className={className} 
                {...avatarConfig} 
                shape={shape} 
            />
        </div>
    );
};

export default AvatarPreview;
