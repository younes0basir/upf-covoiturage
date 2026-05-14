import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-gray-500 leading-relaxed font-medium">{description}</p>
  </div>
);

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="relative">
        {/* Hero Section - Light & Pro */}
        <div className="relative bg-[#fcfcfd] pt-32 pb-40 overflow-hidden border-b border-gray-100">
          {/* Subtle Decorative elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-40"></div>
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 mb-10 animate-fade-in shadow-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700">Exclusivement pour l'UPF Fès</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-black text-gray-900 tracking-tighter mb-10 leading-[0.85]">
                VOTRE MOBILITÉ <br />
                <span className="text-blue-600">RE-PENSÉE.</span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-16 leading-relaxed font-medium">
                La plateforme officielle de covoiturage de l'Université Privée de Fès. 
                Une solution sûre, économique et écologique pour vos trajets quotidiens.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="bg-gray-900 text-white px-12 py-6 rounded-[2rem] text-lg font-black hover:bg-black transition shadow-2xl shadow-gray-200 transform active:scale-95 flex items-center gap-4"
                  >
                    Tableau de bord
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] text-lg font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-100 transform active:scale-95"
                    >
                      Démarrer maintenant
                    </Link>
                    <Link
                      to="/trips"
                      className="bg-white text-gray-900 border-2 border-gray-100 px-12 py-6 rounded-[2rem] text-lg font-black hover:bg-gray-50 transition transform active:scale-95"
                    >
                      Trouver un trajet
                    </Link>
                    <Link
                      to="/register"
                      className="bg-transparent text-white border-2 border-white/20 px-10 py-5 rounded-2xl text-lg font-black hover:bg-white/5 transition backdrop-blur-sm transform active:scale-95"
                    >
                      Devenir membre
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Subtle line decoration */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#0a0c10] pb-24 border-b border-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Étudiants actifs', value: '500+' },
                { label: 'Trajets quotidiens', value: '40+' },
                { label: 'Économies totales', value: '15k+ DH' },
                { label: 'Réduction CO2', value: '2t+' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-8 bg-gray-900/50 rounded-3xl border border-gray-800/50 backdrop-blur-md">
                  <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-32">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Pourquoi UPF-Ride ?</h2>
              <p className="text-4xl font-black text-gray-900 tracking-tight">Plus qu'un trajet, une communauté.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Rapidité"
                description="Réservez votre place en 3 clics et recevez une confirmation instantanée de votre conducteur."
                color="bg-blue-50"
              />
              <FeatureCard 
                icon={<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Économie"
                description="Le covoiturage est la solution la plus économique pour vous rendre à l'université au quotidien."
                color="bg-green-50"
              />
              <FeatureCard 
                icon={<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                title="Sécurité"
                description="Seuls les étudiants de l'UPF avec une carte valide peuvent utiliser la plateforme."
                color="bg-purple-50"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#fcfcfd] py-32 px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-[3.5rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-gray-100 border border-gray-100">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-10 tracking-tighter leading-none">Prêt à voyager <br /> intelligemment ?</h2>
              <p className="text-gray-500 text-xl max-w-2xl mx-auto mb-16 font-medium">Rejoignez la plus grande communauté de mobilité étudiante à Fès dès aujourd'hui.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/register" className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] text-lg font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-100 transform active:scale-95">
                  Créer mon compte gratuit
                </Link>
                <Link to="/trips" className="bg-white text-gray-900 border-2 border-gray-100 px-12 py-6 rounded-[2rem] text-lg font-black hover:bg-gray-50 transition transform active:scale-95">
                  Explorer les trajets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
