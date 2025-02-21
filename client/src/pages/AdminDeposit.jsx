import React from 'react';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";
import { TbCircleMinus } from "react-icons/tb";
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import AdminHeader from '../components/AdminHeader';
import useDepositManagement from '../hooks/useDepositManagement';
import DepositList from '../components/admin/DepositList';
import { API_URLS } from '../services/apiUrls';
import calculateUniqueTeamMembersCount from '../utils/teamUtils';

const AdminDeposit = () => {
    const {
        state,
        currentMenuItem,
        setCurrentMenuItem,
        handleAddMenuItem,
        handleAddDeposit,
        handleMinusDeposit,
        handleOpenDrawer,
        handleCloseDrawer,
        handleUserChange,
        handleCardChange,
        handleDepositTypeAdd,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleDelete,
        handleSave,
        calculateTotalAmount,
        handleRemoveMenuItem,
        handleTransactionDateChange,
        handleSaveMinusDeposit,
        handleTransactionDateChangeMinus,
    } = useDepositManagement(API_URLS);

    return (
        <>
        <AdminHeader />
        <div className="flex-1 w-full pt-4 px-4 pb-20 sm:pt-6 sm:px-6 sm:pb-28 dark:bg-gray-800">
            <div className="flex items-center justify-between mt-2 mb-4 px-3">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">입출금 거래내역</h5>
                <div className='flex gap-x-3'>
                    <button type="button" className="text-black font-semibold rounded-lg text-2xl dark:text-white" onClick={handleAddDeposit}>
                    <IoAddCircleOutline />
                    </button>
                    <button type="button" className="text-black font-semibold rounded-lg text-2xl dark:text-white" onClick={handleMinusDeposit}>
                    <TbCircleMinus />
                    </button>
                </div>
            </div>
    
            <div className="flow-root">
                <DepositList deposits={state.deposits} onOpenDrawer={handleOpenDrawer} />
            </div>
        </div>

        {/* 삭제 모달 : 추후 컴포넌트로 변경 */}
        {state.isDeleteConfirmOpen && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-11/12 md:w-96">
                    <h3 className="text-lg font-semibold mb-4">정말로 삭제하시겠습니까?</h3>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                            onClick={handleDeleteCancel}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-red-600 text-white rounded-md"
                            onClick={handleDelete}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        )}
    
        {/* 입금 다이얼로그 */}
        <CommonDrawer isOpen={state.isOpen} onClose={handleCloseDrawer} title={state.isEditing ? '입금 수정' : '입금 추가'}>
            <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
            {state.errMsg && <div className="text-red-600 dark:text-red-300">{state.errMsg}</div>}
    
            <SelectField
                label="사용자"
                id="member_id"
                value={state.selectedUserId || ""}
                onChange={handleUserChange}
                options={state.users.map(member => ({ value: member._id, label: member.member_name }))}
                placeholder="사용자 선택"
                required
            />
    
            <SelectField
                label="카드"
                id="card_id"
                value={state.selectedCardId || ""}
                onChange={handleCardChange}
                options={state.cards.map(card => ({ value: card._id, label: card.card_number }))}
                placeholder="카드 선택"
                disabled={!state.selectedUserId}
                required
            />
    
            <div>
                <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-slate-300 dark:font-normal">입금 추가</h3>
                <ul className="grid w-full gap-2 grid-cols-3">
                {['RegularDeposit', 'TransportationDeposit', 'TeamFund']
                    .filter(type => 
                        type !== 'TeamFund' || state.selectUserPosition === '팀장' || state.selectUserPosition === '파트장'
                    )
                    .map((depositType, index) => {
                        const isChecked = state.selectedDeposit.menu_items.some(item => item.deposit_type === depositType) || (currentMenuItem && currentMenuItem.deposit_type === depositType);

                        const depositLabels = {
                            RegularDeposit: "정기 입금",
                            TransportationDeposit: "여비교통비",
                            TeamFund: "팀운영비",
                        };
                        const descriptions = {
                            RegularDeposit: "10만원",
                            TransportationDeposit: "금액입력",
                            TeamFund: "인당 3만원",
                        };
                        
                        return (
                            <li key={index}>
                                <input
                                    type="checkbox"
                                    id={`deposit_type_${index}`}
                                    value={depositType}
                                    className="hidden peer"
                                    checked={isChecked}
                                    onChange={handleDepositTypeAdd}
                                    disabled={!state.selectedCardId || (depositType === 'TeamFund' && state.selectedUser?.hasTeamFund)}
                                />
                                <label
                                    htmlFor={`deposit_type_${index}`}
                                    className={`${isChecked ? 'peer-checked:border-blue-600 peer-checked:text-blue-600' : ''} 
                                        inline-flex flex-col space-y-2 items-center justify-between w-full h-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} dark:hover:text-gray-300 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                >
                                    <div className="block w-full">
                                        <div className="w-full text-md font-semibold">{depositLabels[depositType]}</div>
                                        <div className="w-full text-sm">{descriptions[depositType]}</div>
                                    </div>
                                    {isChecked && <IoCheckmark className="w-6 h-6" />}
                                </label>
                            </li>
                        );
                    })}
                </ul>

            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                {state.selectedDeposit.menu_items.length === 0 ? (
                    <div className="text-sm text-gray-500">추가된 거래 항목이 없습니다.</div>
                ) : (
                    <>
                    <ul className="flex flex-col gap-y-2">
                        {state.selectedDeposit.menu_items.map((item, index) => (
                        <li key={index}>
                            <div className="flex justify-between">
                            <p className="text-sm text-slate-600">
                                {item.name} <span className='font-semibold'>{item.price.toLocaleString() || 0}</span>원
                            </p>
                            <button
                                className="text-sm text-red-600 underline"
                                onClick={() => handleRemoveMenuItem(index)}
                            >
                                제거
                            </button>
                            </div>
                        </li>
                        ))}
                    </ul>
                    <div className="text-base text-blue-600">
                        총액: <span className="font-semibold">{calculateTotalAmount().toLocaleString()} 원</span>
                    </div>
                    </>
                )}
            </div>
    
                {/* <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                    <ul className="flex flex-col gap-y-2">
                        <li>
                            <div className="flex justify-between">
                                <p className="text-sm text-slate-600">홍길동님 2월 퍼블리싱팀 팀비 <span className='font-semibold'>100,000</span>원</p>
                                <button className="text-sm text-red-600 underline">제거</button>
                            </div>
                        </li>
                        <li>
                            <div className="flex justify-between">
                                <p className="text-sm text-slate-600">홍길동님 2월 퍼블리싱팀 팀운영비 <span className='font-semibold'>30,000</span>원</p>
                                <button className="text-sm text-red-600 underline">제거</button>
                            </div>
                        </li>
                    </ul>
                    <div className="text-base text-blue-600">
                        총액: <span className='font-semibold'>130,000</span>원
                    </div>
                </div> */}

            { currentMenuItem.name.length > 0 &&
                <div className="flex flex-col space-y-3 w-full h-auto p-3 bg-slate-50 border border-slate-200">
                    <InputField
                        label="입금액"
                        type="number"
                        id="transaction_amount"
                        value={currentMenuItem.price}
                        className={"bg-white border border-slate-200"}
                        onChange={(e) =>
                            setCurrentMenuItem((prev) => ({
                                ...prev,
                                price: e.target.value, // 사용자가 입력한 값으로 업데이트
                            }))
                        }
                        placeholder="입금액 입력"
                        required={true}
                    />
                    {state.selectUserPosition === '팀장' && state.selectedDeposit.deposit_type === "TeamFund" && (
                        <div className="mt-2 text-gray-500">
                            <span>팀 인원: {calculateUniqueTeamMembersCount(state.accounts)}명</span>
                        </div>
                    )}
                    
                    <InputField
                        label="입금명"
                        id="menu_name"
                        value={currentMenuItem.name || ""}
                        className={"bg-white border border-slate-200"}
                        onChange={(e) =>
                            setCurrentMenuItem((prev) => ({
                                ...prev,
                                name: e.target.value, // 사용자가 입력한 값으로 업데이트
                            }))
                        }
                        placeholder="입급명 입력"
                    />

                    <div className="flex justify-between gap-x-3 items-center">
                        <button
                            className="w-1/2 py-2 px-4 rounded-lg bg-blue-600 text-white"
                            onClick={handleAddMenuItem}
                        >
                            추가
                        </button>
                        <button
                            className="w-1/2 py-2 px-4 rounded-lg bg-slate-600 text-white"
                            onClick={() => setCurrentMenuItem({ deposit_type: "", name: "", price: 0 })}
                        >
                            취소
                        </button>
                    </div>

                </div>
            }

                <InputField
                    label="거래일"
                    id="transaction_date"
                    type='date'
                    value={state.selectedDeposit?.transaction_date?.split("T")[0] || new Date().toISOString().split('T')[0]}
                    onChange={handleTransactionDateChange}
                    required
                />

            </div>
            <div className="flex flex-col gap-3 pt-4 p-6">
                <div className='flex justify-between gap-y-4 gap-x-2'>
                    {state.isEditing && (
                        <button type="button" className='flex-1 text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg' onClick={handleDeleteConfirm}>삭제</button>
                    )}
                    {!state.isEditing && (
                        <button type="button" onClick={handleSave} className="flex-1 py-2 px-4 rounded-lg w-full text-white bg-blue-700 hover:bg-blue-800">입금</button>
                    )}
                </div>
                <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">취소</button>
            </div>
        </CommonDrawer>
    
        {/* 차감 다이얼로그 - 미작업 */}
        <CommonDrawer isOpen={state.isDeductedOpen} onClose={handleCloseDrawer} title={state.isEditingMinus ? '출금 수정' : '출금 추가'}>
            <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
            {state.errMsg && <div className="text-red-600 dark:text-red-300">{state.errMsg}</div>}
    
                <SelectField
                    label="사용자"
                    id="member_id"
                    value={state.selectedUserId || ""}
                    onChange={handleUserChange}
                    options={state.users.map(member => ({ value: member._id, label: member.member_name }))}
                    placeholder="사용자 선택"
                    required
                />
        
                <SelectField
                    label="카드"
                    id="card_id"
                    value={state.selectedCardId || ""}
                    onChange={handleCardChange}
                    options={state.cards.map(card => ({ value: card._id, label: card.card_number }))}
                    placeholder="카드 선택"
                    disabled={!state.selectedUserId}
                    required
                />
    
                <InputField
                    label="거래일"
                    id="transaction_date"
                    type='date'
                    value={state.transactionDateMinus}
                    onChange={e => handleTransactionDateChangeMinus(e.target.value)}
                    required
                />
            </div>
    
            <div className="flex flex-col gap-3 pt-4 p-6">
                <div className='flex justify-between gap-y-4 gap-x-2'>
                    {state.isEditingMinus && (
                    <button type="button" className='text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg' onClick={handleDeleteConfirm}>삭제</button>
                    )}
                    <button type="button" onClick={handleSaveMinusDeposit} className="flex-1 py-2 px-4 rounded-lg w-full text-white bg-blue-700 hover:bg-blue-800">
                    {state.isEditingMinus ? '수정' : '추가'}
                    </button>
                </div>
                <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">취소</button>
            </div>
        </CommonDrawer>
        </>
    );
};
    
export default AdminDeposit;
