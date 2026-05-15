import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverService } from '../api/driverService';
import Layout from '../components/Layout';

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

const CompleteDriverProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Profile, 2: Vehicle
  
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await driverService.createProfile(profileData);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await driverService.addVehicle(vehicleData);
      navigate('/trips/create');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-32 px-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 -z-0"></div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-16 reveal-element">
            <h1 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.5em] mb-4">Portail Conducteur</h1>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Activation du Profil</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Complétez ces deux étapes pour commencer à partager vos trajets.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-16 px-12 reveal-element">
            <div className={`flex flex-col items-center transition-all duration-500 ${step >= 1 ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black border-2 transition-all duration-500 ${step >= 1 ? 'border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-200' : 'border-slate-200 bg-white text-slate-300'}`}>1</div>
              <span className="text-[9px] font-black mt-4 uppercase tracking-[0.3em] text-slate-900">Accréditation</span>
            </div>
            <div className={`flex-grow h-px mx-8 transition-all duration-700 ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
            <div className={`flex flex-col items-center transition-all duration-500 ${step >= 2 ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black border-2 transition-all duration-500 ${step >= 2 ? 'border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-200' : 'border-slate-200 bg-white text-slate-300'}`}>2</div>
              <span className="text-[9px] font-black mt-4 uppercase tracking-[0.3em] text-slate-900">Véhicule</span>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl shadow-slate-100 reveal-element">
            {step === 1 ? (
              <div className="animate-fade-in space-y-10">
                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                        <span className="w-8 h-px bg-blue-100 mr-4"></span> Etape 01
                    </h3>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Informations de Conduite</h4>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Numéro de Permis de Conduire</label>
                    <input 
                      type="text"
                      required
                      className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition font-bold"
                      placeholder="Format: XX/XXXXXX"
                      value={profileData.licenseNumber}
                      onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Biographie du Conducteur</label>
                    <textarea 
                      className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition h-40 font-bold resize-none"
                      placeholder="Partagez vos préférences de conduite avec vos futurs passagers..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-slate-200 mt-4 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : 'Valider & Continuer'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in space-y-10">
                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em] flex items-center">
                        <span className="w-8 h-px bg-blue-100 mr-4"></span> Etape 02
                    </h3>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Détails du Véhicule</h4>
                </div>

                <form onSubmit={handleVehicleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marque</label>
                      <input 
                        type="text" required
                        className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition font-bold"
                        placeholder="Ex: BMW"
                        value={vehicleData.brand}
                        onChange={(e) => setVehicleData({...vehicleData, brand: e.target.value})}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modèle</label>
                      <input 
                        type="text" required
                        className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition font-bold"
                        placeholder="Ex: Série 3"
                        value={vehicleData.model}
                        onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Couleur</label>
                      <input 
                        type="text" required
                        className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition font-bold"
                        placeholder="Ex: Gris Nardo"
                        value={vehicleData.color}
                        onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Places Disponibles</label>
                      <input 
                        type="number" min="1" max="8" required
                        className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition font-bold"
                        value={vehicleData.seats}
                        onChange={(e) => setVehicleData({...vehicleData, seats: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Immatriculation</label>
                    <input 
                      type="text" required
                      className="w-full p-6 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition font-bold"
                      placeholder="Ex: 12345-A-1"
                      value={vehicleData.plateNumber}
                      onChange={(e) => setVehicleData({...vehicleData, plateNumber: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-slate-200 mt-4 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : 'Finaliser l\'Inscription'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CompleteDriverProfile;
