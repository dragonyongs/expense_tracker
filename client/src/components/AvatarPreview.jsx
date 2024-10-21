import React from 'react';
import Avatar from 'react-nice-avatar';

const AvatarPreview = ({ shape, avatarConfig, className="w-24 h-24" }) => {
    return (
        <div className="avatar-preview">
            <Avatar className={className} {...avatarConfig} shape={shape} />
        </div>
    );
};

export default AvatarPreview;
