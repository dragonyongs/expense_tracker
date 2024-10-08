const InputField = ({ label, id, value='', onChange, placeholder, className = "bg-slate-100 border-0", type = "text", required = false, disabled = false }) => {
    return (
        <div className={`flex flex-col gap-2 ${type === 'hidden'? "hidden" : ""}`}>
            <div className="flex justify-between">
                <label htmlFor={id} className="dark:text-slate-300 dark:font-normal">{label}</label>
                {!required ? <span className="text-sm text-slate-400 dark:text-slate-500">(선택)</span> : ''}
            </div>
            <input 
                id={id}
                name={id}
                type={type}
                className={`${className} w-full py-2 px-3 rounded-md placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500 ${!disabled? '' : 'disabled:border-slate-300 disabled:text-slate-300 disabled:bg-slate-200 disabled:placeholder:text-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:disabled:placeholder:text-slate-500'}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                autoComplete="off"
            />
        </div>
    );
};

export default InputField;