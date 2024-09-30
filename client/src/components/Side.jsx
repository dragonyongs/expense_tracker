const Side = () => {
    return (
        <div className='max-w-sm max-h-[600px]'>
            {/* <img src="/test-img.png" alt="" /> */}
            <h4 className="font-semibold text-xl leading-relaxed">한푼도 남기지 마라</h4>
            <div className="mb-4 font-bold text-4xl">
                <h2>스타리치 어드바이져</h2>
                <h2 className="text-blue-500">카드 지출 관리</h2>
            </div>
            <p>스타리치 어드바이져는 매월 10만원의 복지를 통해 직원의 배를 든든히 채워주고 있습니다.</p>

            <ul className="mt-12">
                <li className="flex items-center space-x-6">
                    <div className="flex justify-center items-center w-24 h-24 rounded-full bg-white">
                        <img src="/credit-card.svg" className="w-12 h-12" alt="" />
                    </div>
                    <div>
                        <h5>만나서 반가워요!</h5>
                        <h4 className="font-semibold text-lg">신규회원 <span className="text-orange-500">10만원 입금!</span></h4>
                    </div>
                </li>
                <li className="flex items-center mt-6 space-x-6">
                    <div className="flex justify-center items-center w-24 h-24 rounded-full bg-white">
                        <img src="/taxi-transport.svg" className="w-12 h-12" alt="" />
                    </div>
                    <div>
                        <h5>교통비 별도</h5>
                        <h4 className="font-semibold text-lg">행사 참엽 후 <span className="text-orange-500">지출 금액 입금!</span></h4>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Side;