import React from 'react';
import Avatar from 'react-nice-avatar';

const AvatarPreview = ({ shape, avatarConfig, isLoading, className = "w-24 h-24" }) => {

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!avatarConfig || !avatarConfig.faceColor) {
        return <div className='flex justify-center items-center bg-slate-50 rounded-full w-24 h-24'>미설정</div>;
    }

    return (
        <div className="avatar-preview">
            <Avatar 
                className={className} 
                {...avatarConfig} 
                faceColor={avatarConfig.faceColor}
                shape={shape} 
            />
        </div>
    );
};

export default AvatarPreview;
