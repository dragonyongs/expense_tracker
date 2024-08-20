import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { FloatingLabel } from "flowbite-react";
import { Button } from 'flowbite-react';

const Signin = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

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
        setErrorMessage(''); // 이전 에러 메시지 초기화

        // 로그인 API 호출 로직
        try {
            await login({ email, password }); // email과 password를 포함한 객체로 로그인
            navigate('/'); // 로그인 성공 후 메인 페이지로 이동
        } catch (error) {
            console.error('로그인 실패:', error);
            setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.'); // 에러 메시지 설정
        }

        // 이메일 기억 체크 박스 로직
        if (rememberEmail) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }
    };

    return (
        <div className='relative flex items-center w-full h-full px-10'>
            <div className='w-full'>
                <div className='mb-28'>
                    <div className='flex justify-center items-center w-20 h-20 mb-10 rounded-full bg-newBlue text-white'>
                        <img src="/pig-piggy-bank.svg" className='w-10 h-10'/>
                    </div>
                    <h1 className='mb-7 text-3xl'>
                        안녕하세요.<br />
                        <span className='font-bold'>Expense Tracker</span> 입니다.
                    </h1>
                    <h4 className='text-lg text-slate-400'>스타리치 어드바이져 직원 전용 입니다.</h4>
                </div>
                {errorMessage && <div className="mb-4 text-red-600">{errorMessage}</div>} {/* 에러 메시지 표시 */}
                <form onSubmit={handleLogin}>
                    <div className='flex flex-col gap-y-4 mb-5'>
                        <FloatingLabel
                            variant="standard"
                            label="이메일"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <FloatingLabel
                            variant="standard"
                            label="비밀번호"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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
                    <Button type="submit" color="dark" className='w-full rounded-none'>
                        <span className='text-xl'>로그인</span>
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Signin;
