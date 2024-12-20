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
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md p-5 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-newBlue flex items-center justify-center p-4">
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

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
                                placeholder="이메일"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
                                placeholder="비밀번호"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">이메일 기억하기</span>
                        </label>
                        <a href="/signup" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400">
                            회원가입
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={!email || !password}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
                            ${email && password 
                                ? 'bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/50' 
                                : 'bg-gray-300 cursor-not-allowed dark:bg-gray-700'}
                        `}
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewSignin;