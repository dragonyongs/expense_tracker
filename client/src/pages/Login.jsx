import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';  // Import the AuthContext
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext); // Use AuthContext instead of AuthProvider
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // 로그인 로직 (API 호출 등)
        // 로그인 성공 시
        login();
        navigate('/'); // Navigate to the main page after login
    };

    return (
        <>
            <div>
                <div>
                    <h1 className='mb-7 text-4xl'>
                        안녕하세요.<br />
                        <span className='font-bold'>Expense Tracker</span> 입니다.
                    </h1>
                    <h4 className='text-lg text-slate-400'>스타리치 어드바이져 직원 전용 입니다.</h4>
                </div>
                <div>
                    <input type="text" placeholder='이메일'/>
                </div>
            </div>
            {/* <h1>로그인 페이지</h1>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="아이디" required />
                <input type="password" placeholder="비밀번호" required />
                <button type="submit">로그인</button>
            </form> */}
        </>
    );
};

export default Login;
