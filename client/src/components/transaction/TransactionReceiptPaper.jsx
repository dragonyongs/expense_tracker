import React, { forwardRef } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { CgClose } from "react-icons/cg";
import { toPng } from "html-to-image";
import { formatDateToKorean } from "../../utils/dateUtils";

const EXPENSE_TYPE_LABELS = {
  TeamFund: "팀운영비",
  RegularExpense: "팀카드",
  OvertimeMealExpense: "야근식대",
};

export const getExpenseLabel = (expenseType) => {
  return EXPENSE_TYPE_LABELS[expenseType] || "기타";
};

const TransactionReceiptPaper = forwardRef(
  ({ transaction, cardNumber, cardUser, onClose }, ref) => {
    const handleDownloadImage = async () => {
      if (ref.current && transaction) {
        try {
          const formattedDate = formatDateToKorean(
            transaction.transaction_date,
            "full"
          );

          const fileName = `영수증_${formattedDate}_${transaction.merchant_name}_${cardUser.member_name}.png`;

          const dataUrl = await toPng(ref.current, {
            width: ref.current.offsetWidth,
            height: ref.current.offsetHeight,
          });
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = fileName; // 동적 파일 이름 설정
          link.click();
        } catch (error) {
          console.error("이미지 저장 중 오류가 발생했습니다:", error);
        }
      }
    };

    if (!transaction) {
      return (
        <div className="text-center text-gray-500">거래 내역이 없습니다.</div>
      );
    }

    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b dark:border-b-gray-700">
          <h1 className="text-md font-semibold pl-2 dark:text-gray-200">
            전자영수증
          </h1>
          <div className="flex items-center">
            <button
              className="p-2 hover:bg-gray-100 rounded-full dark:text-gray-200"
              onClick={handleDownloadImage}
            >
              <MdOutlineFileDownload className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full dark:text-gray-200"
              onClick={onClose}
            >
              <CgClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Paper Effect */}
        <div className="flex justify-center">
          <div
            ref={ref}
            className="max-w-lg shadow-xl bg-white dark:bg-slate-900 relative border border-gray-100 dark:border-transparent dark:text-gray-300"
          >
            {/* Top torn edge effect */}
            <div
              className="absolute -top-4 left-0 right-0 h-4 bg-white dark:bg-slate-900"
              style={{
                clipPath:
                  "polygon(0% 100%, 5% 60%, 10% 100%, 15% 70%, 20% 100%, 25% 60%, 30% 100%, 35% 60%, 40% 100%, 45% 60%, 50% 100%, 55% 60%, 60% 100%, 65% 60%, 70% 100%, 75% 60%, 80% 100%, 85% 60%, 90% 100%, 95% 60%, 100% 100%)",
              }}
            />

            {/* Receipt Content */}
            <div className="p-8 text-sm">
              {/* Store Header */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tighter">
                  {transaction.merchant_name}
                </h1>
                <p className="text-sm">
                  지출 ({getExpenseLabel(transaction.expense_type)})
                </p>
              </div>

              {/* Store Info */}
              <div className="mt-4 text-sm space-y-1 font-mono">
                <p>
                  카드번호: <span>{cardNumber}</span>
                </p>
                <p>
                  거래일자:{" "}
                  {formatDateToKorean(transaction.transaction_date, "full")}
                </p>
              </div>

              {/* Dotted Line */}
              <div className="my-4 border-t border-gray-300 dark:border-gray-800 border-dashed" />

              {/* Order Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{transaction.menu_name}</span>
                  <div className="flex space-x-4 font-mono">
                    <span>1</span>
                    <span>
                      {transaction.transaction_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dotted Line */}
              <div className="my-4 border-t border-gray-300 dark:border-gray-800 border-dashed" />

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>합계</span>
                  <span className="font-mono">
                    {transaction.transaction_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>결제금액</span>
                  <span className="font-mono">
                    {transaction.transaction_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Dotted Line */}
              <div className="my-4 border-t border-gray-300 dark:border-gray-800 border-dashed" />

              {/* Payment Info */}
              <div className="flex flex-col space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span>결제자</span>
                  <span className="tracking-tighter">
                    {`${cardUser.member_name} ${cardUser.position}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>기록시간</span>
                  <span className="tracking-tighter">
                    {formatDateToKorean(transaction.createdAt, "time")}
                  </span>
                </div>
              </div>
            </div>
            {/* Bottom torn edge effect */}
            <div
              className="absolute -bottom-4 left-0 right-0 h-4 bg-white dark:bg-slate-900"
              style={{
                clipPath:
                  "polygon(0% 0%, 5% 40%, 10% 0%, 15% 40%, 20% 0%, 25% 40%, 30% 0%, 35% 40%, 40% 0%, 45% 40%, 50% 0%, 55% 40%, 60% 0%, 65% 40%, 70% 0%, 75% 40%, 80% 0%, 85% 40%, 90% 0%, 95% 40%, 100% 0%)",
              }}
            />
          </div>
        </div>
      </>
    );
  }
);

TransactionReceiptPaper.displayName = "TransactionReceiptPaper";

export default TransactionReceiptPaper;
