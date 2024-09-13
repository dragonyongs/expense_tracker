import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance";

function CardBalance() {
    const { user } = useContext(AuthContext);
    const [card, setCard] = useState({ balance: 0 });

    useEffect(() => {
        if (user?.member_id) {
            fetchData(`${API_URLS.CARD_MEMBER}/${user.member_id}`);
        }
    }, [user?.member_id]);

    const fetchData = async (url) => {
        try {
            const response = await axios.get(url);
            // 첫 번째 카드만 선택해서 상태에 설정
            if (response.data.length > 0) {
                setCard(response.data[0]);
            } else {
                setCard({ balance: 0 });
            }
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    const currentBalanceWithRollover = card.balance + (card.rollover_amount || 0);

    return (
        <div className='flex flex-col items-center gap-y-3 pt-6 pb-12 rounded-es-4xl rounded-ee-4xl bg-[#0433FF]'>
            <p className='text-xl text-blue-200'>카드 잔액</p>
            <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
                <span className="font-thin">₩</span>
                <p className="font-semibold">{currentBalanceWithRollover.toLocaleString()}</p>
            </div>
        </div>
    );
}

export default CardBalance;
