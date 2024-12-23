import React from 'react';
import Avatar from 'react-nice-avatar';

const AvatarPreview = ({ shape, avatarConfig, isLoading, className="w-24 h-24" }) => {

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!avatarConfig || Object.keys(avatarConfig).length === 0) {
        return <div>Loading avatar...</div>;
    }

    return (
        <div className="avatar-preview">
            <Avatar className={className} {...avatarConfig} shape={shape} />
        </div>
    );
};

export default AvatarPreview;
