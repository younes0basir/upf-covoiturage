import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import Layout from '../components/Layout';
import registerBg from '../assets/register-bg.png';

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

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'MALE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useReveal(loading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(formData);
      navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError('Erreur lors de l’inscription. Vérifiez vos informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideNavbar>
      <div className="min-h-screen bg-white flex overflow-hidden">
        {/* Left Side: Visual Experience (lg only) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
          <img 
            src={registerBg} 
            alt="University Library" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-transparent"></div>
          
          <div className="relative z-10 p-20 flex flex-col justify-between w-full">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-white font-black tracking-[0.3em] text-[11px] uppercase">UPF-RIDE</span>
            </Link>

            <div className="reveal-element">
              <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                Rejoignez <br /> le futur du <br /> <span className="text-blue-500">transport.</span>
              </h1>
              <p className="text-slate-300 text-lg font-medium max-w-md leading-relaxed">
                Créez votre profil en quelques secondes et accédez à la plus grande communauté de covoiturage étudiant au Maroc.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] max-w-sm">
                <p className="text-white font-bold italic mb-4">"Le covoiturage m'a permis de rencontrer de nouveaux amis sur le campus tout en économisant sur mes trajets quotidiens."</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                    <div>
                        <p className="text-white font-black text-[10px] uppercase">Yassine B.</p>
                        <p className="text-slate-400 font-bold text-[8px] uppercase">Étudiant en Ingénierie</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Portal */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-white relative overflow-y-auto">
          <div className="max-w-md w-full py-12">
            <div className="lg:hidden mb-12 flex justify-center">
                <Link to="/" className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </Link>
            </div>

            <div className="mb-12 reveal-element">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Créer un compte.</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Rejoignez la communauté UPF-RIDE</p>
            </div>

            {error && (
              <div className="mb-10 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center gap-4 font-bold text-xs animate-shake">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 reveal-element delay-100">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold shadow-sm"
                    placeholder="Amine"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold shadow-sm"
                    placeholder="Alaoui"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Académique</label>
                <input
                  type="email"
                  required
                  className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold shadow-sm"
                  placeholder="nom.prenom@upf.ac.ma"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                  <input
                    type="password"
                    required
                    className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold shadow-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Genre</label>
                  <div className="relative">
                    <select
                      className="w-full px-6 py-5 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold appearance-none shadow-sm"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="MALE">HOMME</option>
                      <option value="FEMALE">FEMME</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-slate-200 mt-6 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Créer mon compte étudiant'}
              </button>
            </form>

            <div className="mt-12 text-center pt-8 border-t border-slate-50 reveal-element delay-200">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Déjà membre ? <br />
                <Link to="/login" className="text-slate-900 font-black hover:text-blue-600 transition-colors mt-4 inline-block border-b-2 border-slate-100">Se connecter au portail</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
