import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Code incomplet.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.verifyEmail(email, fullCode);
      setSuccess(true);
      await refreshUser();
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect. Veuillez réessayer.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await authService.resendVerification(email);
      setResent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi.');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-2xl shadow-slate-100 animate-fade-in">
            <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-green-100">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[10px] font-bold text-green-600 uppercase tracking-[0.5em] mb-4">Succès</h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Compte Vérifié</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Redirection vers votre dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-md w-full relative z-10 animate-fade-in">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-200 border border-white/10">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.5em] mb-4">Sécurité</h1>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Vérification</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
              Un code a été envoyé à :<br />
              <span className="text-slate-900 font-black tracking-normal lowercase opacity-80">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl shadow-slate-100">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-10 border border-rose-100 text-center animate-shake">
                {error}
              </div>
            )}

            {resent && (
              <div className="bg-green-50 text-green-600 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-10 border border-green-100 text-center animate-fade-in">
                Nouveau code envoyé !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="flex justify-center gap-4" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-20 text-center text-3xl font-black bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition shadow-sm"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.join('').length !== 6}
                className="w-full py-6 rounded-2xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition shadow-2xl shadow-slate-200 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : 'Vérifier le compte'}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Code non reçu ? <br />
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-blue-600 font-black uppercase tracking-widest hover:text-blue-700 mt-4 inline-block disabled:opacity-30 border-b-2 border-blue-50"
                >
                  {resending ? 'Envoi...' : 'Renvoyer le code'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
