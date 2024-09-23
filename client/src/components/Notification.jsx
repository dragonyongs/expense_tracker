import React from 'react'
import { GoBell } from "react-icons/go";

function Notification({isDashBoard, role}) {
    return (
        <div className='relative leading-none'>
            <button className={`text-3xl ${isDashBoard && role !== 'super_admin' ? 'text-white' : 'text-gray-700 dark:text-slate-400'}`}>
                <GoBell/>
            </button>
            <span className='absolute top-0 -right-1 bg-red-500 text-white rounded-full text-xs px-1'>3</span>
        </div>
    )
}

export default Notification