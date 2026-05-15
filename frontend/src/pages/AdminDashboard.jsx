import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import adminService from '../api/adminService';
import AdminLayout from '../components/AdminLayout';
import PageLoader from '../components/PageLoader';

// --- Modular Components ---
import OverviewTab from '../components/admin/OverviewTab';
import UsersTab from '../components/admin/UsersTab';
import TripsTab from '../components/admin/TripsTab';
import ReservationsTab from '../components/admin/ReservationsTab';
import ReportsTab from '../components/admin/ReportsTab';
import AccountTab from '../components/dashboard/AccountTab';

// --- Custom Hooks ---
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [reports, setReports] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useReveal(loading);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, u, t, r, res] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getTrips(),
        adminService.getReports(),
        adminService.getReservations()
      ]);
      setStats(s);
      setUsers(u || []);
      setTrips(t || []);
      setReports(r || []);
      setReservations(res || []);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleDeleteUser = async (id) => {
    toast.confirm('Voulez-vous vraiment supprimer cet utilisateur ?', async () => {
      try {
        await adminService.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('Utilisateur supprimé avec succès.');
      } catch (err) { toast.error('Erreur lors de la suppression de l\'utilisateur'); }
    });
  };

  const handleVerifyUser = async (id) => {
    try {
      const updated = await adminService.verifyUser(id);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      toast.success('Utilisateur vérifié.');
    } catch (err) { toast.error('Erreur lors de la vérification de l\'utilisateur'); }
  };

  const handleToggleStatus = async (id) => {
    try {
      const updated = await adminService.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      toast.success('Statut de l\'utilisateur mis à jour.');
    } catch (err) { toast.error('Erreur lors de la mise à jour du statut'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await adminService.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      toast.success('Rôle de l\'utilisateur mis à jour.');
    } catch (err) { toast.error('Erreur lors de la mise à jour du rôle'); }
  };

  const handleReportStatus = async (id, status) => {
    try {
      const updated = await adminService.updateReportStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Statut du signalement mis à jour.');
    } catch (err) { toast.error('Erreur lors de la mise à jour du signalement'); }
  };
  
  const handleDeleteTrip = async (id) => {
    toast.confirm('Supprimer ce trajet ?', async () => {
      try {
        await adminService.deleteTrip(id);
        setTrips(prev => prev.filter(t => t.id !== id));
        toast.success('Trajet supprimé.');
      } catch (err) { toast.error('Erreur lors de la suppression du trajet'); }
    });
  };

  const handleDeleteReservation = async (id) => {
    toast.confirm('Supprimer cette réservation ?', async () => {
      try {
        await adminService.deleteReservation(id);
        setReservations(prev => prev.filter(r => r.id !== id));
        toast.success('Réservation supprimée.');
      } catch (err) { toast.error('Erreur lors de la suppression de la réservation'); }
    });
  };

  // --- Filtering ---
  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTrips = trips.filter(t => 
    selectedFilter === 'all' ? true : t.status === selectedFilter
  );

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      stats={stats}
      onAccountClick={setActiveTab}
    >
      {loading ? (
        <PageLoader inline />
      ) : (
        <div className="reveal-element">
          {activeTab === 'overview' && <OverviewTab stats={stats} recentUsers={users} />}
          
          {activeTab === 'users' && (
            <UsersTab 
              users={filteredUsers} 
              search={search} 
              onSearchChange={setSearch}
              onVerify={handleVerifyUser}
              onToggleStatus={handleToggleStatus}
              onRoleChange={handleRoleChange}
              onDelete={handleDeleteUser}
              currentUserId={user?.id}
            />
          )}

          {activeTab === 'trips' && (
            <TripsTab 
              trips={filteredTrips} 
              filter={selectedFilter} 
              onFilterChange={setSelectedFilter}
              onDelete={handleDeleteTrip}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsTab 
              reservations={reservations} 
              onDelete={handleDeleteReservation} 
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              reports={reports} 
              onUpdateStatus={handleReportStatus} 
            />
          )}

          {activeTab === 'account' && (
            <AccountTab />
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;