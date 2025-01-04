import React, { useState } from "react";
import { MdClose, MdDragIndicator } from "react-icons/md";

const SampleForm = () => {
  const [leaveType, setLeaveType] = useState("하루종일");
  const [showPopover, setShowPopover] = useState(false);
  const [newApprover, setNewApprover] = useState("");
  const [morningStartTime, setMorningStartTime] = useState("09:00");
  const [morningEndTime, setMorningEndTime] = useState("13:00");
  const [afternoonStartTime, setAfternoonStartTime] = useState("14:00");
  const [afternoonEndTime, setAfternoonEndTime] = useState("18:00");
  const [draggingItem, setDraggingItem] = useState(null); // 드래그 중인 항목 저장

  const [columns, setColumns] = useState({
    approvers: {
      name: "결재자 목록",
      items: [
        { id: "1", name: "홍길동 팀장" },
        { id: "2", name: "두울리 본부장" },
        { id: "3", name: "고길동 대표" },
      ],
    },
  });

  const handleAddApprover = () => {
    if (newApprover.trim()) {
      const newItem = { id: String(Date.now()), name: newApprover };
      setColumns((prev) => ({
        ...prev,
        approvers: {
          ...prev.approvers,
          items: [...prev.approvers.items, newItem],
        },
      }));
      setNewApprover("");
      setShowPopover(false);
    }
  };

  const handleRemoveApprover = (id) => {
    setColumns((prev) => ({
      ...prev,
      approvers: {
        ...prev.approvers,
        items: prev.approvers.items.filter((item) => item.id !== id),
      },
    }));
  };

  const renderTimeInputs = () => {
    if (leaveType === "오전반차") {
      return (
        <div className="flex gap-4">
          <input
            type="time"
            value={morningStartTime}
            min="09:00"
            max="13:00"
            onChange={(e) => setMorningStartTime(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="time"
            value={morningEndTime}
            min="09:00"
            max="13:00"
            onChange={(e) => setMorningEndTime(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      );
    } else if (leaveType === "오후반차") {
      return (
        <div className="flex gap-4">
          <input
            type="time"
            value={afternoonStartTime}
            min="14:00"
            max="18:00"
            onChange={(e) => setAfternoonStartTime(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="time"
            value={afternoonEndTime}
            min="14:00"
            max="18:00"
            onChange={(e) => setAfternoonEndTime(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      );
    }
    return null;
  };

  const handleDragStart = (index) => {
    setDraggingItem(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // 기본 동작(드롭 금지)을 방지
  };

  const handleDrop = (index) => {
    if (draggingItem === null) return;

    const items = [...columns.approvers.items];
    const draggedItem = items[draggingItem];

    // 드래그 중인 항목을 제거하고 새로운 위치에 삽입
    items.splice(draggingItem, 1);
    items.splice(index, 0, draggedItem);

    setColumns((prev) => ({
      ...prev,
      approvers: { ...prev.approvers, items },
    }));

    setDraggingItem(null);
  };

  return (
    <>
      <div className="space-y-6 h-dateFilter-screen overflow-y-auto">
        <div className="flex justify-between items-start sticky top-0 bg-white z-10 pb-4 border-b">
          <h5 className="text-xl font-bold">연차 신청서</h5>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              결재 라인
            </label>
            <button
              className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
              onClick={() => setShowPopover(true)}
            >
              + 결재자 추가
            </button>
          </div>
          {showPopover && (
            <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-200">
              <input
                type="text"
                value={newApprover}
                onChange={(e) => setNewApprover(e.target.value)}
                placeholder="결재자 이름 입력"
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddApprover();
                  }
                }}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddApprover}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          )}
          {/* <div className="space-y-2 p-4 rounded-lg bg-gray-50">
            {columns.approvers.items.map((item, index) => (
              <div key={index} className="border rounded-lg bg-white">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                      <MdDragIndicator size={24} />
                    </div>
                    <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-5 h-5 font-medium text-xs">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveApprover(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div> */}
          <div className="space-y-6 overflow-y-auto">
            {/* 결재 라인 */}
            <div className="space-y-4">
              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                {columns.approvers.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg bg-white"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                          <MdDragIndicator size={24} />
                        </div>
                        <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-5 h-5 font-medium text-xs">
                          {index + 1}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {item.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveApprover(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            신청일
          </label>
          <input
            type="date"
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            종류
          </label>
          <ul className="flex gap-4 mt-2">
            {["하루종일", "오전반차", "오후반차"].map((type) => (
              <li key={type}>
                <button
                  onClick={() => setLeaveType(type)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    leaveType === type
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">{renderTimeInputs()}</div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            사유
          </label>
          <textarea
            className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="휴가 사유를 입력해주세요"
          ></textarea>
        </div>
      </div>

      <div className="mt-6">
        <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
          신청하기
        </button>
      </div>
    </>
  );
};

export default SampleForm;
