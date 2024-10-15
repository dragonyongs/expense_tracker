import { IoIosArrowDown } from 'react-icons/io';

const SelectField = ({ label, id, value, onChange, options = [], placeholder = "선택하세요", className = "bg-slate-100 border-0", required = false, disabled = false }) => {
    return (
        <div className={`flex flex-col gap-2`}>
            <div className="flex justify-between">
                <label htmlFor={id} className="dark:text-slate-300 dark:font-normal">{label}</label>
                {!required ? <span className="text-sm text-slate-400">(선택)</span> : ''}
            </div>
            <div className="relative">
                <select
                    id={id}
                    name={id}
                    className={`${className} w-full p-2.5 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 ${!disabled ? '' : 'bg-slate-200 text-gray-800'} dark:bg-slate-900 dark:disabled:border-slate-600 dark:disabled:text-slate-600 dark:placeholder-slate-400 dark:text-white appearance-none`}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <IoIosArrowDown className="w-4 h-4 text-gray-500 dark:text-gray-50" />
                </div>
            </div>
        </div>
    );
};

export default SelectField;