import React, { forwardRef } from "react";
import { formatDateToKorean } from "../../utils/dateUtils";
import { TbCreditCardPay } from "react-icons/tb";
import { MdOutlineFileDownload } from "react-icons/md";
import { CgClose } from "react-icons/cg";

const TransactionReceiptUpate = forwardRef(
  ({ transaction, cardNumber, cardUser }, ref) => {
    if (!transaction) {
      return (
        <div className="text-center text-gray-500">거래 내역이 없습니다.</div>
      );
    }

    return (
      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-medium">전자영수증</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MdOutlineFileDownload className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <CgClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={ref} className="relative bg-white shadow-lg">
          {/* Top torn edge effect */}
          <div
            className="absolute -top-2 left-0 right-0 h-4 bg-white"
            style={{
              clipPath:
                "polygon(0% 100%, 5% 60%, 10% 100%, 15% 70%, 20% 100%, 25% 60%, 30% 100%, 35% 60%, 40% 100%, 45% 60%, 50% 100%, 55% 60%, 60% 100%, 65% 60%, 70% 100%, 75% 60%, 80% 100%, 85% 60%, 90% 100%, 95% 60%, 100% 100%)",
            }}
          />

          {/* Main Content */}
          <div className="pt-2 px-8 pb-8 font-mono text-sm border-l border-r border-gray-200">
            <div className="text-center space-y-2 pt-4">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto">
                <TbCreditCardPay className="w-6 h-6" />
              </div>
              <div className="print:text-xl text-2xl font-semibold text-center dark:text-slate-200">
                {transaction.merchant_name}
              </div>
              <div className="text-center text-green-500 print:text-2xl text-3xl font-bold">
                ₩ {transaction.transaction_amount.toLocaleString()}
              </div>
            </div>

            <div className="my-4 border-t border-gray-300 border-dashed" />

            <div className="grid grid-cols-4 gap-4 print:text-lg">
              <div className="font-medium">카드번호</div>
              <div className="col-span-3">{cardNumber}</div>
              <div className="font-medium">카드소유</div>
              <div className="col-span-3">{`${cardUser.member_name} ${cardUser.position}`}</div>
              <div className="font-medium">거래일자</div>
              <div className="col-span-3">
                {formatDateToKorean(transaction.transaction_date)}
              </div>
              <div className="font-medium">거래상점</div>
              <div className="col-span-3">{transaction.merchant_name}</div>
              {transaction.menu_name.length !== 0 && (
                <>
                  <div className="font-medium">주문메뉴</div>
                  <div className="col-span-3">{transaction.menu_name}</div>
                </>
              )}
              <div className="font-medium">거래금액</div>
              <div className="col-span-3">
                {transaction.transaction_amount.toLocaleString()}원
              </div>
            </div>
          </div>

          {/* Bottom torn edge effect */}
          <div
            className="absolute -bottom-2 left-0 right-0 h-4 bg-white"
            style={{
              clipPath:
                "polygon(0% 0%, 5% 40%, 10% 0%, 15% 40%, 20% 0%, 25% 40%, 30% 0%, 35% 40%, 40% 0%, 45% 40%, 50% 0%, 55% 40%, 60% 0%, 65% 40%, 70% 0%, 75% 40%, 80% 0%, 85% 40%, 90% 0%, 95% 40%, 100% 0%)",
            }}
          />
        </div>
      </div>
    );
  }
);

TransactionReceiptUpate.displayName = "TransactionReceiptUpate";

export default TransactionReceiptUpate;
