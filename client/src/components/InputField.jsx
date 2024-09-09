const InputField = ({ label, id, value, onChange, placeholder, className = "bg-slate-100 border-0", type = "text", required = false, disabled = false }) => {
    return (
        <div className={`flex flex-col gap-2 ${type === 'hidden'? "hidden" : ""}`}>
            <div className="flex justify-between">
                <label htmlFor={id}>{label}</label>
                {!required ? <span className="text-sm text-slate-400">(선택)</span> : ''}
            </div>
            <input 
                id={id}
                name={id}
                type={type}
                className={`${className} w-full rounded-md placeholder:text-slate-400 ${!disabled? '' : 'bg-slate-200 text-slate-500'}`}
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