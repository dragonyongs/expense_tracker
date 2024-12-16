import React, { useState, useEffect } from 'react';

interface ConfettiProps {
    triggerConfetti: boolean; // 트리거를 통해 색종이 효과 실행
}

export const ConfettiEffect: React.FC<ConfettiProps> = ({ triggerConfetti }) => {
    const [confetti, setConfetti] = useState<Array<{
        id: number;
        color: string;
        angle: number;
        distance: number;
        size: number;
        rotation: number;
        delay: number;
    }>>([]);

    const [isConfettiActive, setIsConfettiActive] = useState(false);

    // 색종이를 생성하는 함수
    const generateConfetti = (count: number) => {
        return Array.from({ length: count }, (_, index) => ({
            id: index,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`, // 랜덤 색상
            angle: Math.random() * 360, // 랜덤 퍼짐 각도
            distance: Math.random() * 300 + 100, // 100~400px 거리
            size: Math.random() * 6 + 2, // 2~8px 크기
            rotation: Math.random() * 720, // 초기 회전 각도
            delay: Math.random() * 0.2, // 애니메이션 시작 지연
        }));
    };

    // 색종이 애니메이션 트리거 처리
    const handleConfetti = () => {
        const newConfetti = generateConfetti(150); // 색종이 150개 생성
        setConfetti(newConfetti);
        setIsConfettiActive(true);

        // 애니메이션 종료 후 초기화
        setTimeout(() => {
            setIsConfettiActive(false);
            setConfetti([]);
        }, 3000); // 3초 뒤 종료
    };

    useEffect(() => {
        if (triggerConfetti) {
            handleConfetti();
        }
    }, [triggerConfetti]);

    // 각 입자의 애니메이션 keyframe 생성
    const getKeyframes = (particle: any) => `
        @keyframes explode-${particle.id} {
            0% {
                opacity: 1;
                transform: 
                    translate(0, 0) 
                    rotate(${particle.rotation}deg) 
                    scale(1);
            }
            50% {
                opacity: 1;
                transform: 
                    translate(
                        ${Math.cos(particle.angle * Math.PI / 180) * particle.distance}px, 
                        ${Math.sin(particle.angle * Math.PI / 180) * particle.distance}px
                    ) 
                    rotate(${particle.rotation + 180}deg) 
                    scale(1);
            }
            100% {
                opacity: 0;
                transform: 
                    translate(
                        ${Math.cos(particle.angle * Math.PI / 180) * (particle.distance * 1.5)}px, 
                        ${Math.sin(particle.angle * Math.PI / 180) * (particle.distance * 1.5) + 500}px
                    ) 
                    rotate(${particle.rotation + 720}deg) 
                    scale(0.5);
            }
        }
    `;

    return (
        <div>
            {isConfettiActive && (
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    {confetti.map((particle) => (
                        <div
                            key={particle.id}
                            className="absolute"
                            style={{
                                left: '50%',
                                top: '10%',
                                width: `${particle.size}px`, // 입자 크기 반영
                                height: `${particle.size}px`,
                                backgroundColor: particle.color,
                                borderRadius: Math.random() > 0.5 ? '50%' : '0%', // 원형/사각형 랜덤
                                animation: `explode-${particle.id} 3s ease-out ${particle.delay}s forwards`,
                            }}
                        />
                    ))}
                    <style>
                        {confetti.map(getKeyframes).join('')}
                    </style>
                </div>
            )}
        </div>
    );
};

{/* import React, { useState, useEffect } from 'react';

interface ConfettiProps {
    triggerConfetti: boolean; // boolean 값으로 수정
}

export const ConfettiEffect: React.FC<ConfettiProps> = ({ triggerConfetti }) => {
    const [confetti, setConfetti] = useState<Array<{
        id: number;
        color: string;
        angle: number;
        distance: number;
        size: number;
        rotation: number;
        delay: number;
    }>>([]);

    const [isConfettiActive, setIsConfettiActive] = useState(false);

    const handleConfetti = () => {
        const newConfetti = generateConfetti(150);
        setConfetti(newConfetti);
        setIsConfettiActive(true);

        setTimeout(() => {
            setIsConfettiActive(false);
            setConfetti([]);
        }, 3000);
    };

    const generateConfetti = (count) => {
        return Array.from({ length: count }, (_, index) => ({
            id: index,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            angle: Math.random() * 360, // 랜덤 퍼짐 각도
            distance: Math.random() * 300 + 100, // 100-400px 랜덤 퍼짐 거리
            size: Math.random() * 6 + 2, // 2-8px 랜덤 크기
            rotation: Math.random() * 720, // 랜덤 회전
            delay: Math.random() * 0.2 // 미세한 랜덤 딜레이
        }));
    };

    useEffect(() => {
        if (triggerConfetti) {
            handleConfetti();
        }
    }, [triggerConfetti]);


    const getKeyframes = (particle) => `
        @keyframes explode-${particle.id} {
            0% {
                opacity: 1;
                transform: 
                translate(0, 0) 
                rotate(${particle.rotation}deg);
            }
            20% {
                opacity: 1;
                transform: 
                translate(
                    ${Math.cos(particle.angle * Math.PI / 180) * particle.distance}px, 
                    ${Math.sin(particle.angle * Math.PI / 180) * particle.distance}px
                ) 
                rotate(${particle.rotation + 360}deg);
            }
            60% {
                opacity: 0.7;
            }
            100% {
                opacity: 0;
                transform: 
                translate(
                    ${Math.cos(particle.angle * Math.PI / 180) * (particle.distance * 1.5)}px, 
                    ${Math.sin(particle.angle * Math.PI / 180) * (particle.distance * 1.5) + 500}px
                ) 
                rotate(${particle.rotation + 720}deg) 
                scale(0.5);
            }
        }
    `;

    return (
        <div>
            {isConfettiActive && (
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    {confetti.map((particle) => (
                        <div
                            key={particle.id}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                                left: '50%',
                                top: '10%',
                                backgroundColor: particle.color,
                                animation: `explode-${particle.id} 3s ease-out ${particle.delay}s forwards`, // animation과 animationDelay를 하나의 속성으로 결합
                            }}
                        />
                    ))}
                    <style>{
                        confetti.map(getKeyframes).join('')
                    }</style>
                </div>
            )}
        </div>
    );

}; */}