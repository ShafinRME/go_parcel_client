import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useLocation, useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import SocialLogin from '../SocialLogin/SocialLogin';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { AiOutlineLogin } from 'react-icons/ai';

const Login = () => {
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signInWithGoogle, signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    // On form submit
    const onSubmit = data => {
        setLoginError('');
        const { email, password } = data;
        signIn(email, password)
            .then(result => {
                console.log(result.user);
                navigate(from);
            })
            .catch(error => {
                console.error(error);
                setLoginError("Invalid email or password. Please try again.");
            });
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-base-200/5 via-white to-secondary/5'>
            <div className='w-full max-w-6xl mx-auto'>
                <div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-16'>

                    {/* Left Section: Form */}
                    <div className='w-full lg:w-1/2 bg-white rounded-2xl shadow-2xl p-8 lg:p-12 border border-gray-100'>
                        {/* Header */}
                        <div className='mb-8'>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center'>
                                    <AiOutlineLogin className='text-secondary text-2xl' />
                                </div>
                                <h1 className='text-3xl lg:text-4xl font-bold text-base-200'>
                                    Welcome Back
                                </h1>
                            </div>
                            <p className='text-accent text-base ml-1'>
                                Sign in to continue to GO Parcel
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-base-200 mb-2">
                                    Email Address
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <FiMail className='text-gray-400 text-xl' />
                                    </div>
                                    <input
                                        type="email"
                                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 focus:outline-none ${errors.email
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-200 focus:border-secondary'
                                            }`}
                                        placeholder="Enter your email"
                                        {...register('email', {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                                message: "Enter a valid email address"
                                            }
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className='text-red-500 text-sm mt-1.5 ml-1 flex items-center gap-1'>
                                        <span>⚠</span> {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-base-200 mb-2">
                                    Password
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <FiLock className='text-gray-400 text-xl' />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all duration-200 focus:outline-none ${errors.password
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-200 focus:border-secondary'
                                            }`}
                                        placeholder="Enter your password"
                                        {...register('password', {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters"
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-base-200 transition-colors'
                                    >
                                        {showPassword ? <FiEyeOff className='text-xl' /> : <FiEye className='text-xl' />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className='text-red-500 text-sm mt-1.5 ml-1 flex items-center gap-1'>
                                        <span>⚠</span> {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password */}
                            <div className='flex justify-end'>
                                <a href="#" className="text-sm font-semibold text-base-300 hover:text-base-200 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Error Message */}
                            {loginError && (
                                <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-lg'>
                                    <p className="text-red-700 text-sm font-medium">{loginError}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-secondary to-secondary/90 text-base-200 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                            >
                                Sign In
                            </button>
                        </form>

                        {/* Social Login */}
                        <SocialLogin
                            handleGoogleSignIn={signInWithGoogle}
                            from={from}
                            navigate={navigate}
                        />

                        {/* Register Link */}
                        <p className='mt-8 text-center text-gray-600'>
                            Don't have an account?{' '}
                            <NavLink
                                state={{ from }}
                                to='/register'
                                className='text-base-300 font-bold hover:text-base-200 transition-colors'
                            >
                                Create Account
                            </NavLink>
                        </p>
                    </div>

                    {/* Right Section: Image */}
                    <div className='hidden lg:block lg:w-1/2'>
                        <div className='relative'>
                            <div className='absolute -inset-4 bg-gradient-to-r from-secondary/20 to-base-300/20 rounded-3xl blur-2xl'></div>
                            <img
                                src="https://i.postimg.cc/503BTrBW/login.webp"
                                alt="Login illustration"
                                className='relative rounded-2xl shadow-2xl w-full h-auto object-cover'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
