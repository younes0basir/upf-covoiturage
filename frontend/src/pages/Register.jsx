import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Layout from '../components/Layout';
import registerBg from '../assets/register-bg.png';

// --- Custom Hooks ---
const useReveal = (loading) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
        }
      });
    }, { threshold: 0.1, rootMargin: '20px' });

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);
};

// --- Reusable Components ---
const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = true,
  icon,
  error
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <input
        type={type}
        required={required}
        className={`
          w-full px-5 py-4 bg-gray-50 border rounded-xl text-gray-900 
          placeholder-gray-400 focus:bg-white focus:border-blue-500 
          focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium
          ${error ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
        `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {icon && (
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
    </div>
    {error && <p className="text-xs text-red-600 mt-1 ml-1">{error}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, required = true }) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        required={required}
        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium appearance-none"
        value={value}
        onChange={onChange}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const AlertMessage = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-green-50 border-green-100 text-green-700',
    error: 'bg-red-50 border-red-100 text-red-700',
    info: 'bg-blue-50 border-blue-100 text-blue-700'
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slide-down ${styles[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={() => setIsVisible(false)} className="opacity-50 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const TestimonialCard = ({ quote, author, title, avatarColor = 'blue' }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm">
    <p className="text-white font-medium italic mb-4 leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 bg-${avatarColor}-500 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
        {author.charAt(0)}
      </div>
      <div>
        <p className="text-white font-bold text-xs uppercase tracking-wider">{author}</p>
        <p className="text-gray-400 font-medium text-[10px] uppercase">{title}</p>
      </div>
    </div>
  </div>
);

// --- Main Component ---
const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useReveal(loading);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@upf\.ac\.ma$/.test(formData.email)) {
      newErrors.email = 'Please use a valid @upf.ac.ma email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
  };

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
    if (errors.password) setErrors({ ...errors, password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
      });
      navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors({ ...errors, [field]: '' });
    if (error) setError('');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <Layout hideNavbar hideFooter>
      <div className="min-h-screen bg-white flex">
        {/* Left Side: Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Background Image */}
          <img 
            src={registerBg} 
            alt="University Library" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-transparent"></div>
          
          {/* Content */}
          <div className="relative z-10 p-12 flex flex-col justify-between w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white font-bold tracking-[0.2em] text-[10px] uppercase">
                UPF-RIDE
              </span>
            </Link>

            {/* Hero Text */}
            <div className="reveal-element max-w-md">
              <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                Join the future <br /> of{' '}
                <span className="text-blue-400">transportation.</span>
              </h1>
              <p className="text-gray-300 text-base leading-relaxed">
                Create your profile in seconds and access the largest student 
                carpooling community in Morocco.
              </p>
            </div>

            {/* Testimonial */}
            <TestimonialCard
              quote="Carpooling has allowed me to meet new friends on campus while saving money on my daily commute."
              author="Yassine B."
              title="Engineering Student"
              avatarColor="blue"
            />
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
          <div className="max-w-md w-full py-8">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 flex justify-center">
              <Link to="/" className="bg-gray-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8 reveal-element">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                Create account
              </h2>
              <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
                Join the UPF-RIDE community
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <AlertMessage 
                type="error" 
                message={error}
                onClose={() => setError('')}
              />
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Amine"
                  error={errors.firstName}
                />
                <InputField
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Alaoui"
                  error={errors.lastName}
                />
              </div>

              {/* Email Field */}
              <InputField
                label="Academic Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="name.surname@upf.ac.ma"
                error={errors.email}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              {/* Password Fields */}
              <div className="space-y-4">
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  }
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all ${
                            level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Password strength: <span className="font-semibold">{getPasswordStrengthText()}</span>
                    </p>
                  </div>
                )}

                <InputField
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>

              {/* Gender Select */}
              <SelectField
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                ]}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-semibold uppercase tracking-wider text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create student account</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 text-center border-t border-gray-100 reveal-element">
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                Already a member?{' '}
                <Link 
                  to="/login" 
                  className="text-gray-900 font-bold hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  Sign in
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </p>
            </div>

            {/* Academic Note */}
            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-400">
                Only valid @upf.ac.ma academic email addresses are accepted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .reveal-hidden {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .delay-100 {
          transition-delay: 100ms;
        }
        
        .delay-200 {
          transition-delay: 200ms;
        }
      `}</style>
    </Layout>
  );
};

export default Register;