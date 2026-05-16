import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverService } from '../api/driverService';
import Layout from '../components/Layout';

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

// --- Icons ---
const Icons = {
  License: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  Bio: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  Brand: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Plate: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  )
};

// --- Reusable Components ---
const StepIndicator = ({ step, currentStep }) => {
  const isActive = step <= currentStep;
  const isCurrent = step === currentStep;
  
  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isCurrent ? 'scale-110' : ''} ${!isActive ? 'opacity-40' : ''}`}>
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
        transition-all duration-500 border-2
        ${isActive 
          ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'border-gray-200 bg-white text-gray-300'
        }
      `}>
        {isActive && step < currentStep ? <Icons.Check /> : step}
      </div>
      <span className="text-xs font-semibold mt-3 uppercase tracking-wider text-gray-600">
        {step === 1 ? 'Driver Info' : 'Vehicle Details'}
      </span>
    </div>
  );
};

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required = true, icon: Icon, error }) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <Icon />
        </div>
      )}
      <input
        type={type}
        required={required}
        className={`
          w-full px-5 py-4 bg-gray-50 border rounded-xl text-gray-900 
          placeholder-gray-400 focus:bg-white focus:border-blue-500 
          focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium
          ${Icon ? 'pl-12' : 'pl-5'}
          ${error ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
        `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
    {error && <p className="text-xs text-red-600 mt-1 ml-1">{error}</p>}
  </div>
);

const FormTextArea = ({ label, value, onChange, placeholder, required = true }) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <textarea
      required={required}
      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium resize-none h-32"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, required = true }) => (
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
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const StepCard = ({ step, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xl reveal-element animate-slide-up">
    <div className="space-y-2 mb-8">
      <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
        <span className="w-8 h-px bg-blue-200" />
        Step {step}
      </h3>
      <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h4>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    {children}
  </div>
);

// --- Main Component ---
const CompleteDriverProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  const [profileData, setProfileData] = useState({
    licenseNumber: '',
    bio: ''
  });

  const [vehicleData, setVehicleData] = useState({
    brand: '',
    model: '',
    color: '',
    plateNumber: '',
    seats: 4
  });

  useReveal(loading);

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (profileData.licenseNumber.length < 5) {
      newErrors.licenseNumber = 'Please enter a valid license number';
    }
    
    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (profileData.bio.length < 20) {
      newErrors.bio = 'Please provide at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVehicle = () => {
    const newErrors = {};
    
    if (!vehicleData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!vehicleData.model.trim()) newErrors.model = 'Model is required';
    if (!vehicleData.color.trim()) newErrors.color = 'Color is required';
    if (!vehicleData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    if (vehicleData.seats < 1 || vehicleData.seats > 8) {
      newErrors.seats = 'Seats must be between 1 and 8';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    
    setLoading(true);
    try {
      await driverService.createProfile(profileData);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to create profile', err);
      alert('Failed to create driver profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!validateVehicle()) return;
    
    setLoading(true);
    try {
      await driverService.addVehicle(vehicleData);
      navigate('/trips/create');
    } catch (err) {
      console.error('Failed to add vehicle', err);
      alert('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleVehicleChange = (field, value) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const seatOptions = [
    { value: 1, label: '1 seat' },
    { value: 2, label: '2 seats' },
    { value: 3, label: '3 seats' },
    { value: 4, label: '4 seats' },
    { value: 5, label: '5 seats' },
    { value: 6, label: '6 seats' },
    { value: 7, label: '7 seats' },
    { value: 8, label: '8 seats' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 reveal-element">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
              Driver Portal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Complete Your Profile
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Fill in your details to start sharing rides with the UPF community
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-12 px-4 reveal-element">
            <StepIndicator step={1} currentStep={step} />
            <div className={`flex-1 h-px mx-4 transition-all duration-700 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <StepIndicator step={2} currentStep={step} />
          </div>

          {/* Step 1: Driver Profile */}
          {step === 1 && (
            <StepCard 
              step={1}
              title="Driver Information"
              subtitle="Tell us about yourself as a driver"
            >
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <FormInput
                  label="Driver's License Number"
                  type="text"
                  value={profileData.licenseNumber}
                  onChange={(e) => handleProfileChange('licenseNumber', e.target.value)}
                  placeholder="XX/XXXXXX"
                  icon={Icons.License}
                  error={errors.licenseNumber}
                />
                
                <FormTextArea
                  label="Bio / About You"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Share your driving preferences, experience, and what passengers can expect..."
                />
                {errors.bio && <p className="text-xs text-red-600 mt-1">{errors.bio}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <Icons.ChevronRight />
                    </>
                  )}
                </button>
              </form>
            </StepCard>
          )}

          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <StepCard 
              step={2}
              title="Vehicle Details"
              subtitle="Add your vehicle information"
            >
              <form onSubmit={handleVehicleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Brand"
                    type="text"
                    value={vehicleData.brand}
                    onChange={(e) => handleVehicleChange('brand', e.target.value)}
                    placeholder="e.g., BMW"
                    icon={Icons.Brand}
                    error={errors.brand}
                  />
                  <FormInput
                    label="Model"
                    type="text"
                    value={vehicleData.model}
                    onChange={(e) => handleVehicleChange('model', e.target.value)}
                    placeholder="e.g., Series 3"
                    error={errors.model}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Color"
                    type="text"
                    value={vehicleData.color}
                    onChange={(e) => handleVehicleChange('color', e.target.value)}
                    placeholder="e.g., Gray"
                    error={errors.color}
                  />
                  <FormSelect
                    label="Available Seats"
                    value={vehicleData.seats}
                    onChange={(e) => handleVehicleChange('seats', Number(e.target.value))}
                    options={seatOptions}
                  />
                </div>

                <FormInput
                  label="License Plate"
                  type="text"
                  value={vehicleData.plateNumber}
                  onChange={(e) => handleVehicleChange('plateNumber', e.target.value)}
                  placeholder="e.g., 12345-A-1"
                  icon={Icons.Plate}
                  error={errors.plateNumber}
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <Icons.ChevronRight />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </StepCard>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
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
      `}</style>
    </Layout>
  );
};

export default CompleteDriverProfile;