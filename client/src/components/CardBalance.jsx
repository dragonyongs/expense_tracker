import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance";

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    useEffect(() => {
        if (!isAnimating && value !== displayValue) {
        setIsAnimating(true);
        let start = 0;
        const end = value;
        const duration = 1000; // 1초 동안 애니메이션
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            
            if (elapsed < duration) {
            // easeOutQuart 이징 함수 사용
            const progress = 1 - Math.pow(1 - elapsed / duration, 4);
            const current = Math.floor(progress * (end - start) + start);
            setDisplayValue(current);
            requestAnimationFrame(animate);
            } else {
            setDisplayValue(end);
            setIsAnimating(false);
            }
        };
        
        requestAnimationFrame(animate);
        }
    }, [value]);

    return displayValue.toLocaleString();
};

function CardBalance() {
    const { user } = useContext(AuthContext);
    const [card, setCard] = useState({ balance: 0 });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (user?.member_id) {
            fetchData(`${API_URLS.CARD_MEMBER}/${user.member_id}`);
        }
    }, [user?.member_id]);

    const fetchData = async (url) => {
        try {
            const response = await axios.get(url);
            if (response.data.length > 0) {
                setCard(response.data[0]);
            } else {
                setCard({ balance: 0 });
            }
            setIsLoaded(true);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            setIsLoaded(true);
        }
    };

    const currentBalanceWithRollover = card.balance + (card.rollover_amount || 0) + (card.team_fund || 0);

    return (
        <div className='flex flex-col items-center gap-y-3 pt-6 pb-12 rounded-es-4xl rounded-ee-4xl bg-[#0433FF]'>
            <p className='text-xl text-blue-200'>
                카드 잔액 {5000 > currentBalanceWithRollover ? "🥲" : 10000 >= currentBalanceWithRollover ? "😱" : "🤑"}
            </p>
            <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
                <span className="font-thin">₩</span>
                <p className="font-semibold">
                    {isLoaded ? <AnimatedNumber value={currentBalanceWithRollover} /> : "0"}
                </p>
            </div>
        </div>
    );
}

export default CardBalance;