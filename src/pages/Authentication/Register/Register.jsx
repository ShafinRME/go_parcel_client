import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useLocation, useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import useAxios from '../../../hooks/useAxios';
import SocialLogin from '../SocialLogin/SocialLogin';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiUpload, FiCheck } from 'react-icons/fi';
import { AiOutlineUserAdd } from 'react-icons/ai';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { createUser, signInWithGoogle, updateUserProfile } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [profilePic, setProfilePic] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const axiosInstance = useAxios();
    const from = location.state?.from || '/';

    // On form submit
    const onSubmit = async (data) => {
        setRegisterError('');
        setIsLoading(true);

        try {
            const result = await createUser(data.email, data.password);
            console.log(result.user);

            // Update userinfo in the database
            const userInfo = {
                email: data.email,
                role: 'user',
                created_at: new Date().toISOString(),
                last_log_in: new Date().toISOString()
            };

            const userRes = await axiosInstance.post('/users', userInfo);
            console.log(userRes.data);

            // Update user profile in firebase
            const userProfile = {
                displayName: data.name,
                photoURL: profilePic || 'https://i.postimg.cc/CLLByb9g/default-avatar.png'
            };

            await updateUserProfile(userProfile);
            console.log('Profile name and pic updated');
            navigate(from);
        } catch (error) {
            console.error(error);
            setRegisterError(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const image = e.target.files[0];
        if (!image) return;

        setIsUploading(true);
        setUploadedFileName(image.name);

        try {
            const formData = new FormData();
            formData.append('image', image);

            const imageUploadUrl = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_upload_key}`;
            const res = await axios.post(imageUploadUrl, formData);

            setProfilePic(res.data.data.url);
        } catch (error) {
            console.error('Image upload failed:', error);
            setUploadedFileName('');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-base-200/5 via-white to-secondary/5'>
            <div className='w-full max-w-6xl mx-auto'>
                <div className='flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16'>

                    {/* Left Section: Form */}
                    <div className='w-full lg:w-1/2 bg-white rounded-2xl shadow-2xl p-8 lg:p-12 border border-gray-100'>
                        {/* Header */}
                        <div className='mb-8'>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center'>
                                    <AiOutlineUserAdd className='text-secondary text-2xl' />
                                </div>
                                <h1 className='text-3xl lg:text-4xl font-bold text-base-200'>
                                    Create Account
                                </h1>
                            </div>
                            <p className='text-accent text-base ml-1'>
                                Join GO Parcel and start your journey
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-base-200 mb-2">
                                    Full Name
                                </label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <FiUser className='text-gray-400 text-xl' />
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 focus:outline-none ${errors.name
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-200 focus:border-secondary'
                                            }`}
                                        placeholder="Enter your full name"
                                        {...register('name', { required: "Name is required" })}
                                    />
                                </div>
                                {errors.name && (
                                    <p className='text-red-500 text-sm mt-1.5 ml-1 flex items-center gap-1'>
                                        <span>⚠</span> {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Profile Picture Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-base-200 mb-2">
                                    Profile Picture (Optional)
                                </label>
                                <div className='relative'>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <label
                                        htmlFor="profile-upload"
                                        className='w-full flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all duration-200'
                                    >
                                        <div className='w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center'>
                                            {isUploading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>
                                            ) : profilePic ? (
                                                <FiCheck className='text-secondary text-xl' />
                                            ) : (
                                                <FiUpload className='text-secondary text-xl' />
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium text-base-200'>
                                                {isUploading ? 'Uploading...' : profilePic ? 'Image uploaded!' : 'Choose a profile picture'}
                                            </p>
                                            {uploadedFileName && (
                                                <p className='text-xs text-gray-500 truncate'>{uploadedFileName}</p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>

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
                                        placeholder="Create a strong password"
                                        {...register('password', {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters"
                                            },
                                            pattern: {
                                                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                                                message: "Include letter, number, and special character"
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

                            {/* Error Message */}
                            {registerError && (
                                <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-lg'>
                                    <p className="text-red-700 text-sm font-medium">{registerError}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || isUploading}
                                className="w-full py-4 bg-gradient-to-r from-secondary to-secondary/90 text-base-200 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <span className='flex items-center justify-center gap-2'>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-base-200"></div>
                                        Creating Account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Social Login */}
                        <SocialLogin
                            handleGoogleSignIn={signInWithGoogle}
                            from={from}
                            navigate={navigate}
                            axiosInstance={axiosInstance}
                            isRegister={true}
                        />

                        {/* Login Link */}
                        <p className='mt-8 text-center text-gray-600'>
                            Already have an account?{' '}
                            <NavLink
                                to='/login'
                                className='text-base-300 font-bold hover:text-base-200 transition-colors'
                            >
                                Sign In
                            </NavLink>
                        </p>
                    </div>

                    {/* Right Section: Image */}
                    <div className='hidden lg:block lg:w-1/2'>
                        <div className='relative'>
                            <div className='absolute -inset-4 bg-gradient-to-r from-secondary/20 to-base-300/20 rounded-3xl blur-2xl'></div>
                            <img
                                src="https://i.postimg.cc/gjmM6RDr/register.png"
                                alt="Register illustration"
                                className='relative rounded-2xl shadow-2xl w-full h-auto object-cover'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
