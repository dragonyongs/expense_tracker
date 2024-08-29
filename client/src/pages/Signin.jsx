import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    // 컴포넌트가 마운트될 때 로컬 스토리지에서 savedEmail 가져오기
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrMsg(''); // 이전 에러 메시지 초기화

        try {
            // 로그인 API 호출 시 에러 메시지를 화면에 표시
            await login({ email, password });
            navigate('/'); // 로그인 성공 후 메인 페이지로 이동
        } catch (error) {
            // 서버에서 전달된 에러 메시지 설정
            setErrMsg(error.message);
        }

        // 이메일 기억 체크 박스 로직
        if (rememberEmail) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }
    };

    return (
        <div className='relative flex items-center w-full h-full'>
            <div className='w-full'>
                <div className='mb-20'>
                    <div className='flex justify-center items-center w-20 h-20 mb-10 rounded-full bg-newBlue text-white'>
                        <img src="/pig-piggy-bank.svg" className='w-10 h-10'/>
                    </div>
                    <h1 className='mb-7 text-3xl tracking-tight'>
                        안녕하세요.<br />
                        <span className='font-bold'>Expense Tracker</span> 입니다.
                    </h1>
                    <h4 className='text-lg text-slate-400'>스타리치 어드바이져 직원 전용</h4>
                </div>
                {errMsg && <div className="mb-4 text-red-600">{errMsg}</div>} {/* 에러 메시지 표시 */}
                <form onSubmit={handleLogin}>
                    <div className='flex flex-col gap-y-3 mb-5'>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value)} value={email} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">이메일</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="password" name="password" id="password" onChange={(e) => setPassword(e.target.value)} value={password} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">비밀번호</label>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-7">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600">이메일 기억하기</span>
                        </label>
                        <a href="/signup" className="text-sm text-blue-600 hover:underline">회원가입</a>
                    </div>
                    <button
                        type="submit"
                        className={`w-full text-white ${email && password ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-sm text-lg px-5 py-2.5 me-2 mb-2`}
                        disabled={!email || !password}
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signin;
