import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { driverService } from '../api/driverService';
import SidebarLayout from '../components/SidebarLayout';
import { Link, useNavigate } from 'react-router-dom';
import PageLoader from '../components/PageLoader';

// --- REVEAL HOOK ---
const useReveal = (loading) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          entry.target.classList.remove('reveal-hidden');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);
};

const Account = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
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

  useReveal(loading);

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
      setSuccess('Profil mis à jour !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
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

    try {
      await userService.updateMe({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Mot de passe modifié !');
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
    { id: 'back', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, path: '/dashboard' },
  ];

  if (loading) return <SidebarLayout activeTab={activeSection} setActiveTab={setActiveSection} menuItems={menuItems} title="Compte" subtitle="Profil"><PageLoader inline /></SidebarLayout>;

  return (
    <SidebarLayout activeTab={activeSection} setActiveTab={setActiveSection} menuItems={menuItems} title="Paramètres" subtitle="Mon Profil">
      <div className="max-w-4xl mx-auto pb-32">
        <div className="reveal-element">
              {success && (
                <div className="mb-10 p-6 bg-green-50 border border-green-100 text-green-600 rounded-3xl flex items-center gap-4 font-bold text-sm animate-fade-in">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="mb-10 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center gap-4 font-bold text-sm animate-shake">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </div>
              )}

              {activeSection === 'profile' && (
                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 space-y-12">
                  <section className="space-y-8">
                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                        <span className="w-8 h-px bg-blue-100 mr-4"></span> Informations Personnelles
                    </h3>
                    <form onSubmit={handleProfileSave} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Prénom</label>
                          <input
                            type="text"
                            required
                            className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Nom</label>
                          <input
                            type="text"
                            required
                            className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Email Académique</label>
                        <input
                          type="email"
                          disabled
                          className="w-full p-5 bg-slate-100 border border-transparent rounded-2xl text-slate-400 cursor-not-allowed font-bold"
                          value={user?.email || ''}
                        />
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-3 ml-1 italic italic">Non modifiable pour des raisons de sécurité.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Téléphone</label>
                          <input
                            type="tel"
                            className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                            placeholder="06 XX XX XX XX"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">N° Carte Étudiant</label>
                          <input
                            type="text"
                            className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                            placeholder="UPF-XXXXXX"
                            value={profileData.studentCardNumber}
                            onChange={(e) => setProfileData(prev => ({...prev, studentCardNumber: e.target.value}))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Genre</label>
                        <select
                          className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold appearance-none"
                          value={profileData.gender}
                          onChange={(e) => setProfileData(prev => ({...prev, gender: e.target.value}))}
                        >
                          <option value="MALE">Homme</option>
                          <option value="FEMALE">Femme</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          Inscrit le {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '...'}
                        </p>
                        <button
                          type="submit"
                          disabled={saving}
                          className={`px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition shadow-2xl ${saving ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-slate-100'}`}
                        >
                          {saving ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 space-y-12">
                  <section className="space-y-8">
                    <h3 className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.4em] flex items-center">
                        <span className="w-8 h-px bg-rose-100 mr-4"></span> Sécurité du Compte
                    </h3>
                    <form onSubmit={handlePasswordSave} className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Mot de passe actuel</label>
                        <input
                          type="password"
                          required
                          className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Nouveau mot de passe</label>
                        <input
                          type="password"
                          required
                          className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest ml-1">Confirmation</label>
                        <input
                          type="password"
                          required
                          className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                        />
                      </div>
                      <div className="pt-8 border-t border-slate-50 text-right">
                        <button
                          type="submit"
                          disabled={saving}
                          className={`px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition shadow-2xl ${saving ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-slate-100'}`}
                        >
                          {saving ? 'Modification...' : 'Modifier le mot de passe'}
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              )}

              {activeSection === 'driver' && (
                <div className="space-y-12">
                  {driverProfile ? (
                    <>
                      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 space-y-8">
                        <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                            <span className="w-8 h-px bg-blue-100 mr-4"></span> Profil Conducteur
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">N° Permis de Conduire</p>
                            <p className="font-bold text-slate-900 text-xl tracking-tight">{driverProfile.licenseNumber || '—'}</p>
                          </div>
                          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Réputation UPF</p>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 text-xl">
                                  {driverProfile.averageRating?.toFixed(1) || '0.0'}
                                </p>
                                <div className="flex text-amber-400 text-sm">
                                    {'★'.repeat(Math.round(driverProfile.averageRating || 0))}
                                    <span className="text-slate-200">{'★'.repeat(5 - Math.round(driverProfile.averageRating || 0))}</span>
                                </div>
                                <span className="text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest">({driverProfile.totalRides || 0} trajets)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {vehicles.length > 0 && (
                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 space-y-8">
                           <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                                <span className="w-8 h-px bg-blue-100 mr-4"></span> Parc Automobile
                            </h3>
                          <div className="grid grid-cols-1 gap-6">
                            {vehicles.map((v, i) => (
                              <div key={v.id || i} className="flex items-center justify-between bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                      <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-lg tracking-tight">{v.brand} {v.model}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{v.color} &bull; {v.licensePlate} &bull; {v.capacity} places</p>
                                    </div>
                                </div>
                                <div className="px-5 py-2 bg-white rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">Actif</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-24 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-slate-100">
                        <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tighter">Pas encore conducteur</h3>
                      <p className="text-slate-400 mb-12 max-w-sm mx-auto font-medium italic">Créez votre profil conducteur pour commencer à publier des trajets et partager vos frais.</p>
                      <Link
                        to="/driver/complete"
                        className="inline-block bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition shadow-2xl shadow-slate-200"
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
