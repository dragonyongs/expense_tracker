import { useDarkMode } from '../context/DarkModeContext';
import { LuMoon, LuSun } from "react-icons/lu";

function DarkMode({isDashBoard, role}) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className='relative leading-none'>
            <button
                onClick={toggleDarkMode}
                className={`text-3xl ${isDashBoard && role !== 'super_admin' ? 'text-white' : 'text-gray-700 dark:text-slate-400'}`}
            >
                {isDarkMode ? <LuSun /> :  <LuMoon />}
            </button>
        </div>
    );
}

export default DarkMode;