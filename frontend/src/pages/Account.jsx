import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { driverService } from '../api/driverService';
import SidebarLayout from '../components/SidebarLayout';
import { Link, useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [driverProfile, setDriverProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);

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
      setSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
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
      setError('Les mots de passe ne correspondent pas.');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setSaving(false);
      return;
    }

    try {
      await userService.updateMe({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Mot de passe modifié avec succès !');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Mot de passe actuel incorrect.');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profil Personnel', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'security', label: 'Sécurité', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: 'driver', label: 'Espace Conducteur', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    { id: 'back', label: 'Retour au Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, path: '/dashboard' },
  ];

  return (
    <SidebarLayout activeTab={activeSection} setActiveTab={setActiveSection} menuItems={menuItems} title="Paramètres du compte" subtitle="Mon Profil">
      <div className="max-w-4xl mx-auto">
        {/* Content */}
        <div className="flex-1">
              {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium mb-6 border border-green-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}

              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Informations Personnelles</h2>
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
                        <input
                          type="text"
                          required
                          className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                        <input
                          type="text"
                          required
                          className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        disabled
                        className="w-full p-4 bg-gray-100 border-0 rounded-2xl text-gray-500 cursor-not-allowed"
                        value={user?.email || ''}
                      />
                      <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                        <input
                          type="tel"
                          className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                          placeholder="06 XX XX XX XX"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">N° Carte Étudiant</label>
                        <input
                          type="text"
                          className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                          placeholder="UPF-XXXXXX"
                          value={profileData.studentCardNumber}
                          onChange={(e) => setProfileData(prev => ({...prev, studentCardNumber: e.target.value}))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Genre</label>
                      <select
                        className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={profileData.gender}
                        onChange={(e) => setProfileData(prev => ({...prev, gender: e.target.value}))}
                      >
                        <option value="MALE">Homme</option>
                        <option value="FEMALE">Femme</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                      </p>
                      <button
                        type="submit"
                        disabled={saving}
                        className={`bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Changer le Mot de Passe</h2>
                  <form onSubmit={handlePasswordSave} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe actuel</label>
                      <input
                        type="password"
                        required
                        className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-100 text-right">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {saving ? 'Modification...' : 'Modifier le mot de passe'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Driver Section */}
              {activeSection === 'driver' && (
                <div className="space-y-6">
                  {driverProfile ? (
                    <>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Profil Conducteur</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">N° Permis</p>
                            <p className="font-bold text-gray-900">{driverProfile.licenseNumber || 'Non renseigné'}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Note moyenne</p>
                            <p className="font-bold text-gray-900">
                              {'★'.repeat(Math.round(driverProfile.averageRating || 0))}
                              {'☆'.repeat(5 - Math.round(driverProfile.averageRating || 0))}
                              <span className="text-gray-500 ml-2 text-sm">({driverProfile.totalRides || 0} trajets)</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {vehicles.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                          <h2 className="text-xl font-black text-gray-900 mb-6">Mes Véhicules</h2>
                          <div className="space-y-4">
                            {vehicles.map((v, i) => (
                              <div key={v.id || i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{v.brand} {v.model}</p>
                                  <p className="text-sm text-gray-500">{v.color} &bull; {v.licensePlate} &bull; {v.capacity} places</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Pas encore conducteur</h3>
                      <p className="text-gray-500 mb-6">Créez votre profil conducteur pour publier des trajets.</p>
                      <Link
                        to="/driver/complete"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                      >
                        Devenir conducteur
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
    </SidebarLayout>
  );
};

export default Account;
