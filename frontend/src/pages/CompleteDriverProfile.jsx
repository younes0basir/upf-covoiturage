import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverService } from '../api/driverService';
import Layout from '../components/Layout';

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await driverService.createProfile(profileData);
      setStep(2);
    } catch (err) {
      alert("Erreur lors de la création du profil");
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
      alert("Erreur lors de l'ajout du véhicule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0c10] py-24 px-4 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">Espace Conducteur</h1>
            <p className="text-gray-500 font-medium italic">Complétez ces deux étapes pour commencer à covoiturer.</p>
          </div>

          {/* Stepper Header */}
          <div className="flex items-center justify-between mb-12 px-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-500' : 'text-gray-600'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 transition-all duration-500 ${step >= 1 ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5'}`}>1</div>
              <span className="text-[10px] font-black mt-3 uppercase tracking-[0.2em]">Profil</span>
            </div>
            <div className={`flex-grow h-1 mx-6 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-500' : 'bg-white/5'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-500' : 'text-gray-600'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 transition-all duration-500 ${step >= 2 ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5'}`}>2</div>
              <span className="text-[10px] font-black mt-3 uppercase tracking-[0.2em]">Véhicule</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
            {step === 1 ? (
              <div className="animate-fade-in">
                <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wider">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Informations de conduite
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Numéro de Permis</label>
                    <input 
                      type="text"
                      required
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition font-medium"
                      placeholder="Ex: 00/000000"
                      value={profileData.licenseNumber}
                      onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Biographie (Optionnel)</label>
                    <textarea 
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition h-32 font-medium"
                      placeholder="Dites aux passagers pourquoi ils devraient voyager avec vous..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-500/20 transform active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'CONTINUER VERS LE VÉHICULE'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wider">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                  Détails du véhicule
                </h2>
                <form onSubmit={handleVehicleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Marque</label>
                      <input 
                        type="text" required
                        className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition font-medium"
                        placeholder="Ex: Dacia"
                        value={vehicleData.brand}
                        onChange={(e) => setVehicleData({...vehicleData, brand: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Modèle</label>
                      <input 
                        type="text" required
                        className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition font-medium"
                        placeholder="Ex: Logan"
                        value={vehicleData.model}
                        onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Couleur</label>
                      <input 
                        type="text" required
                        className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition font-medium"
                        placeholder="Ex: Blanc"
                        value={vehicleData.color}
                        onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Places totales</label>
                      <input 
                        type="number" min="1" max="8" required
                        className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition font-medium"
                        value={vehicleData.seats}
                        onChange={(e) => setVehicleData({...vehicleData, seats: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Plaque d'immatriculation</label>
                    <input 
                      type="text" required
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-blue-500 outline-none transition font-medium"
                      placeholder="Ex: 12345-A-1"
                      value={vehicleData.plateNumber}
                      onChange={(e) => setVehicleData({...vehicleData, plateNumber: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-500/20 transform active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'TERMINER L\'INSCRIPTION'}
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
