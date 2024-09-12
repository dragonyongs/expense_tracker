import React from 'react'
import { ColorRing } from 'react-loader-spinner';

const Loading = () => {
  return (
    <div className='flex justify-center items-center w-full h-screen'>
        <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#0433FF', '#2A57FF', '#7A9FFF', '#1E4CFF', '#0056B3']}
        />
    </div>
  )
}

export default Loading;