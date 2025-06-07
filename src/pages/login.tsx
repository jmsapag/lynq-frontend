import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToast } from '@heroui/react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;
        if (!formData.email) {
            newErrors.email = 'Please enter your email';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Is that a valid email?';
            isValid = false;
        }
        if (!formData.password) {
            newErrors.password = 'Did you forget your password?';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'At least 6 characters';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            addToast({
                title: "Welcome!",
                description: "Login successful",
                severity: "success",
                color: "success"
            });
            navigate('/dashboard');
        } catch (error) {
            addToast({
                title: "Error",
                description: "Could not log in. Please try again.",
                severity: "danger",
                color: "danger"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white relative overflow-hidden">
            <div className="absolute top-20 -left-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 -right-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#00A5B1]/5 rounded-full blur-2xl"></div>

            <div className="w-full md:w-1/2 flex justify-center items-center">
                <div className="z-10 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto rounded-xl border-0 sm:border-0 border-[#00A5B1]/15 p-6 sm:p-8 flex flex-col items-center bg-white">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center tracking-tight">Welcome back!</h1>
                    <p className="text-gray-500 mb-8 text-center text-base sm:text-lg">Login to continue exploring your metrics.</p>
                    <form className="w-full space-y-6" onSubmit={handleSubmit} autoComplete="off">
                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`block w-full px-4 py-3 bg-white border-b-2 ${
                                    errors.email ? 'border-red-400' : 'border-gray-500'
                                } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
                                placeholder="Email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`block w-full px-4 py-3 bg-white border-b-2 ${
                                    errors.password ? 'border-red-400' : 'border-gray-500'
                                } text-base rounded-t-md focus:outline-none focus:border-black transition placeholder-gray-400`}
                                placeholder="Password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-black border-gray-300 rounded focus:ring-black"
                                />
                                <span className="ml-2">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-[#00A5B1] hover:underline transition">Forgot?</a>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl text-base font-semibold text-white bg-black transition-all
                  hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                  active:scale-95 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Log in'
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-gray-400 text-sm">
                        No account? <a href="#" className="text-[#00A5B1] hover:underline">Contact us</a>
                    </div>
                </div>
            </div>

            <div className="hidden md:block w-1/2 min-h-screen relative bg-gradient-to-br from-[#f0f9fa] to-[#e6f5f7] overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#00A5B1]/20 to-transparent blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-[#7fdddf]/25 to-transparent blur-3xl opacity-70"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-[#00c2d1]/20 to-transparent blur-3xl opacity-80"></div>
                <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-radial from-[#97e3e9]/30 to-transparent blur-2xl"></div>
                <div className="absolute top-2/3 right-1/6 w-60 h-60 rounded-full bg-gradient-radial from-[#b5edf1]/25 to-transparent blur-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20"></div>
            </div>
        </div>
    );
};

export default LoginPage;