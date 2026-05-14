import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../api/adminService';
import AdminLayout from '../components/AdminLayout';

console.log('AdminDashboard: adminService defined:', !!adminService);
import { Navigate } from 'react-router-dom';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-4xl font-black text-gray-900 tabular-nums leading-none">{value ?? '—'}</p>
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-green-600">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      <span>En croissance</span>
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

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  const fetchData = async () => {
    setLoading(true);
    console.log('Admin: Fetching all data...');
    
    // Fetch stats first as they are critical
    try {
      const s = await adminService.getStats();
      setStats(s);
    } catch (err) {
      console.error('Admin: Failed to fetch stats', err);
    }

    // Fetch other data in parallel but handle errors individually
    const fetchers = [
      { name: 'users', fn: adminService.getUsers, setter: setUsers },
      { name: 'reports', fn: adminService.getReports, setter: setReports },
      { name: 'trips', fn: adminService.getTrips, setter: setTrips },
      { name: 'reservations', fn: adminService.getReservations, setter: setReservations }
    ];

    await Promise.all(fetchers.map(async ({ name, fn, setter }) => {
      try {
        const data = await fn();
        setter(data);
        console.log(`Admin: Fetched ${name} (${data.length} items)`);
      } catch (err) {
        console.error(`Admin: Failed to fetch ${name}`, err);
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
    if (!window.confirm('Supprimer ce trajet et toutes ses réservations ?')) return;
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
    PENDING: 'bg-yellow-100 text-yellow-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
    DISMISSED: 'bg-gray-100 text-gray-600'
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} stats={stats}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin mb-6"></div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Initialisation du Dashboard...</p>
        </div>
      ) : (
        <>
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                      label="Utilisateurs"
                      value={stats?.totalUsers}
                      color="bg-blue-100"
                      icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    />
                    <StatCard
                      label="Vérifiés"
                      value={stats?.verifiedUsers}
                      color="bg-green-100"
                      icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                      label="Trajets"
                      value={stats?.totalTrips}
                      color="bg-purple-100"
                      icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
                    />
                    <StatCard
                      label="Réservations"
                      value={stats?.totalReservations}
                      color="bg-orange-100"
                      icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                    />
                    <StatCard
                      label="Signalements"
                      value={stats?.pendingReports}
                      color="bg-red-100"
                      icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
                    />
                  </div>

                  {/* Recent users */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Derniers inscrits</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {u.verified ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Vérifié</span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg">Non vérifié</span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">{u.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-gray-300 transition text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Rôle</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-gray-400">{u.gender === 'MALE' ? 'Homme' : 'Femme'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-6 py-4">
                              {u.verified ? (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Vérifié</span>
                              ) : (
                                <button
                                  onClick={() => handleVerifyUser(u.id)}
                                  className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-200 transition"
                                >
                                  Vérifier
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleStatus(u.id)}
                                className={`ml-2 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                  u.enabled 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                              >
                                {u.enabled ? 'Suspendre' : 'Activer'}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="text-xs font-bold bg-gray-100 rounded-lg px-2 py-1 border-0 outline-none"
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              {u.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-500 hover:text-red-700 transition"
                                  title="Supprimer"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <p className="text-center py-8 text-gray-400 text-sm">Aucun utilisateur trouvé.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Trips Tab */}
              {activeTab === 'trips' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Trajet</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Conducteur</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {trips.map(t => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-900">{t.departureLocation.city} &rarr; {t.destinationLocation.city}</p>
                              <p className="text-xs text-gray-500">{t.totalPrice} DH - {t.availableSeats} places</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{t.driver.firstName} {t.driver.lastName}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(t.departureTime).toLocaleString('fr-FR')}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                t.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : 
                                t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteTrip(t.id)}
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === 'reservations' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Passager</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Trajet</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Places</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {reservations.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                              {r.passenger.firstName} {r.passenger.lastName}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-gray-600">{r.trip.departureLocation.city} &rarr; {r.trip.destinationLocation.city}</p>
                              <p className="text-[10px] text-gray-400">{new Date(r.trip.departureTime).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{r.seatsReserved}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                                r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteReservation(r.id)}
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                      <p className="text-gray-400">Aucun signalement.</p>
                    </div>
                  ) : (
                    reports.map(r => (
                      <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${reportStatusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                                {r.status}
                              </span>
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">
                                {r.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{r.description}</p>
                            <div className="flex gap-6 text-xs text-gray-500">
                              <span>
                                <span className="font-bold text-gray-700">Signalé par :</span> {r.reporter?.firstName} {r.reporter?.lastName}
                              </span>
                              <span>
                                <span className="font-bold text-gray-700">Signalé :</span> {r.reported?.firstName} {r.reported?.lastName}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {r.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleReportStatus(r.id, 'RESOLVED')}
                                  className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition"
                                >
                                  Résolu
                                </button>
                                <button
                                  onClick={() => handleReportStatus(r.id, 'DISMISSED')}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition"
                                >
                                  Rejeter
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
            </>
          )}
    </AdminLayout>
  );
};

export default AdminDashboard;
