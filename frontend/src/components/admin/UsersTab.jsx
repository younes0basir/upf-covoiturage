import React from 'react';
import { SearchBar, StatusBadge, ActionButton } from './AdminUI';

const UsersTab = ({ users, search, onSearchChange, onVerify, onToggleStatus, onRoleChange, onDelete, currentUserId }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search users by name or email..."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center font-semibold text-xs text-center leading-none">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm leading-none mb-1">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{user.gender?.toLowerCase() || 'Student'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {!user.verified && (
                      <button
                        onClick={() => onVerify(user.id)}
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100 transition-colors"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-colors ${
                        user.enabled 
                          ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' 
                          : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                      }`}
                    >
                      {user.enabled ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {user.id !== currentUserId && (
                    <ActionButton
                      onClick={() => onDelete(user.id)}
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>}
                      label="Delete user"
                      variant="delete"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
