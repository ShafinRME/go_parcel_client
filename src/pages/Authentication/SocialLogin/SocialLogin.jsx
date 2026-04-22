import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

const SocialLogin = ({ handleGoogleSignIn, from, navigate, axiosInstance, isRegister = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const onGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await handleGoogleSignIn();
            const user = result.user;
            console.log(result.user);

            // Only create user info in database if registering
            if (isRegister && axiosInstance) {
                const userInfo = {
                    email: user.email,
                    role: 'user',
                    created_at: new Date().toISOString(),
                    last_log_in: new Date().toISOString()
                };

                const res = await axiosInstance.post('/users', userInfo);
                console.log('User info updated:', res.data);
            }

            navigate(from);
        } catch (error) {
            console.error('Google sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='mt-8'>
            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Or continue with
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Google Sign In Button */}
            <button
                onClick={onGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-base-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-base-200"></div>
                        <span>Connecting...</span>
                    </>
                ) : (
                    <>
                        <FcGoogle className='text-2xl group-hover:scale-110 transition-transform duration-200' />
                        <span>{isRegister ? 'Sign up' : 'Sign in'} with Google</span>
                    </>
                )}
            </button>

            {/* Privacy Note */}
            <p className='text-xs text-gray-500 text-center mt-4'>
                By continuing, you agree to GO Parcel's Terms of Service and Privacy Policy
            </p>
        </div>
    );
};

export default SocialLogin;
