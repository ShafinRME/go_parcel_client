import React from 'react';

const Loader = () => {
    return (
        <div className='flex justify-center items-center min-h-screen bg-[#EAECED] font-urbanist'>
            <div className='relative flex flex-col items-center gap-6'>
                {/* Animated delivery truck */}
                <div className='relative w-32 h-32'>
                    {/* Main truck container with bounce animation */}
                    <div className='truck-container'>
                        <svg viewBox="0 0 120 80" className='w-full h-full'>
                            {/* Truck body */}
                            <rect x="20" y="30" width="50" height="30" fill="#018790" rx="3"/>
                            {/* Truck cargo */}
                            <rect x="70" y="20" width="35" height="40" fill="#001F3D" rx="3"/>
                            {/* Truck cabin window */}
                            <rect x="25" y="35" width="15" height="12" fill="#CAEB66" rx="2"/>
                            {/* Package in cargo */}
                            <rect x="77" y="28" width="20" height="15" fill="#CAEB66" rx="2"/>
                            <line x1="87" y1="28" x2="87" y2="43" stroke="#018790" strokeWidth="2"/>
                            <line x1="77" y1="35.5" x2="97" y2="35.5" stroke="#018790" strokeWidth="2"/>
                            {/* Wheels */}
                            <circle cx="35" cy="62" r="8" fill="#706f6f" className='wheel-front'/>
                            <circle cx="35" cy="62" r="4" fill="#E6E6E6"/>
                            <circle cx="90" cy="62" r="8" fill="#706f6f" className='wheel-back'/>
                            <circle cx="90" cy="62" r="4" fill="#E6E6E6"/>
                        </svg>
                    </div>
                    
                    {/* Road line animation */}
                    <div className='road-lines'>
                        <div className='road-line'></div>
                        <div className='road-line'></div>
                        <div className='road-line'></div>
                    </div>
                </div>

                {/* Loading text with dots animation */}
                <div className='flex flex-col items-center gap-3'>
                    <h2 className='text-2xl font-semibold text-[#001F3D]'>
                        Preparing Your Delivery
                        <span className='loading-dots'>
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                        </span>
                    </h2>
                    
                    {/* Progress bar */}
                    <div className='w-64 h-2 bg-[#E6E6E6] rounded-full overflow-hidden'>
                        <div className='progress-bar h-full bg-gradient-to-r from-[#018790] to-[#CAEB66] rounded-full'></div>
                    </div>
                </div>

                {/* Floating packages animation */}
                <div className='floating-packages'>
                    <div className='package package-1'>📦</div>
                    <div className='package package-2'>📦</div>
                    <div className='package package-3'>📦</div>
                </div>
            </div>

            <style jsx>{`
                @keyframes truck-bounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes wheel-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes road-move {
                    from { transform: translateX(0); }
                    to { transform: translateX(-60px); }
                }

                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }

                @keyframes dot-pulse {
                    0%, 20% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    50% { 
                        transform: translateY(-100px) rotate(180deg);
                        opacity: 1;
                    }
                    90% { opacity: 0.5; }
                    100% { 
                        transform: translateY(-200px) rotate(360deg);
                        opacity: 0;
                    }
                }

                .truck-container {
                    animation: truck-bounce 2s ease-in-out infinite;
                }

                .wheel-front, .wheel-back {
                    transform-origin: center;
                    animation: wheel-spin 1s linear infinite;
                }

                .road-lines {
                    position: absolute;
                    bottom: -20px;
                    left: -40px;
                    right: -40px;
                    height: 4px;
                    display: flex;
                    gap: 20px;
                    overflow: hidden;
                }

                .road-line {
                    width: 40px;
                    height: 4px;
                    background-color: #706f6f;
                    border-radius: 2px;
                    animation: road-move 1s linear infinite;
                }

                .road-line:nth-child(2) {
                    animation-delay: 0.33s;
                }

                .road-line:nth-child(3) {
                    animation-delay: 0.66s;
                }

                .progress-bar {
                    animation: progress 2.5s ease-in-out infinite;
                }

                .loading-dots span {
                    animation: dot-pulse 1.5s infinite;
                }

                .loading-dots span:nth-child(1) {
                    animation-delay: 0s;
                }

                .loading-dots span:nth-child(2) {
                    animation-delay: 0.3s;
                }

                .loading-dots span:nth-child(3) {
                    animation-delay: 0.6s;
                }

                .floating-packages {
                    position: absolute;
                    top: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200px;
                    height: 300px;
                    pointer-events: none;
                }

                .package {
                    position: absolute;
                    font-size: 24px;
                    animation: float 4s ease-in infinite;
                }

                .package-1 {
                    left: 20%;
                    animation-delay: 0s;
                }

                .package-2 {
                    left: 50%;
                    animation-delay: 1.3s;
                }

                .package-3 {
                    left: 80%;
                    animation-delay: 2.6s;
                }
            `}</style>
        </div>
    );
};

export default Loader;
