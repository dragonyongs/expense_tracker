import React, { useState, useEffect } from "react";
import axios from "../services/axiosInstance";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import useMediaQuery from "../hooks/useMediaQuery";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import PropTypes from "prop-types";
import { IoCheckmark } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { API_URLS } from "../services/apiUrls";
import useDrawerTheme from "../hooks/useDrawerTheme";
import ConfirmModal from "./common/ConfirmModal";
import { IoRibbonOutline } from "react-icons/io5";

const TransactionDrawer = ({
  isOpen,
  onClose,
  onSave,
  transactionData,
  userCards,
  isEditing,
  onDelete,
  cardBalance,
  teamFund,
  errMsg,
  setErrMsg,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState({
    card_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    merchant_name: "",
    menu_items: [],
    transaction_amount: 0,
    transaction_type: "expense",
    expense_card: "TeamCard",
    expense_type: "RegularExpense",
    rolloverAmounted: 0,
    teamFundDeducted: 0,
    is_deducted: false,
    deposit_type: "",
  });
  const [expenseType, setExpenseType] = useState("RegularExpense");
  const [userPosition, setUserPosition] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [merchantSuggestions, setMerchantSuggestions] = useState([]);
  const [menuSuggestions, setMenuSuggestions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [currentMenuItem, setCurrentMenuItem] = useState({
    name: '',
    price: 0,
    quantity: 1
  });
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [isMenuLayerOpen, setIsMenuLayerOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isMerchantLayerOpen, setIsMerchantLayerOpen] = useState(false);
  const [filteredMenus, setFilteredMenus] = useState([]);

  useDrawerTheme(isOpen);

  useEffect(() => {
    if (isOpen) {
      setUserPosition(userCards[0].member_id.position);

      const isExistingTransaction = Boolean(
        transactionData && transactionData.expense_type
      );

      if (isExistingTransaction) {
        setSelectedTransaction({
          ...transactionData,
          card_id:
            transactionData.card_id ||
            (userCards.length > 0 ? userCards[0]._id : ""),
          menu_name: transactionData.menu_items?.[0]?.name || "",
        });
        setExpenseType(transactionData.expense_type);
      } else {
        if (cardBalance <= 0) {
          setExpenseType("TeamFund");
          setSelectedTransaction({
            ...selectedTransaction,
            card_id: userCards.length > 0 ? userCards[0]._id : "",
            expense_type: "TeamFund",
            transaction_date: new Date().toISOString().split("T")[0],
          });
        } else {
          setExpenseType("RegularExpense");
          setSelectedTransaction({
            ...selectedTransaction,
            card_id: userCards.length > 0 ? userCards[0]._id : "",
            transaction_date: new Date().toISOString().split("T")[0],
          });
        }
      }

      setMerchantSuggestions([]);
      setMenuSuggestions([]);
    }
  }, [isOpen, transactionData, userCards, cardBalance]);

  useEffect(() => {
    if (selectedTransaction.menu_items?.length > 0) {
      const total = selectedTransaction.menu_items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      setSelectedTransaction(prev => ({
        ...prev,
        transaction_amount: total
      }));
    }
  }, [selectedTransaction.menu_items]);

  const getCardExpenseType = (card) => {
    const isOvertimeMealCard = card.card_type === "OvertimeMealCard";
    return {
      expense_card: isOvertimeMealCard ? "OvertimeMealCard" : "TeamCard",
      expense_type: isOvertimeMealCard
        ? "OvertimeMealExpense"
        : "RegularExpense",
    };
  };

  const getCardBalances = (card) => ({
    balance: card.balance || 0,
    team_fund: card.team_fund || 0,
  });

  const handleExpenseTypeChange = (type) => {
    const expenseCardMapping = {
      TeamFund: "TeamFund",
      OvertimeMealExpense: "OvertimeMealCard",
    };

    const selectedCard = expenseCardMapping[type] || "TeamCard";

    setExpenseType(type);
    setSelectedTransaction((prev) => ({
      ...prev,
      expense_card: selectedCard,
      expense_type: type,
    }));
  };

  const handleCardChange = (e) => {
    const cardId = e.target.value;
    const activeCard = userCards.find((card) => card._id === cardId);

    const { expense_card, expense_type } = getCardExpenseType(activeCard);
    const { balance, team_fund } = getCardBalances(activeCard);

    setSelectedTransaction({
      ...selectedTransaction,
      card_id: cardId,
      expense_card,
      expense_type,
      balance,
      team_fund,
    });
  };

  const handleDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteClick = () => {
    const transactionId = transactionData?._id;
    if (transactionId) {
      onDelete(transactionId);
    }
    setIsDeleteConfirmOpen(false);
  };

  const fetchMenuForMerchant = async (merchantName) => {
    try {
      const response = await axios.get(
        `${API_URLS.SEARCH_MENU_FOR_MERCHANT}/${merchantName}`
      );
      setMenuSuggestions(response.data);
    } catch (error) {
      console.error("메뉴 조회 오류:", error);
      setMenuSuggestions([]);
    }
  };

  const handleSave = async () => {
    try {
      const updatedTransaction = {
        ...selectedTransaction,
        card_id: selectedTransaction.card_id,
        transaction_date: selectedTransaction.transaction_date,
        merchant_name: selectedTransaction.merchant_name,
        menu_items: selectedTransaction.menu_items,
        transaction_type: "expense",
        expense_card: selectedTransaction.expense_card,
        expense_type: selectedTransaction.expense_type,
        is_deducted: false,
      };

      console.log('Saving transaction with menu items:', updatedTransaction.menu_items);
      
      if (isEditing) {
        await onSave(updatedTransaction);
      } else {
        await onSave(updatedTransaction);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrMsg(error.message);
    }
  };

  const handleMerchantInputChange = async (e) => {
    const value = e.target.value;
    setSelectedTransaction((prev) => ({
      ...prev,
      merchant_name: value,
    }));

    if (value.length > 1) {
      // 최소 3자 이상 입력 시 검색
      try {
        const response = await axios.get(`${API_URLS.SEARCH_KEYWORD}/${value}`);
        setMerchantSuggestions(response.data);
      } catch (error) {
        console.error("검색 오류:", error);
        setMerchantSuggestions([]); // 에러 발생 시 제안 목록 초기화
      }
    } else {
      setMerchantSuggestions([]);
    }

    // 상호명이 비어있을 경우 메뉴 제안 레이어 닫기
    if (value.length === 0) {
      setMenuSuggestions([]); // 메뉴 제안 목록 초기화
    }
  };

  const handleMerchantSuggestionClick = (merchant_name) => {
    setSelectedTransaction((prev) => ({
      ...prev,
      merchant_name,
    }));
    setMerchantSuggestions([]);
    fetchMenuForMerchant(merchant_name); // 선택한 상호명에 대한 메뉴 조회
  };

  const handleMenuInputChange = async (e) => {
    const value = e.target.value;
    setCurrentMenuItem(prev => ({
      ...prev,
      name: value
    }));

    // 메뉴명 검색 로직
    if (value.length > 2 && selectedTransaction.merchant_name) {
      try {
        const response = await axios.get(
          `${API_URLS.SEARCH_MENU_FOR_MERCHANT}/${selectedTransaction.merchant_name}`
        );
        
        // 입력된 값으로 메뉴 필터링
        const filteredMenus = response.data.filter((menu) =>
          menu.name?.toLowerCase().includes(value.toLowerCase())
        );
        setMenuSuggestions(filteredMenus);
      } catch (error) {
        console.error("메뉴 검색 오류:", error);
        setMenuSuggestions([]);
      }
    } else {
      setMenuSuggestions([]);
    }
  };

  const handleMenuSuggestionClick = (menu) => {
    setCurrentMenuItem({
      name: menu.name,
      price: menu.price,
      quantity: 1
    });
    setMenuSuggestions([]);
  };

  const handleAddMenuItem = () => {
    if (!currentMenuItem.name || !currentMenuItem.price || !currentMenuItem.quantity) {
      setErrMsg('메뉴명, 가격, 수량을 모두 입력해주세요.');
      return;
    }

    setSelectedTransaction(prev => ({
      ...prev,
      menu_items: [
        ...(prev.menu_items || []),
        {
          name: currentMenuItem.name,
          price: Number(currentMenuItem.price),
          quantity: Number(currentMenuItem.quantity)
        }
      ]
    }));

    // 입력 폼 초기화
    setCurrentMenuItem({
      name: '',
      price: '',
      quantity: 1
    });
  };

  const handleRemoveMenuItem = (index) => {
    setSelectedTransaction(prev => {
      const removedItem = prev.menu_items[index];
      return {
        ...prev,
        menu_items: prev.menu_items.filter((_, i) => i !== index),
        transaction_amount: prev.transaction_amount - (removedItem.price * removedItem.quantity)
      };
    });
  };

  const handleMerchantSelect = (merchant) => {
    setSelectedTransaction({
        ...selectedTransaction,
        merchant_name: merchant.name
    });
    setSelectedMerchant(merchant);
    setIsMenuLayerOpen(true);  // 메뉴 레이어 열기
    setIsMerchantLayerOpen(false);  // 상호명 레이어 닫기
  };

  const handleMenuSelect = (menu) => {
    const newMenuItem = {
        name: menu.name,
        price: menu.price,
        quantity: 1
    };
    
    setSelectedTransaction({
        ...selectedTransaction,
        menu_items: [...selectedTransaction.menu_items, newMenuItem]
    });
    
    // 모든 레이어 닫기
    setIsMenuLayerOpen(false);
    setIsMerchantLayerOpen(false);
  };

  const handleMenuSearch = (searchTerm) => {
    if (selectedMerchant) {
        // 선택된 상호의 메뉴만 필터링
        const filtered = menuSuggestions.filter(menu => 
            menu.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMenus(filtered);
    }
  };

  const isMobile = useMediaQuery("(max-width: 640px)");
  const drawerSize = isMobile ? "100%" : "375px";

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={onClose}
        duration="300"
        direction="right"
        size={drawerSize}
      >
        <div className="flex justify-between p-4 border-b dark:border-b-gray-700 bg-white dark:bg-slate-800 ">
            <h5 className="text-lg font-bold dark:text-slate-200">
              {isEditing ? "카드 지출 수정" : "카드 지출 추가"}
            </h5>
            <button onClick={onClose}>
              <MdClose className="text-2xl dark:text-slate-300" />
            </button>
          </div>
        <div className="overflow-y-auto h-drawer-screen flex w-full flex-col gap-6 px-6 dark:bg-slate-800">
            {errMsg ||
              (errorMessage && (
                <div className="text-red-600 dark:text-red-300">
                  {errMsg || errorMessage}
                </div>
              ))}

            {userPosition === "팀장" && (
              <div>
                <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-white">
                  지출 타입
                </h3>
                {selectedTransaction.expense_card === "OvertimeMealCard" ? (
                  <ul className="grid w-full gap-2 grid-cols-1">
                    <li>
                      <input
                        type="radio"
                        id="expense_type_d"
                        name="expenseType"
                        value="OvertimeMealExpense"
                        className="hidden peer"
                        checked={expenseType === "OvertimeMealExpense"}
                        onChange={() =>
                          handleExpenseTypeChange("OvertimeMealExpense")
                        }
                        disabled={
                          isEditing &&
                          transactionData.expense_type !== "OvertimeMealExpense"
                        }
                        required
                      />
                      <label
                        htmlFor="expense_type_d"
                        className="peer-disabled:bg-gray-50 peer-disabled:dark:bg-slate-900 peer-disabled:dark:text-slate-500 peer-disabled:text-gray-300 inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:dark:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="block">
                          <div className="w-full text-md font-semibold">
                            야근 식대
                          </div>
                          <div className="w-full text-sm">
                            잔액: {selectedTransaction.balance.toLocaleString()}
                            원
                          </div>
                        </div>
                        {expenseType === "OvertimeMealExpense" && (
                          <IoCheckmark className="w-6 h-6" />
                        )}
                      </label>
                    </li>
                  </ul>
                ) : (
                  <ul className="grid w-full gap-2 grid-cols-2">
                    <li>
                      <input
                        type="radio"
                        id="expense_type_a"
                        name="expenseType"
                        value="RegularExpense"
                        className="hidden peer"
                        checked={expenseType === "RegularExpense"}
                        disabled={
                          (isEditing &&
                            transactionData.expense_type !==
                              "RegularExpense") ||
                          (!isEditing && cardBalance === 0)
                        }
                        onChange={() =>
                          handleExpenseTypeChange("RegularExpense")
                        }
                        required
                      />
                      <label
                        htmlFor="expense_type_a"
                        className="peer-disabled:bg-gray-50 peer-disabled:dark:bg-slate-900 peer-disabled:dark:text-slate-500 peer-disabled:text-gray-300 inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:dark:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="block">
                          <div className="w-full text-md font-semibold">
                            일반 지출
                          </div>
                          {!isEditing && (
                            <div className="w-full text-sm">
                              잔액: {cardBalance.toLocaleString()}원
                            </div>
                          )}
                        </div>
                        {expenseType === "RegularExpense" && (
                          <IoCheckmark className="w-6 h-6" />
                        )}
                      </label>
                    </li>
                    <li>
                      <input
                        type="radio"
                        id="expense_type_b"
                        name="expenseType"
                        value="TeamFund"
                        className="hidden peer"
                        checked={expenseType === "TeamFund"}
                        disabled={
                          (isEditing &&
                            transactionData.expense_type !== "TeamFund") ||
                          (!isEditing && teamFund === 0)
                        }
                        onChange={() => handleExpenseTypeChange("TeamFund")}
                      />
                      <label
                        htmlFor="expense_type_b"
                        className="peer-disabled:border-gray-300 peer-disabled:bg-gray-50 peer-disabled:text-gray-300 dark:peer-disabled:border-gray-950 dark:peer-disabled:bg-slate-900 dark:peer-disabled:text-slate-700 inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="block">
                          <div className="w-full text-md font-semibold">
                            팀 운영비
                          </div>
                          {!isEditing && (
                            <div className="w-full text-sm">
                              잔액: {teamFund.toLocaleString()}원
                            </div>
                          )}
                        </div>
                        {expenseType === "TeamFund" && (
                          <IoCheckmark className="w-6 h-6" />
                        )}
                      </label>
                    </li>
                  </ul>
                )}
              </div>
            )}

            <div className="relative">
              <InputField
                label="상호명"
                id="merchant_name"
                value={selectedTransaction.merchant_name || ""}
                className="bg-white border border-slate-200"
                onChange={handleMerchantInputChange}
                placeholder="상호명 입력"
                required={true}
              />
              {merchantSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {merchantSuggestions.map((merchantName, index) => (
                    <li
                      key={index}
                      onClick={() =>
                        handleMerchantSuggestionClick(merchantName)
                      }
                      className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                    >
                      {merchantName}
                    </li>
                  ))}
                </ul>
              )}
              {/* {merchantSuggestions.length > 0 && (
                                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                                    {merchantSuggestions.map((suggestion) => (
                                        <li
                                            key={suggestion._id}
                                            onClick={() => handleMerchantSuggestionClick(suggestion)}
                                            className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                                        >
                                            {suggestion.merchant_name}
                                        </li>
                                    ))}
                                </ul>
                            )} */}
            </div>
            <div className="relative space-y-4">
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    지출 메뉴
                  </h3>
                  {(selectedTransaction.merchant_name || selectedTransaction.menu_items?.length > 0) && (
                    <button
                      onClick={() => setShowMenuForm(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + 메뉴 추가
                    </button>
                  )}
                </div>

                {!selectedTransaction.merchant_name && selectedTransaction.menu_items?.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-500">상호명을 입력해주세요</p>
                  </div>
                ) : (
                  <ul className="space-y-2 mb-4">
                    {selectedTransaction.menu_items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium dark:text-slate-300">{item.name}</span>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.price.toLocaleString()}원 × {item.quantity}개
                            = {(item.price * item.quantity).toLocaleString()}원
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMenuItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <MdClose />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedTransaction.merchant_name && !showMenuForm && (
                  setShowMenuForm(true)
                )}

                {showMenuForm && (
                  <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg dark:bg-slate-700">
                    <div className="relative">
                      <InputField
                        label="메뉴명"
                        id="menu_name"
                        value={currentMenuItem.name}
                        className="bg-white border border-slate-200 dark:bg-slate-800"
                        onChange={handleMenuInputChange}
                        placeholder="메뉴명 입력"
                      />
                      {menuSuggestions.length > 0 && (
                        <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                          {menuSuggestions.map((menu, index) => (
                            <li
                              key={index}
                              onClick={() => handleMenuSuggestionClick(menu)}
                              className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                    {menu.name} 
                                    {menu.count >= 4 && <IoRibbonOutline className="inline-block text-green-500 ml-2" />}
                                </span>
                                <span className="text-sm text-gray-500">{menu.price.toLocaleString()}원</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <InputField
                          label="가격"
                          id="menu_price"
                          type="number"
                          value={currentMenuItem.price}
                          className="bg-white border border-slate-200 dark:bg-slate-800"
                          onChange={(e) => setCurrentMenuItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          placeholder="가격 입력"
                        />
                      </div>
                      <div className="w-24">
                        <InputField
                          label="수량"
                          id="menu_quantity"
                          type="number"
                          value={currentMenuItem.quantity}
                          className="bg-white border border-slate-200 dark:bg-slate-800"
                          onChange={(e) => setCurrentMenuItem(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) }))}
                          placeholder="수량"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddMenuItem}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5"
                      >
                        추가하기
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMenuForm(false)}
                        className="bg-gray-200 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm px-5 py-2.5"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  지출금액
                </label>
                <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-lg p-3 text-right">
                  <span className="text-lg font-semibold text-blue-700 dark:text-blue-500">
                    {(selectedTransaction.transaction_amount || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
            <InputField
              label="거래일"
              id="transaction_date"
              type="date"
              value={selectedTransaction.transaction_date || new Date()} // 값이 없으면 기본값 설정
              className="bg-white border border-slate-200"
              onChange={(e) => {
                setSelectedTransaction((prev) => ({
                  ...prev,
                  transaction_date: e.target.value,
                }));
              }}
              required={true}
            />

            {userCards.length >= 2 && (
              <SelectField
                label="사용 카드"
                id="card_id"
                value={selectedTransaction.card_id}
                onChange={handleCardChange}
                options={userCards.map((card) => ({
                  value: card._id,
                  label: card.card_number,
                }))}
                required={true}
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2 p-6 dark:bg-slate-800">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isEditing ? "수정" : "추가"}
            </button>
            {!isEditing ? (
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-lg text-gray-600 font-semibold dark:text-gray-400 dark:font-normal"
              >
                닫기
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-3 rounded-lg text-red-600 font-semibold dark:text-orange-400 dark:font-normal"
              >
                삭제
              </button>
            )}
          </div>
      </Drawer>

      {/* 삭제 모달 : 추후 컴포넌트로 변경 */}
      {/* {isDeleteConfirmOpen && (
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
                                onClick={handleDeleteClick}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteClick}
        title="지출 삭제"
        description="정말로 삭제하시겠습니까?"
        confirmText="삭제"
        confirmColor="red"
      />

      {isMenuLayerOpen && selectedMerchant && (
        <div className="menu-layer">
            <input 
                type="text" 
                onChange={(e) => handleMenuSearch(e.target.value)}
                placeholder="메뉴 검색..."
            />
            {filteredMenus.map(menu => (
                <div key={menu._id} onClick={() => handleMenuSelect(menu)}>
                    {menu.name}
                </div>
            ))}
        </div>
      )}
    </>
  );
};

TransactionDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  transactionData: PropTypes.object.isRequired,
  userCards: PropTypes.array.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  errMsg: PropTypes.string,
  setErrMsg: PropTypes.string,
  cardBalance: PropTypes.number.isRequired,
  teamFund: PropTypes.number.isRequired,
  drawerColor: PropTypes.string,
};

export default TransactionDrawer;

// const handleSave = async () => {
//     try {
//         setErrMsg('');

//         const cardId = selectedTransaction.card_id || userCards[0]._id;
//         const transactionData = {
//             card_id: cardId,
//             transaction_date: selectedTransaction.transaction_date,
//             merchant_name: selectedTransaction.merchant_name,
//             menu_name: selectedTransaction.menu_name,
//             transaction_type: "expense",
//             expense_card: selectedTransaction.expense_card,
//             expense_type: expenseType,
//             transaction_amount: selectedTransaction.transaction_amount,
//         };

//         // 금액이 변경된 경우에만 transaction_amount 추가
//         const originalAmount = Number(transactionData.transaction_amount); // 예시로
//         const currentAmount = Number(selectedTransaction.transaction_amount);

//         if (originalAmount !== currentAmount) {
//             transactionData.transaction_amount = currentAmount;
//         }

//         if (isEditing) {
//             await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
//         } else {
//             const response = await axios.post(API_URLS.TRANSACTIONS, transactionData);
//             onSave(response.data.transaction);
//             onClose();
//         }
//     } catch (error) {
//         const errorMsg = handleError(error);
//         console.log('errorMsg', errorMsg);
//         c
//     }
// };

// const handleDelete = async () => {
//     try {
//         await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
//         onDelete();
//         onClose();
//     } catch (error) {
//         setErrMsg("삭제 중 오류가 발생했습니다.");
//         console.error('삭제 중 오류:', error);
//     }
// };

// useEffect(() => {
//     if (transactionData.length > 0) {
//         console.log("transactionData", transactionData);
//         setSelectedTransaction(prev => ({
//             ...prev,
//             ...transactionData,
//             card_id: transactionData.card_id || (userCards.length > 0 ? userCards[0]._id : ""),
//             transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0], // 기본값 설정
//         }));
//         setExpenseType(transactionData.expense_type);
//         console.log("transactionData.expense_type", transactionData.expense_type);
//     }
// }, [transactionData, userCards]);
