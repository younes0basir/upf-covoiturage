import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    <Layout>
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center py-24 px-6 relative overflow-hidden">
        {/* Subtle decorative backgrounds */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-40"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-12">
            <Link to="/" className="inline-block mb-10 group">
                <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-100 group-hover:scale-110 transition-transform mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
            </Link>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">BON RETOUR.</h2>
            <p className="text-gray-500 font-medium text-lg uppercase tracking-widest text-[11px] font-black">Accès Étudiant UPF</p>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            {verified && (
              <div className="bg-green-50 text-green-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-green-100 flex items-center gap-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span>Email vérifié avec succès !</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-red-100 flex items-center gap-4 animate-shake">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Email Universitaire</label>
                <input
                  type="email"
                  required
                  className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold"
                  placeholder="nom.prenom@upf.ac.ma"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Mot de passe</label>
                    <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Oublié ?</Link>
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-[2rem] bg-blue-600 text-white font-black text-xl hover:bg-blue-700 transition shadow-2xl shadow-blue-100 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-10"
              >
                {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'CONNEXION'}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-[10px]">
                Nouveau sur la plateforme ? <br />
                <Link to="/register" className="text-blue-600 font-black uppercase tracking-widest hover:text-blue-700 mt-3 inline-block border-b-2 border-blue-100 pb-1">Créer mon compte gratuitement</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
