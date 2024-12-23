import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PasswordValidation = ({ password }) => {
    const conditions = [
        { id: 1, label: "최소 8자 이상", isValid: (pw) => pw.length >= 8 },
        { id: 2, label: "특수 문자 포함", isValid: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
        { id: 3, label: "대문자 포함", isValid: (pw) => /[A-Z]/.test(pw) },
        { id: 4, label: "숫자 포함", isValid: (pw) => /\d/.test(pw) },
    ];

    return (
        <div className="space-y-2">
            {conditions.map((condition) => {
                const valid = condition.isValid(password);
                return (
                    <div key={condition.id} className="flex items-center gap-2">
                        {valid ? (
                            <FaCheckCircle className="text-green-500" />
                        ) : (
                            <FaTimesCircle className="text-red-500" />
                        )}
                        <span className={`text-sm ${valid ? 'text-green-500' : 'text-red-500'}`}>
                            {condition.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default PasswordValidation;