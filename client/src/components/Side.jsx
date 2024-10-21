const Side = () => {
    return (
        <div className='max-w-sm max-h-[600px]'>
            {/* <img src="/test-img.png" alt="" /> */}
            <h4 className="font-semibold text-xl leading-relaxed dark:text-slate-600">한푼도 남기지 마라</h4>
            <div className="mb-4 font-bold text-4xl">
                <h2 className="dark:text-slate-500">스타리치 어드바이져</h2>
                <h2 className="text-blue-500 dark:text-blue-600">카드 지출 관리</h2>
            </div>
            <p className="dark:text-slate-500">스타리치 어드바이져는 개인별 10만원 지급을 통해 직원의 배를 든든히(?) 채워주고 있습니다.</p>

            <ul className="mt-12">
                <li className="flex items-center space-x-6">
                    <div className="flex justify-center items-center w-24 h-24 rounded-full bg-white shadow-sm dark:bg-slate-800">
                        <img src="/credit-card.svg" className="w-12 h-12" alt="" />
                    </div>
                    <div className="dark:text-slate-500">
                        <h5>밥은 먹었어요?</h5>
                        <h4 className="font-semibold text-lg">임직원 <span className="text-purple-500 dark:text-indigo-600">월 10만원 지원!</span></h4>
                    </div>
                </li>
                <li className="flex items-center mt-6 space-x-6">
                    <div className="flex justify-center items-center w-24 h-24 rounded-full bg-white shadow-sm dark:bg-slate-800">
                        <img src="/taxi-transport.svg" className="w-12 h-12" alt="" />
                    </div>
                    <div className="dark:text-slate-500">
                        <h5>여비교통비 지원</h5>
                        <h4 className="font-semibold text-lg">행사 참여 교통비 <span className="text-purple-500 dark:text-indigo-600">별도 입금!</span></h4>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Side;