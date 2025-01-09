import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../services/axiosInstance";
import { FaCheck } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";

const USER_REGEX = /^[가-힣]{2,6}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGISTER_URL = '/api/members';



const InputField = ({ 
    label, 
    id, 
    type, 
    value, 
    onChange, 
    isValid, 
    validationMessage, 
    placeholder,
    onFocus,
    onBlur,
    ref
}) => (
    <div className="mb-4">
        <div className="flex items-center gap-x-4 mb-2">
            <label htmlFor={id} className="text-sm font-medium dark:text-slate-100">
                {label}
            </label>
            <FaCheck className={value && isValid ? "text-green-500" : "hidden"} />
            <FaCheck className={value && !isValid ? "text-red-500" : "hidden"} />
        </div>
        <input
            id={id}
            ref={ref}
            type={type}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-slate-800 dark:border-slate-600 dark:placeholder:text-slate-500 dark:text-slate-200"
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            onFocus={onFocus}
            onBlur={onBlur}
            required
        />
        {validationMessage && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-x-1">
                <IoInformationCircleOutline className="mt-1" />
                {validationMessage}
            </p>
        )}
    </div>
);

const Signup = () => {
    const navigate = useNavigate();
    const emailRef = useRef();

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
    });

    const [validations, setValidations] = useState({
        email: false,
        name: false,
        password: false,
        confirmPassword: false
    });

    const [focus, setFocus] = useState({
        email: false,
        name: false,
        password: false,
        confirmPassword: false
    });

    const [errMsg, setErrMsg] = useState('');

    const ERROR_MESSAGES = {
        name: "2자~6자 한글 문자로 입력해주세요",
        email: "이메일 형식을 맞춰 주세요. @ 필수 입니다.",
        password: "8자 이상 대문자, 특수기호(!@#$%), 숫자, 영문 조합으로 입력해주세요",
        confirmPassword: "비밀번호가 일치하지 않습니다",
    };
    
    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    // useEffect(() => {
    //     setValidations({
    //         name: USER_REGEX.test(formData.name),
    //         email: EMAIL_REGEX.test(formData.email),
    //         password: PWD_REGEX.test(formData.password),
    //         confirmPassword: formData.password === formData.confirmPassword,
    //     });
    // }, [formData]);

    useEffect(() => {
        const newValidations = Object.keys(formData).reduce((acc, field) => {
            acc[field] = validateField(field, formData[field]);
            return acc;
        }, {});
        setValidations(newValidations);
    }, [formData]);
    

    useEffect(() => {
        setErrMsg('');
    }, [formData]);

    const handleApiError = (err) => {
        if (!err.response) {
            return '서버에서 응답이 없습니다';
        }
        if (err.response.status === 409) {
            return '이미 사용중인 이메일입니다';
        }
        return '회원가입에 실패했습니다';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!Object.values(validations).every(Boolean)) {
            setErrMsg("모든 필드를 올바르게 입력해주세요");
            return;
        }

        try {
            const trimmedData = {
                member_name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password.trim(),
            };

            await axios.post(REGISTER_URL, JSON.stringify(trimmedData), {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            localStorage.setItem('savedEmail', formData.email);
            navigate('/');
        } catch (err) {
            setErrMsg(handleApiError(err));
        }
    };
    
    // const handleInputChange = (field) => (e) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         [field]: e.target.value
    //     }));
    // };

    // const handleFocus = (field) => () => {
    //     setFocus(prev => ({
    //         ...prev,
    //         [field]: true
    //     }));
    // };

    // const handleBlur = (field) => () => {
    //     setFocus(prev => ({
    //         ...prev,
    //         [field]: false
    //     }));
    // };

    const handleChange = (field) => (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleFocusBlur = (field, focused) => () => {
        setFocus(prev => ({ ...prev, [field]: focused }));
    };
    
    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                return USER_REGEX.test(value);
            case 'email':
                return EMAIL_REGEX.test(value);
            case 'password':
                return PWD_REGEX.test(value);
            case 'confirmPassword':
                return value === formData.password;
            default:
                return false;
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col md:justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <div className="p-6 md:p-8 space-y-8">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                        <IoIosArrowRoundBack className="w-5 h-5 mr-1" />
                        돌아가기
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold dark:text-slate-200">
                            로그인에 사용할 이메일과<br />
                            비밀번호를 작성해주세요.
                        </h2>
                    </div>

                    {/* Error Message */}
                    {errMsg && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                            <p className="text-red-600 dark:text-red-200 text-sm flex items-center gap-2">
                                <IoInformationCircleOutline className="w-5 h-5" />
                                {errMsg}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            label="이메일"
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            isValid={validations.email}
                            validationMessage={focus.email && !validations.email ? ERROR_MESSAGES.email : ""}
                            placeholder="example@email.com"
                            onFocus={handleFocusBlur('email', true)}
                            onBlur={handleFocusBlur('email', false)}
                            ref={emailRef}
                        />

                        <InputField
                            label="이름"
                            id="member_name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange('name')}
                            isValid={validations.name}
                            validationMessage={focus.name && !validations.name ? ERROR_MESSAGES.name : ""}
                            placeholder="사용자 이름 입력"
                            onFocus={handleFocusBlur('name', true)}
                            onBlur={handleFocusBlur('name', false)}
                        />

                        <InputField
                            label="비밀번호"
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            isValid={validations.password}
                            validationMessage={focus.password && !validations.password ? ERROR_MESSAGES.password : ""}
                            placeholder="비밀번호 입력"
                            onFocus={handleFocusBlur('password', true)}
                            onBlur={handleFocusBlur('password', false)}
                        />

                        <InputField
                            label="비밀번호 확인"
                            id="confirm_pwd"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            isValid={validations.confirmPassword}
                            validationMessage={focus.confirmPassword && !validations.confirmPassword ? ERROR_MESSAGES.confirmPassword : ""}
                            placeholder="동일한 비밀번호 재입력"
                            onFocus={handleFocusBlur('confirmPassword', true)}
                            onBlur={handleFocusBlur('confirmPassword', false)}
                        />

                        <div className="pt-4 space-y-3">
                            <button
                                type="submit"
                                disabled={!Object.values(validations).every(Boolean)}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                카드 지출 관리 시작하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;