import { GoBell } from "react-icons/go";

const Header = () => {
    return (
        <header className='flex justify-between items-center p-4 bg-white shadow-md'>
            <div className='text-2xl font-bold'>Expense Tracker</div>
            <div className='relative leading-none'>
                <button className="text-3xl">
                    <GoBell />
                </button>
                <span className='absolute top-0 -right-1 bg-red-500 text-white rounded-full text-xs px-1'>3</span>
            </div>
        </header>
    );
};

export default Header;