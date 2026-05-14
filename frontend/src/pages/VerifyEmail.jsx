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
      setError('Veuillez saisir le code complet à 6 chiffres.');
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
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center py-20 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-12 text-center relative z-10 shadow-2xl">
            <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">EMAIL VÉRIFIÉ !</h2>
            <p className="text-gray-500 font-medium italic">Redirection vers votre espace personnel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">VÉRIFICATION</h2>
            <p className="text-gray-500 font-medium italic">
              Un code à 6 chiffres a été envoyé à<br />
              <span className="text-blue-500 font-black tracking-widest">{email}</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 border border-red-500/20 text-center">
                {error}
              </div>
            )}

            {resent && (
              <div className="bg-green-500/10 text-green-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 border border-green-500/20 text-center">
                Nouveau code envoyé !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
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
                    className="w-12 h-16 text-center text-2xl font-black bg-white/5 border-2 border-white/10 rounded-2xl text-white focus:border-blue-500 outline-none transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.join('').length !== 6}
                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-700 transition shadow-2xl shadow-blue-500/20 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'VÉRIFIER'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm font-medium">
                Vous n'avez pas reçu le code ? <br />
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-blue-500 font-black uppercase tracking-widest hover:text-blue-400 mt-2 inline-block disabled:opacity-50"
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
