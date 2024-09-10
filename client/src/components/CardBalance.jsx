import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance";

function CardBalance() {
    const { user } = useContext(AuthContext);

    const [card, setCard] = useState({balance: 0});

    useEffect(() => {
        if (user?.member_id) {
            fetchData(`${API_URLS.CARD_MEMBER}/${user.member_id}`, setCard);
        }
        console.log(card)
    }, user);

    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    return (
        <>
            <div className='flex flex-col items-center gap-y-3 pt-6 pb-16 rounded-es-3xl rounded-ee-3xl bg-[#0433FF]'>
                <p className='text-xl text-blue-200'>카드 잔액</p>
                <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
                    <span className="font-thin">₩</span>
                    <p className="font-semibold">{card.balance.toLocaleString()}</p>
                </div>
            </div>
        </>
    )
}

export default CardBalance