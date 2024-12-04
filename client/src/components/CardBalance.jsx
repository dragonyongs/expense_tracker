import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance";
import { TiPlus } from "react-icons/ti";
import TransactionDrawer from './TransactionDrawer';
import useFetchData from '../hooks/useFetchData';
import PropTypes from 'prop-types';

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

function CardBalance({ onSave }) {
    const { user } = useContext(AuthContext);
    const [ cards, setCards ] = useState([]);
    const [ userCards, setUserCards ] = useState([]);
    const [ card, setCard ] = useState({ balance: 0 });
    const [ isLoaded, setIsLoaded ] = useState(false);
    const [ isDrawerOpen, setIsDrawerOpen ] = useState(false);
    const cardsUrl = `${API_URLS.CARDS}`;

    useFetchData(cardsUrl, setCards);

    useEffect(() => {
        if (user?.member_id) {
            const fetchUserCards = async () => {
                try {
                    const response = await axios.get(`${API_URLS.CARD_MEMBER}/${user.member_id}`);
                    if (response.data.length > 0) {
                        setCard(response.data[0]); 
                        setUserCards(response.data);
                    }
                } catch (error) {
                    console.error(`Error fetching user cards:`, error);
                } finally {
                    setIsLoaded(true);
                }
            };
            fetchUserCards();
        }
    }, [user?.member_id]);

    const currentBalanceWithRollover = card.balance + (card.rollover_amount || 0) + (card.team_fund || 0);

    const handleSave = async (transactionData) => {
        try {
            onSave(transactionData);
            setIsDrawerOpen(false);
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const handleOpenDrawer = () => setIsDrawerOpen(true);
    const handleCloseDrawer = () => setIsDrawerOpen(false); 

    return (
        <div className='flex flex-col items-center gap-y-3 pt-6 pb-4 rounded-es-4xl rounded-ee-4xl bg-[#0433FF]'>
            <p className='text-xl text-blue-200'>
                카드 잔액 {5000 > currentBalanceWithRollover ? "🥲" : 10000 >= currentBalanceWithRollover ? "😱" : "🤑"}
            </p>
            <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
                <span className="font-thin">₩</span>
                <p className="font-semibold">
                    {isLoaded ? <AnimatedNumber value={currentBalanceWithRollover} /> : "0"}
                </p>
            </div>
            <div className='flex justify-center items-center gap-x-3 mt-10'>
                <button onClick={handleOpenDrawer} className='inline-flex items-center gap-x-2 py-3 px-10 border-2 border-blue-100 rounded-full text-white'><TiPlus /> 지출 기록</button>
            </div>

            <TransactionDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                onSave={handleSave}
                userCards={userCards || []}
                isEditing={false}
                transactionData={{}}
                errMsg={null}
                user={user}
                cardBalance={card.balance}
                teamFund={card.team_fund || 0}
                onDelete={(data) => {
                    console.log("Transaction saved:", data);
                    handleCloseDrawer();
                }} 
            />
        </div>
    );
}

CardBalance.propTypes = {
    onSave: PropTypes.func.isRequired,
}

export default CardBalance;