// frontend/src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from 'react-icons/fa';
import { inputBase, iconClass } from '../../assets/dummydata';

const Login = ({ onLoginSuccess, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', isError: false });

  useEffect(() => {
    const stored = localStorage.getItem('loginData');
    if (stored) setFormData(JSON.parse(stored));
  }, []);

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const handleChange = ({ target: { name, value, type, checked } }) =>
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await apiClient.post('/api/user/login', {
        email: formData.email,
        password: formData.password,
      });

      if (res.status === 200 && res.data.success && res.data.token) {
        // Use the new auth context
        login(res.data.token, res.data.role);

        // Remember-me for the form
        formData.rememberMe
          ? localStorage.setItem('loginData', JSON.stringify(formData))
          : localStorage.removeItem('loginData');

        setToast({ visible: true, message: 'Login successful!', isError: false });

        // Navigate based on role
        setTimeout(() => {
          if (res.data.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
            onClose && onClose();
          }
        }, 1500);

        onLoginSuccess && onLoginSuccess(res.data.token);
      } else {
        throw new Error(res.data.message || 'Login failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setToast({ visible: true, message: msg, isError: true });
      setTimeout(() => setToast({ visible: false, message: '', isError: false }), 2000);
    }
  };
    
    

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <div
        className={`fixed top-4 right-4 z-50 transition-all duration-300 ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
          }`}
      >
        <div
          className={`px-4 py-3 rounded-md shadow-lg flex items-center gap-2 text-sm ${toast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}
        >
          <FaCheckCircle className="flex-shrink-0" />
          <span>{toast.message}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="relative">
          <FaEnvelope className={iconClass} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`${inputBase} pl-10 pr-4 py-3`}
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <FaLock className={iconClass} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`${inputBase} pl-10 pr-10 py-3`}
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-amber-600 bg-[#2D1B0E] border-amber-400 rounded focus:ring-amber-600"
            />
            <span className="ml-2 text-amber-100">Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-[#2D1B0E] font-bold rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          Sign In <FaArrowRight />
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center">
        <Link
          to="/signup"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-600 transition-colors"
        >
          <FaUserPlus /> Create New Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
