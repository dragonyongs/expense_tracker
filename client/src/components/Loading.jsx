import React from 'react';
import { ColorRing, ThreeDots } from 'react-loader-spinner';

const Loading = ({ type = "ColorRing" }) => {
  const renderSpinner = () => {
    switch (type) {
      case 'ThreeDots':
        return (
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            color="#0433FF"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        );
      case 'ColorRing':
      default:
        return (
          <div className='flex flex-col justify-center items-center'>
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={['#0433FF', '#2A57FF', '#7A9FFF', '#1E4CFF', '#0056B3']}
            />
            <p>서버 활성화중...</p>
          </div>
        );
    }
  };

  return (
    <div className='flex justify-center items-center w-full h-real-screen dark:bg-slate-900'>
      {renderSpinner()}
    </div>
  );
};

export default Loading;
