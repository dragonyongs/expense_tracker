import { GoHome } from "react-icons/go";
import { PiPencilSimpleLine } from "react-icons/pi";
import { GoNote } from "react-icons/go";
import { LuFolderLock } from "react-icons/lu";

const Tab = () => {
    return (
        <nav className='bg-white shadow-md p-4 flex justify-around'>
            <button className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoHome className="text-2xl" />
                </div>
                <span className="text-sm">홈</span>
            </button>
            <button className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-8 h-8'>
                    <PiPencilSimpleLine className="text-2xl" />
                </div>
                <span className="text-sm">기록</span>
            </button>
            <button className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoNote className="text-2xl" />
                </div>
                <span className="text-sm">내역</span>
            </button>
            <button className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-8 h-8'>
                    <LuFolderLock className="text-2xl" />
                </div>
                <span className="text-sm">관리</span>
            </button>
        </nav>
    );
};

export default Tab;
