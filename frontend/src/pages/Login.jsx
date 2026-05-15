import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import loginBg from '../assets/login-bg.png';

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

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  useReveal(loading);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
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
            src={loginBg} 
            alt="University Campus" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          <div className="relative z-10 p-20 flex flex-col justify-between w-full">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-white font-black tracking-[0.3em] text-[11px] uppercase">UPF-RIDE</span>
            </Link>

            <div className="reveal-element">
              <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                Connectez-vous <br /> à votre <br /> <span className="text-blue-500">mobilité.</span>
              </h1>
              <p className="text-slate-300 text-lg font-medium max-w-md leading-relaxed">
                Rejoignez le réseau de covoiturage exclusif de l'UPF. Partagez vos trajets, réduisez vos frais et participez à un campus plus durable.
              </p>
            </div>

            <div className="flex gap-10">
                <div className="flex flex-col">
                    <span className="text-white font-black text-3xl">500+</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Étudiants actifs</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-black text-3xl">2k+</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Trajets partagés</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Portal */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-white relative">
          <div className="max-w-md w-full">
            <div className="lg:hidden mb-12 flex justify-center">
                <Link to="/" className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </Link>
            </div>

            <div className="mb-12 reveal-element">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Content de vous revoir.</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Portail d'accès académique</p>
            </div>

            {verified && (
              <div className="mb-10 p-6 bg-green-50 border border-green-100 text-green-600 rounded-3xl flex items-center gap-4 font-bold text-xs animate-fade-in">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span>Email vérifié ! Vous pouvez maintenant vous connecter.</span>
              </div>
            )}

            {error && (
              <div className="mb-10 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center gap-4 font-bold text-xs animate-shake">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 reveal-element delay-100">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Académique (@upf.ac.ma)</label>
                <div className="relative group">
                    <input
                      type="email"
                      required
                      className="w-full px-7 py-6 bg-slate-50 border border-transparent rounded-[1.5rem] text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold shadow-sm"
                      placeholder="nom.prenom@upf.ac.ma"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mot de passe</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">Perdu ?</Link>
                </div>
                <div className="relative group">
                    <input
                      type="password"
                      required
                      className="w-full px-7 py-6 bg-slate-50 border border-transparent rounded-[1.5rem] text-slate-900 placeholder-slate-300 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold shadow-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <div className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-slate-200 mt-10 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Démarrer l’expérience'}
              </button>
            </form>

            <div className="mt-16 text-center pt-10 border-t border-slate-50 reveal-element delay-200">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Pas encore de compte ? <br />
                <Link to="/register" className="text-slate-900 font-black hover:text-blue-600 transition-colors mt-4 inline-block border-b-2 border-slate-100">S'inscrire à l'UPF-RIDE</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
