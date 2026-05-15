import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../api/adminService';
import AdminLayout from '../components/AdminLayout';
import { Navigate } from 'react-router-dom';
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

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group reveal-element">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">{label}</p>
        <p className="text-5xl font-bold text-slate-900 tabular-nums leading-none tracking-tighter">{value ?? '—'}</p>
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center border border-white transition-transform group-hover:scale-110 duration-500`}>
        {icon}
      </div>
    </div>
    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-50 w-fit">
      <span>Actif ce mois</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useReveal(loading);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const s = await adminService.getStats();
      setStats(s);
    } catch (err) {
      console.error('Admin: Failed to fetch stats', err);
    }

    const fetchers = [
      { name: 'users', fn: adminService.getUsers, setter: setUsers },
      { name: 'reports', fn: adminService.getReports, setter: setReports },
      { name: 'trips', fn: adminService.getTrips, setter: setTrips },
      { name: 'reservations', fn: adminService.getReservations, setter: setReservations }
    ];

    await Promise.all(fetchers.map(async ({ fn, setter }) => {
      try {
        const data = await fn();
        setter(data);
      } catch (err) {
        console.error('Admin fetch error', err);
      }
    }));

    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleVerifyUser = async (id) => {
    try {
      const updated = await adminService.verifyUser(id);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const updated = await adminService.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await adminService.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleReportStatus = async (id, status) => {
    try {
      const updated = await adminService.updateReportStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      alert('Erreur');
    }
  };
  
  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Supprimer ce trajet ?')) return;
    try {
      await adminService.deleteTrip(id);
      setTrips(prev => prev.filter(t => t.id !== id));
      setStats(prev => prev ? { ...prev, totalTrips: prev.totalTrips - 1 } : prev);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Supprimer cette réservation ?')) return;
    try {
      await adminService.deleteReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      setStats(prev => prev ? { ...prev, totalReservations: prev.totalReservations - 1 } : prev);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const reportStatusColors = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    REVIEWED: 'bg-blue-50 text-blue-600 border-blue-100',
    RESOLVED: 'bg-green-50 text-green-600 border-green-100',
    DISMISSED: 'bg-slate-50 text-slate-400 border-slate-100'
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} stats={stats}>
      {loading ? <PageLoader inline /> : (
        <div className="reveal-element space-y-12">
              {activeTab === 'overview' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                      label="Utilisateurs"
                      value={stats?.totalUsers}
                      color="bg-slate-50"
                      icon={<svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    />
                    <StatCard
                      label="Vérifiés"
                      value={stats?.verifiedUsers}
                      color="bg-slate-50"
                      icon={<svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                      label="Trajets"
                      value={stats?.totalTrips}
                      color="bg-slate-50"
                      icon={<svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
                    />
                    <StatCard
                      label="Réservations"
                      value={stats?.totalReservations}
                      color="bg-slate-50"
                      icon={<svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                    />
                    <StatCard
                      label="Signalements"
                      value={stats?.pendingReports}
                      color="bg-rose-50"
                      icon={<svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
                    />
                  </div>

                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden reveal-element">
                    <div className="p-10 border-b border-slate-50">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tighter">Derniers inscrits</h3>
                    </div>
                    <div className="p-6">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all duration-300">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {u.verified ? (
                              <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-widest">Vérifié</span>
                            ) : (
                              <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-widest">En attente</span>
                            )}
                            <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full border border-slate-100 uppercase tracking-widest">{u.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden reveal-element">
                  <div className="p-10 border-b border-slate-50">
                    <input
                      type="text"
                      placeholder="Filtrer les utilisateurs..."
                      className="w-full p-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 transition font-bold"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-left">
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Identité</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Vérification</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Privilèges</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gestion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/30 transition-all duration-300">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm leading-none mb-1">{u.firstName} {u.lastName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{u.gender === 'MALE' ? 'Étudiant' : 'Étudiante'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{u.email}</td>
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                {u.verified ? (
                                  <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-widest">Vérifié</span>
                                ) : (
                                  <button
                                    onClick={() => handleVerifyUser(u.id)}
                                    className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-widest hover:bg-amber-100 transition"
                                  >
                                    Vérifier
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleStatus(u.id)}
                                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-widest transition ${
                                    u.enabled 
                                      ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' 
                                      : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                                  }`}
                                >
                                  {u.enabled ? 'Suspendre' : 'Activer'}
                                </button>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="text-[10px] font-bold bg-slate-50 text-slate-900 rounded-lg px-3 py-1.5 border border-slate-100 outline-none uppercase tracking-widest"
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>
                            <td className="px-10 py-6">
                              {u.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors duration-300 p-2"
                                  title="Supprimer définitivement"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'trips' && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden reveal-element">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-left">
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Itinéraire</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Responsable</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Date & Heure</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {trips.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/30 transition-all duration-300">
                            <td className="px-10 py-6">
                              <p className="text-sm font-bold text-slate-900 mb-1">{t.departureLocation.city} &rarr; {t.destinationLocation.city}</p>
                              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{t.totalPrice} DH • {t.availableSeats} places</p>
                            </td>
                            <td className="px-10 py-6">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t.driver.firstName} {t.driver.lastName}</p>
                            </td>
                            <td className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(t.departureTime).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-10 py-6">
                              <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-widest ${
                                t.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                t.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-10 py-6">
                              <button
                                onClick={() => handleDeleteTrip(t.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors duration-300 p-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reservations' && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden reveal-element">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-left">
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Bénéficiaire</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Détails Trajet</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Volume</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Statut</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reservations.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/30 transition-all duration-300">
                            <td className="px-10 py-6 text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                              {r.passenger.firstName} {r.passenger.lastName}
                            </td>
                            <td className="px-10 py-6">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{r.trip.departureLocation.city} &rarr; {r.trip.destinationLocation.city}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(r.trip.departureTime).toLocaleDateString()}</p>
                            </td>
                            <td className="px-10 py-6 text-[11px] font-bold text-slate-500">{r.seatsReserved} pers.</td>
                            <td className="px-10 py-6">
                              <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-widest ${
                                r.status === 'CONFIRMED' || r.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border-green-100' : 
                                r.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-10 py-6">
                              <button
                                onClick={() => handleDeleteReservation(r.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors duration-300 p-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6 reveal-element">
                  {reports.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-24 text-center">
                      <p className="text-slate-300 italic font-medium">Aucun signalement actif dans le système.</p>
                    </div>
                  ) : (
                    reports.map(r => (
                      <div key={r.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                              <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-widest ${reportStatusColors[r.status] || 'bg-slate-50 text-slate-400'}`}>
                                {r.status}
                              </span>
                              <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                {r.type}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-slate-700 mb-8 font-medium leading-relaxed">{r.description}</p>
                            <div className="flex flex-wrap gap-10 text-[10px] font-bold uppercase tracking-[0.2em]">
                              <span>
                                <span className="text-slate-400">Plaignant :</span> <span className="text-slate-900 ml-2">{r.reporter?.firstName} {r.reporter?.lastName}</span>
                              </span>
                              <span>
                                <span className="text-slate-400">Accusé :</span> <span className="text-slate-900 ml-2">{r.reported?.firstName} {r.reported?.lastName}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3 shrink-0">
                            {r.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleReportStatus(r.id, 'RESOLVED')}
                                  className="px-6 py-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-100"
                                >
                                  Résoudre
                                </button>
                                <button
                                  onClick={() => handleReportStatus(r.id, 'DISMISSED')}
                                  className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-slate-50 transition"
                                >
                                  Classer
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
