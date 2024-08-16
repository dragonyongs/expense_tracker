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
            <h1>로그인 페이지</h1>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="아이디" required />
                <input type="password" placeholder="비밀번호" required />
                <button type="submit">로그인</button>
            </form>
        </>
    );
};

export default Login;
