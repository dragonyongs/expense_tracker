import React from 'react';
import PropTypes from 'prop-types';
import { ConfettiEffect } from './ConfettiEffect';
import TransactionDrawer from './TransactionDrawer';
import AnimatedNumber from './AnimatedNumber';
import { TiPlus } from "react-icons/ti";

function CardBalance({ 
    currentBalance, 
    teamFund, 
    userCards, 
    cardBalance, 
    errMsg, 
    onOpenDrawer, 
    isDrawerOpen, 
    onSave, 
    onDelete, 
    confettiTrigger, 
    onCloseDrawer 
}) {

    return (
        <div className='flex flex-col items-center gap-y-3 pt-6 pb-4 rounded-es-4xl rounded-ee-4xl bg-[#0433FF]'>
            <p className='text-xl text-blue-200'>
                카드 잔액 {5000 > currentBalance ? "🥲" : 10000 >= currentBalance ? "😱" : "🤑"}
            </p>
            <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
                <span className="font-thin">₩</span>
                <p className="font-semibold">
                    <AnimatedNumber value={currentBalance} />
                </p>
            </div>
            <div className='flex justify-center items-center gap-x-3 mt-8'>
                <button
                    onClick={onOpenDrawer}
                    className='inline-flex items-center gap-x-2 py-2 px-6 border-2 border-blue-100 rounded-full text-white'
                >
                    <TiPlus /> 카드 지출
                </button>
                <ConfettiEffect triggerConfetti={confettiTrigger} />
            </div>

            <TransactionDrawer
                isOpen={isDrawerOpen}
                onClose={onCloseDrawer}
                onSave={onSave}
                onDelete={onDelete}
                userCards={userCards}
                isEditing={false}
                transactionData={{}}
                errMsg={errMsg}
                cardBalance={cardBalance}
                teamFund={teamFund || 0}
            />
        </div>
    );
}

CardBalance.propTypes = {
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    currentBalance: PropTypes.number.isRequired,
    teamFund: PropTypes.number,
    cardBalance: PropTypes.number,
    userCards: PropTypes.array.isRequired,
    errMsg: PropTypes.string,
    isDrawerOpen: PropTypes.bool.isRequired,
    confettiTrigger: PropTypes.bool.isRequired,
    onOpenDrawer: PropTypes.func.isRequired,
    onCloseDrawer: PropTypes.func.isRequired
};

export default CardBalance;