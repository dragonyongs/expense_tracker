import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { CiMoneyCheck1 } from "react-icons/ci";

const NewSignin = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrMsg('');

        try {
            await login({ email, password });
            navigate('/');
        } catch (error) {
            setErrMsg(error.message);
        }

        if (rememberEmail) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center  bg-white dark:bg-gray-900 px-4">
            <div className="w-full max-w-md space-y-8 mb-12">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center p-4 bg-newBlue">
                        <CiMoneyCheck1 className="w-12 h-12 text-white" />
                        {/* <img src="/pig-piggy-bank.svg" className="w-12 h-12" alt="Logo" /> */}
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                        스타리치 어드바이져
                    </h2>
                </div>

                {errMsg && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
                        {errMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mx-auto w-full max-w-sm space-y-4">
                {/* Email Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일 아이디 입력"
                            required
                            className="w-full bg-white border border-slate-300 text-black placeholder-white/70 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 입력"
                            required
                            className="w-full bg-white border border-slate-300 text-black placeholder-white/70 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>

                    {/* Remember Email */}
                    <div className="flex items-center justify-between text-black px-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                className="w-4 h-4 rounded border-white/50 bg-blue-400/40 text-blue-500 focus:ring-2 focus:ring-white/50"
                            />
                            <span className="text-sm">이메일 기억하기</span>
                        </label>
                        <a href="/signup" className="text-sm hover:underline">
                            회원가입
                        </a>
                    </div>

                    {/* Login Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={!email || !password}
                            className={`w-full rounded-full py-4 px-6 font-medium text-lg transition-all mt-8
                                ${email && password 
                                    ? 'bg-newBlue text-white hover:bg-blue-900' 
                                    : 'bg-black/20 text-white/70 cursor-not-allowed'}
                            `}
                        >
                            로그인
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default NewSignin;