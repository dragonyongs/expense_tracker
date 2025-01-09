import React, { useState } from "react";
import { MdClose, MdDragIndicator } from "react-icons/md";
import { TbUserPlus } from "react-icons/tb";

const SampleForm = ({ onClose }) => {
  const [leaveType, setLeaveType] = useState("하루종일");
  const [newApprover, setNewApprover] = useState("");
  const [morningStartTime, setMorningStartTime] = useState("09:00");
  const [morningEndTime, setMorningEndTime] = useState("13:00");
  const [afternoonStartTime, setAfternoonStartTime] = useState("14:00");
  const [afternoonEndTime, setAfternoonEndTime] = useState("18:00");
  const [draggingItem, setDraggingItem] = useState(null); // 드래그 중인 항목 저장
  const [showInput, setShowInput] = useState(false); // 입력 필드 표시 상태 추가

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
      setShowInput(false); // 입력 필드 숨김
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

  const handleRemoveNewApprover = () => {
    setNewApprover(""); // 신규 결재자 이름 초기화
    setShowInput(false); // 입력 필드 숨김
  };

  const renderTimeInputs = () => {
    if (leaveType === "오전반차" || leaveType === "오후반차") {
      return (
        <div className="bg-white mt-4">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">시작 시간</label>
              <input
                type="time"
                value={leaveType === "오전반차" ? morningStartTime : afternoonStartTime}
                min={leaveType === "오전반차" ? "09:00" : "14:00"}
                max={leaveType === "오전반차" ? "13:00" : "18:00"}
                onChange={(e) => {
                  if (leaveType === "오전반차") {
                    setMorningStartTime(e.target.value);
                  } else {
                    setAfternoonStartTime(e.target.value);
                  }
                }}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">종료 시간</label>
              <input
                type="time"
                value={leaveType === "오전반차" ? morningEndTime : afternoonEndTime}
                min={leaveType === "오전반차" ? "09:00" : "14:00"}
                max={leaveType === "오전반차" ? "13:00" : "18:00"}
                onChange={(e) => {
                  if (leaveType === "오전반차") {
                    setMorningEndTime(e.target.value);
                  } else {
                    setAfternoonEndTime(e.target.value);
                  }
                }}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // const handleTouchStart = (index) => {
  //   setDraggingItem(index);
  // };
  
  // const handleTouchMove = (e) => {
  //   e.preventDefault(); // 스크롤 방지
  //   const touchLocation = e.touches[0];
  //   console.log("Touch move:", touchLocation.clientX, touchLocation.clientY);
  // };
  
  // const handleTouchEnd = (index) => {
  //   console.log("Dropped on index:", index, "Dragging item:", draggingItem);
  //   if (draggingItem !== null) {
  //     const items = [...columns.approvers.items];
  //     const draggedItem = items[draggingItem];
  
  //     items.splice(draggingItem, 1);
  //     items.splice(index, 0, draggedItem);
  
  //     setColumns((prev) => ({
  //       ...prev,
  //       approvers: { ...prev.approvers, items },
  //     }));
  //     setDraggingItem(null);
  //   }
  // };
  
  const handleDragStart = (index) => {
    console.log('handleDragStart');
    setDraggingItem(index);
  };

  const handleDragOver = (e) => {
    console.log('handleDragOver');
    e.preventDefault(); // 기본 동작(드롭 금지)을 방지
  };

  const handleDrop = (index) => {
    console.log('handleDrop');
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
      <div className="space-y-6 h-dateFilter-screen overflow-y-auto" >
        <div className="flex justify-between items-start sticky top-0 bg-white z-10 pb-4 border-b">
          <h5 className="text-xl font-bold">연차 신청서</h5>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose}>
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
              onClick={() => setShowInput(true)}
            >
              + 결재자 추가
            </button>
          </div>
          <div className="space-y-6 overflow-y-auto">
            {/* 결재 라인 */}
            <div className="space-y-4">
              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                {columns.approvers.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg bg-white draggable"
                    draggable
                    // onTouchStart={() => handleTouchStart(index)}
                    // onTouchMove={handleTouchMove}
                    // onTouchEnd={() => handleTouchEnd(index)}
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
                {showInput && (
                  <div
                    className="border rounded-lg bg-white"
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600 cursor-grab active:cursor-grabbing">
                          <TbUserPlus size={24} />
                        </div>
                        <input
                          type="text"
                          value={newApprover}
                          onChange={(e) => setNewApprover(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newApprover.trim()) {
                              handleAddApprover();
                            }
                          }}
                          placeholder="결재자 이름 입력"
                          className="text-gray-900 font-medium p-1 border rounded"
                        />
                      </div>
                      <button
                        onClick={handleRemoveNewApprover}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>
                )}
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
          <label className="block text-sm font-medium text-gray-700">종류</label>
          <ul className="flex gap-4 mt-2">
            {["하루종일", "오전반차", "오후반차"].map((type) => (
              <li key={type}>
                <button
                  onClick={() => setLeaveType(type)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    leaveType === type
                      ? "bg-blue-50 text-blue-600 shadow-md shadow-blue-100 border border-blue-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-transparent border-transparent"
                  }`}
                >
                  {type}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            {renderTimeInputs()}
          </div>
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
