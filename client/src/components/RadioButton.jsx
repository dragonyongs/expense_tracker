import React from 'react';

const RadioButton = ({ label, value, checked, onChange }) => {
    return (
        <div
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                ${checked ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}
                hover:border-blue-500`}
            onClick={() => onChange(value)}
        >
            <input
                type="radio"
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="hidden"
            />
            <span className={`flex-1 text-gray-700 ${checked ? 'font-semibold' : ''}`}>{label}</span>
        </div>
    );
};

export default RadioButton;
