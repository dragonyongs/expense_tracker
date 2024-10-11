import React from 'react';
import Avatar from 'react-nice-avatar';

const AvatarPreview = ({ shape, avatarConfig }) => {
    return (
        <div className="avatar-preview">
            <Avatar className="w-24 h-24" {...avatarConfig} shape={shape} />
        </div>
    );
};

export default AvatarPreview;
