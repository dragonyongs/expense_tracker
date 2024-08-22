import Lottie from "react-lottie-player";
import lottieJson from '../../public/LottieNotFound.json';

const NotFound = () => {
    return (
        <>
            <div className="flex flex-col justify-center items-center w-full min-h-safe-screen">
                <div className="relative w-96">
                    <Lottie
                        loop
                        animationData={lottieJson}
                        play
                    />
                    <div className="absolute bottom-10 w-full text-center">
                        <h2 className="font-semibold text-4xl text-violet-900">404 Not Found</h2>
                    </div>
                </div>
            </div>
        </>


    )
}

export default NotFound;