import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../services/axiosInstance";
import { FaCheck } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";

const USER_REGEX = /^[가-힣]{2,6}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGISTER_URL = '/api/members';

const Signup = () => {
    const navigate = useNavigate();

    const userRef = useRef();
    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const emailRef = useRef();
    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        emailRef.current.focus();
    }, []);

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email])

    const handleSubmit = async (e) => {
        e.preventDefault();

        // JS 해킹으로 버튼이 활성화된 경우
        const V1 = EMAIL_REGEX.test(email);
        const V2 = USER_REGEX.test(user);
        const V3 = PWD_REGEX.test(pwd);

        if (!V1 || !V2 || !V3) {
            setErrMsg("잘못 입력 하셨습니다");
            return;
        }

        const trimmedData = {
            member_name: user.trim(),
            email: email.trim(),
            password: pwd.trim(),
        };

        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify(trimmedData),
                {
                    headers: { 'Content-Type': 'application/json',},
                    withCredentials: true
                }
            );

            console.log('response', response);
            setSuccess(true);
            
            // 입력 인풋 값 초기화
            setUser('');
            setPwd('');
            setEmail('');
            setMatchPwd('');

            localStorage.setItem('savedEmail', response?.data?.email);

            navigate('/');
        
        } catch (err) {
            if (!err.response) {
                setErrMsg('서버에서 응답이 없습니다');
            } else if (err.response.data && err.response.data.error) {
                // 서버에서 오는 에러 메시지를 사용
                setErrMsg(err.response.data.error);
            } else if (err.response?.status === 400) {
                setErrMsg('잘못된 요청입니다.');
            } else if (err.response?.status === 409) {
                setErrMsg('사용중인 이메일입니다.');
            } else {
                setErrMsg('회원가입에 실패했습니다');
            }
        }
        
    }
    return (
        <div className="w-full p-10">            
            <div className="mb-14">
                <h2 className='text-3xl font-normal'>로그인에 사용할 이메일과<br />
                비밀번호를 작성해주세요.</h2>
            </div>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <form className="flex w-full flex-col gap-6 mb-14" onSubmit={handleSubmit}>
                <div>
                    <div className="flex items-center gap-x-4 mb-2">
                        <label htmlFor="email">이메일</label>
                        <FaCheck className={validEmail ? "text-green-500" : "hidden"} />
                        <FaCheck className={validEmail || !email ? "hidden" : "text-red-500"} />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="text"
                        className="w-full rounded-md border-0 bg-slate-100 placeholder:text-slate-400"
                        placeholder="이메일(아이디) 입력" 
                        autoComplete='off' 
                        ref={emailRef} 
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError('');
                        }}
                        value={email}
                        aria-invalid={validEmail ? "false" : "true"}
                        aria-describedby="emailnote"
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                        required
                    />
                    <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                        <span>
                            <IoInformationCircleOutline className='mt-1'/>
                        </span>
                        <span>
                            이메일 형식을 맞춰 주세요. @ 필수 입니다.
                        </span>
                    </p>
                    <p className={emailError ? "errmsg" : "offscreen"}>{emailError}</p> {/* 중복 에러 메시지 표시 */}
                </div>
                <div>
                    <div className="flex items-center gap-x-4 mb-2">
                        <label htmlFor="member_name">이름</label>
                        <FaCheck className={validName ? "text-green-500" : "hidden"} />
                        <FaCheck className={validName || !user ? "hidden" : "text-red-500"} />
                    </div>
                    <input 
                        id="member_name"
                        name="member_name"
                        type="text" 
                        className="w-full rounded-md border-0 bg-slate-100 placeholder:text-slate-400" 
                        placeholder="사용자 이름 입력" 
                        autoComplete='off'
                        ref={userRef} 
                        aria-invalid={validName ? "false" : "true"}
                        aria-describedby="uidnote"
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        onFocus={() => setUserFocus(true)}
                        onBlur={() => setUserFocus(false)}
                        required
                    />
                    <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                        <span>
                            <IoInformationCircleOutline className='mt-1'/>
                        </span>
                        <span>
                            2자~6자 한글 문자로 시작해야합니다.
                        </span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-x-4 mb-2">
                        <label htmlFor="password">비밀번호</label>
                        <FaCheck className={validPwd ? "text-green-500" : "hidden"} />
                        <FaCheck className={validPwd || !pwd ? "hidden" : "text-red-500"} />
                    </div>
                    <input 
                        id="password" 
                        name="password"
                        type="password" 
                        className="w-full rounded-md border-0 bg-slate-100 placeholder:text-slate-400" 
                        placeholder="8자 이상 대문자, 특수기호, 숫자, 영문 조합으로 입력" 
                        autoComplete='off' 
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        aria-invalid={validPwd ? "false" : "true"}
                        aria-describedby="pwdnote"
                        onFocus={() => setPwdFocus(true)}
                        onBlur={() => setPwdFocus(false)}
                        required
                    />
                    <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                        <span>
                            <IoInformationCircleOutline className='mt-1'/>
                        </span>
                        <span>
                            8에서 24자 사이여야 합니다.<br />
                            대문자와 소문자, 숫자, 그리고 특수 문자를 포함해야 합니다.<br />
                            사용할 수 있는 특수 문자: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                        </span>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-x-4 mb-2">
                        <label htmlFor="confirm_pwd">비밀번호 확인</label>
                        <FaCheck className={validMatch && matchPwd ? "text-green-500" : "hidden"} />
                        <FaCheck className={validMatch || !matchPwd ? "hidden" : "text-red-500"} />
                    </div>
                    <input
                        id="confirm_pwd" 
                        type="password" 
                        className="w-full rounded-md border-0 bg-slate-100 placeholder:text-slate-400" 
                        placeholder="동일한 비밀번호 재입력" 
                        autoComplete='off'
                        onChange={(e) => setMatchPwd(e.target.value)}
                        value={matchPwd}
                        aria-invalid={validMatch ? "false" : "true"}
                        aria-describedby="confirmnote"
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                        required
                    />
                    <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                        <span>
                            <IoInformationCircleOutline className='mt-1'/>
                        </span>
                        <span>
                            비밀번호가 일치하지 않습니다.
                        </span>
                    </p>
                </div>
                <div className='flex flex-col gap-3'>
                    <button type="submit" className="w-full disabled:text-slate-500 text-white disabled:bg-slate-200 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" disabled={!validName || !validPwd || !validMatch || !validEmail ? true : false}>카드 지출 관리 시작하기</button>
                    <button type="button" className='w-full text-slate-600' onClick={ () => { navigate(-1); } }>안할래요</button>
                </div>
            </form>
        </div>
    )
}

export default Signup;