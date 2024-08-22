const InputField = ({ label, id, value, onChange, placeholder, type = "text", required = false }) => {
    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input 
                id={id}
                name={id}
                type={type}
                className="w-full rounded-md border-0 bg-slate-100 placeholder:text-slate-400"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
};

export default InputField;