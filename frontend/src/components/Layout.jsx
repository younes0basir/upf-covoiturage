import React, { useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';

const VerificationBanner = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.verified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerification(user.email);
      setSent(true);
    } catch (err) {
      console.error('Resend failed', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#0a0c10] border-b border-white/5 px-4 py-4 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-600/10 blur-[100px] -translate-x-1/2"></div>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 text-gray-300">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight">Vérification requise</p>
            <p className="text-xs text-gray-500 font-medium">Consultez <span className="text-blue-400">{user.email}</span> pour activer votre compte.</p>
          </div>
        </div>
        {sent ? (
          <div className="bg-green-500/10 text-green-400 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/20">
            Email renvoyé !
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-2xl shadow-blue-500/20 transform active:scale-95 disabled:opacity-50"
          >
            {sending ? 'Envoi...' : 'Renvoyer l\'email'}
          </button>
        )}
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <VerificationBanner />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-[#0a0c10] border-t border-white/5 py-20 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-white">U</div>
                    <span className="text-2xl font-black text-white tracking-tighter uppercase">UPF-RIDE</span>
                </div>
                <p className="text-gray-500 max-w-sm leading-relaxed font-medium">
                    La plateforme officielle de covoiturage de l'Université Privée de Fès. 
                    Rejoignez des milliers d'étudiants et changez votre façon de voyager.
                </p>
            </div>
            <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Plateforme</h4>
                <ul className="space-y-4 text-sm font-bold text-gray-500">
                    <li><a href="/trips" className="hover:text-white transition">Chercher un trajet</a></li>
                    <li><a href="/trips/create" className="hover:text-white transition">Publier un trajet</a></li>
                    <li><a href="/dashboard" className="hover:text-white transition">Tableau de bord</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Contact</h4>
                <ul className="space-y-4 text-sm font-bold text-gray-500">
                    <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        contact@upf-ride.ma
                    </li>
                </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                &copy; {new Date().getFullYear()} UPF-RIDE — TOUS DROITS RÉSERVÉS
            </p>
            <div className="flex items-center gap-6">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Réalisé par l'UPF</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
