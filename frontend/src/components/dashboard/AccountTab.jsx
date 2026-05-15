import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../api/userService';
import { driverService } from '../../api/driverService';
import { Link } from 'react-router-dom';
import PageLoader from '../PageLoader';

const AccountTab = () => {
  const { user, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [driverProfile, setDriverProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    studentCardNumber: '',
    gender: 'MALE'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        studentCardNumber: user.studentCardNumber || '',
        gender: user.gender || 'MALE'
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const profile = await driverService.getProfile();
        setDriverProfile(profile);
        const v = await driverService.getVehicles();
        setVehicles(v);
      } catch (err) {
        // Not a driver yet
      } finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userService.updateMe(profileData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match.');
      setSaving(false);
      return;
    }

    try {
      await userService.updateMe({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Current password incorrect.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader inline />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Mini Tab Navigation */}
      <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
        {['profile', 'security', 'driver'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === section ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center gap-3 font-semibold text-sm animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          {success}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-semibold text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {activeSection === 'profile' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8 reveal-element">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] flex items-center">
            <span className="w-8 h-px bg-blue-100 mr-4"></span> Personal Information
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">Academic Email</label>
              <input
                type="email"
                disabled
                className="w-full p-4 bg-gray-100 border border-transparent rounded-xl text-gray-400 cursor-not-allowed font-semibold"
                value={user?.email || ''}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">Phone</label>
                <input
                  type="tel"
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">Student Card No.</label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                  value={profileData.studentCardNumber}
                  onChange={(e) => setProfileData(prev => ({...prev, studentCardNumber: e.target.value}))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <span className="text-xs text-gray-400">Registered on {new Date(user?.createdAt).toLocaleDateString()}</span>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3.5 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition shadow-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8 reveal-element">
          <h3 className="text-xs font-bold text-rose-600 uppercase tracking-[0.2em] flex items-center">
            <span className="w-8 h-px bg-rose-100 mr-4"></span> Account Security
          </h3>
          <form onSubmit={handlePasswordSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">Current Password</label>
              <input
                type="password"
                required
                className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">New Password</label>
              <input
                type="password"
                required
                className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest ml-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-900 transition font-semibold"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
              />
            </div>
            <div className="text-right pt-6 border-t border-gray-50">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3.5 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-700 transition shadow-lg disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSection === 'driver' && (
        <div className="space-y-6">
          {driverProfile ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8 reveal-element">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] flex items-center">
                <span className="w-8 h-px bg-blue-100 mr-4"></span> Driver Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{driverProfile.averageRating?.toFixed(1) || '0.0'} ★</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Total Rides</p>
                  <p className="text-2xl font-bold text-gray-900">{driverProfile.totalRides || 0}</p>
                </div>
              </div>
              
              {vehicles.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Vehicles</p>
                  {vehicles.map(v => (
                    <div key={v.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{v.brand} {v.model}</p>
                        <p className="text-xs text-gray-500">{v.licensePlate} • {v.color}</p>
                      </div>
                      <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-green-600 border border-green-100 uppercase">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center reveal-element">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Become a Driver</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">Start sharing your rides and earning while helping the community.</p>
              <Link to="/driver/complete" className="inline-block bg-gray-900 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition shadow-lg">
                Complete Driver Profile
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountTab;
