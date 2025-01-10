import React, { useState, useRef, useEffect } from "react";
import { MdClose, MdDragIndicator } from "react-icons/md";
import { TbUserPlus } from "react-icons/tb";

const SampleForm = ({ onClose }) => {
  const [leaveType, setLeaveType] = useState("하루종일");
  const [newApprover, setNewApprover] = useState("");
  const [morningStartTime, setMorningStartTime] = useState("09:00");
  const [morningEndTime, setMorningEndTime] = useState("13:00");
  const [afternoonStartTime, setAfternoonStartTime] = useState("14:00");
  const [afternoonEndTime, setAfternoonEndTime] = useState("18:00");
  const [draggingItem, setDraggingItem] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const dragItemRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      e.preventDefault(); // 이제 문제가 발생하지 않음
      // 여기에 이벤트 처리 코드 작성
    };
  
    // 이벤트 리스너 등록 (passive: false로 설정)
    const element = document.getElementById("test"); // 예시: 특정 엘리먼트
    element.addEventListener("touchstart", handleTouchStart, { passive: false });
  
    // 클린업
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);
  

  const [columns, setColumns] = useState({
    approvers: {
      name: "결재자 목록",
      items: [
        { id: "1", name: "001 팀장" },
        { id: "2", name: "002 본부장" },
        { id: "3", name: "003 대표" },
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

  const handleTouchStart = (e, index) => {
    // 현재 활성화된 터치가 있는지 확인
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0];
    if (!touch) return;
  
    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
  
    // 터치 오프셋 계산
    setTouchOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  
    setDraggingItem(index);
    dragItemRef.current = item;
  
    // 드래그 아이템 스타일 설정
    item.style.position = 'fixed';
    item.style.zIndex = 1000;
    item.style.width = `${rect.width}px`;
    item.style.opacity = '0.9';
    item.style.transform = 'scale(1.05)';
    item.style.transition = 'transform 0.2s ease';
  
    // 기본 동작을 방지하여 드래그 효과를 적용
    // e.preventDefault();
  };
  
  const handleTouchMove = (e) => {
    if (dragItemRef.current && draggingItem !== null) {
        const touch = e.targetTouches ? e.targetTouches[0] : null; // targetTouches가 있는지 확인

        if (!touch) return; // 터치가 없으면 리턴

        dragItemRef.current.style.left = `${touch.clientX - touchOffset.x}px`;
        dragItemRef.current.style.top = `${touch.clientY - touchOffset.y}px`;
    }
  };
  
  const updateItemOrder = (draggingIndex, targetIndex) => {
    const items = [...columns.approvers.items];
    const [draggedItem] = items.splice(draggingIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    setColumns((prev) => ({
        ...prev,
        approvers: { ...prev.approvers, items },
    }));
  };

  const handleTouchEnd = (e) => {
    if (draggingItem !== null && dragItemRef.current) {
        const touch = e.changedTouches ? e.changedTouches[0] : null;

        if (!touch) return;

        const draggableItems = [...document.querySelectorAll('.draggable')];
        let targetIndex = draggingItem;
        let closestDistance = Infinity;

        draggableItems.forEach((item, index) => {
            if (index !== draggingItem) {
                const rect = item.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const distance = Math.abs(touch.clientY - centerY);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    targetIndex = index;
                }
            }
        });

        // 공통 함수 호출
        updateItemOrder(draggingItem, targetIndex);

        // 스타일 초기화
        resetDragStyles();
        setDraggingItem(null);
        dragItemRef.current = null;
    }

    e.preventDefault(); // 기본 동작 방지
  };

  // 스타일 초기화 함수
  const resetDragStyles = () => {
    if (dragItemRef.current) {
        dragItemRef.current.style.position = '';
        dragItemRef.current.style.zIndex = '';
        dragItemRef.current.style.top = '';
        dragItemRef.current.style.left = '';
        dragItemRef.current.style.width = '';
        dragItemRef.current.style.opacity = '';
        dragItemRef.current.style.transform = '';
        dragItemRef.current.style.transition = '';
    }
  };

  // 드래그 시작 시 공통 스타일 적용
  const applyDragStyles = (element) => {
    element.classList.add('dragging');
    element.style.opacity = '0.9';
    element.style.transform = 'scale(1.02)';
    element.style.transition = 'transform 0.2s ease';
  };

  // 드래그 종료 시 공통 스타일 제거
  const removeDragStyles = (element) => {
    element.classList.remove('dragging');
    element.style.opacity = '';
    element.style.transform = '';
    element.style.transition = '';
  };

  // 데스크탑 드래그 이벤트 핸들러
  const handleDragStart = (e, index) => {
    dragItemRef.current = e.target;
    setDraggingItem(index);
    applyDragStyles(e.target);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // 기본 동작 방지
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;

    const container = e.currentTarget.parentNode;
    const siblings = [...container.querySelectorAll('.draggable:not(.dragging)')];

    const nextSibling = siblings.find(sibling => {
        const rect = sibling.getBoundingClientRect();
        return e.clientY < rect.top + rect.height / 2;
    });

    if (nextSibling) {
        container.insertBefore(draggable, nextSibling);
    } else {
        container.appendChild(draggable);
    }
  };

  const handleDragEnd = (e, index) => {
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;

    removeDragStyles(draggable);

    // 드래그가 끝날 때 인덱스 업데이트
    const draggableItems = [...document.querySelectorAll('.draggable')];
    let targetIndex = draggingItem;

    // 드래그된 아이템의 위치를 기준으로 가장 가까운 인덱스를 찾음
    draggableItems.forEach((item, idx) => {
        if (idx !== draggingItem) {
            const rect = item.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const distance = Math.abs(e.clientY - centerY);

            if (distance < Math.abs(e.clientY - (draggable.getBoundingClientRect().top + draggable.offsetHeight / 2))) {
                targetIndex = idx;
            }
        }
    });

    // 인덱스가 변경된 경우에만 업데이트
    if (targetIndex !== draggingItem) {
        updateItemOrder(draggingItem, targetIndex);
    }

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

        <div className="space-y-4" id="test">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  결재 라인
                </label>
                <button
                  className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInput(true);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowInput(true);
                  }}
                >
                  + 결재자 추가
                </button>
            </div>

            {/* 결재 라인 */}
            <div className="space-y-4">
              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
              {columns.approvers.items.map((item, index) => (
                  <div
                    key={item?.id}
                    className={`border rounded-lg bg-white draggable ${draggingItem === index ? 'dragging' : ''}`}
                    draggable="true"
                    onTouchStart={(e) => {
                      // 삭제 버튼이나 추가 버튼을 터치했을 때는 드래그 시작하지 않음
                      if (e.target.closest('button')) {
                        return;
                      }
                      handleTouchStart(e, index);
                    }}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onDragStart={(e) => {
                      // 삭제 버튼이나 추가 버튼을 클릭했을 때는 드래그 시작하지 않음
                      if (e.target.closest('button')) {
                        e.preventDefault();
                        return;
                      }
                      handleDragStart(e, index);
                    }}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
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
                          {item?.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveApprover(item?.id);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          handleRemoveApprover(item?.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                {showInput && (
                  <div className="border rounded-lg bg-white">
                    <div className="flex items-center justify-between p-3 w-full">
                      <div className="flex items-center gap-3 flex-1 min-w-0"> {/* flex-1과 min-w-0 추가 */}
                        <div className="text-blue-600 flex-shrink-0"> {/* flex-shrink-0 추가 */}
                          <TbUserPlus size={24} />
                        </div>
                        <div className="flex-1 min-w-0"> {/* input을 감싸는 div 추가 */}
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
                            className="w-full text-gray-900 font-medium p-1 border rounded"
                          />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNewApprover();
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveNewApprover();
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2" {/* flex-shrink-0과 ml-2 추가 */}
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>
                )}
                
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
