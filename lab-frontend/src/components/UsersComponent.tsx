import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader, Search, User } from 'lucide-react';
import { useToast } from './Toast';
import Modal from './Modal';

interface User {
  id: string;
  username: string;
  mobile: string;
  email?: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'RECEPTIONIST';
  isActive: boolean;
  createdAt: string;
}

interface UsersComponentProps {
  currentUser?: any;
  onAddNew?: () => void;
}

export default function UsersComponent({ currentUser, onAddNew }: UsersComponentProps) {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      // This will be implemented when users service is created
      setUsers([]);
    } catch (error: any) {
      toast.show({ type: 'error', message: error.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      // await usersService.deleteUser(deleteId);
      setUsers(users.filter(u => u.id !== deleteId));
      toast.show({ type: 'success', message: 'User deleted' });
      setDeleteId(null);
    } catch (error: any) {
      toast.show({ type: 'error', message: error.message || 'Failed to delete user' });
    }
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile.includes(search) ||
    (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const getRoleBadgeColor = (role: string) => {
    if (role === 'ADMIN') return '#2563eb';
    if (role === 'TECHNICIAN') return '#16a34a';
    return '#f59e0b';
  };

  return (
    <div className="users-component">
      <div className="component-header">
        <h2>Lab Users</h2>
        <button className="btn btn-primary" onClick={onAddNew}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by username, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <User size={32} className="empty-icon" />
          <p>No users found</p>
          <button className="btn btn-secondary" onClick={onAddNew}>
            Add first user
          </button>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                  <td className="font-medium">{user.username}</td>
                  <td>{user.mobile}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span
                      className="role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-icon" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="btn-icon btn-icon-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <Modal
          title="Delete User"
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          confirmText="Delete"
          isDangerous
        >
          <p>Are you sure you want to delete this user? They will no longer be able to access the system.</p>
        </Modal>
      )}

      <style>{`
        .users-component { display: flex; flex-direction: column; gap: 20px; }
        .component-header { display: flex; justify-content: space-between; align-items: center; }
        .component-header h2 { margin: 0; }
        .search-bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(148,163,184,0.05); border-radius: 12px; border: 1px solid rgba(148,163,184,0.2); }
        .search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; }
        .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
        .empty-icon { color: rgba(100,116,139,0.5); margin-bottom: 12px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .users-table { overflow-x: auto; border: 1px solid rgba(148,163,184,0.2); border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: rgba(148,163,184,0.05); }
        th { padding: 14px; text-align: left; font-weight: 600; font-size: 13px; }
        td { padding: 14px; border-top: 1px solid rgba(148,163,184,0.1); font-size: 13px; }
        tbody tr:hover { background: rgba(56,189,248,0.04); }
        tbody tr.inactive { opacity: 0.6; }
        .font-medium { font-weight: 500; }
        .role-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-size: 12px; font-weight: 600; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-badge.active { background: #d1fae5; color: #065f46; }
        .status-badge.inactive { background: #fee2e2; color: #991b1b; }
        .actions { display: flex; gap: 8px; }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; color: #64748b; transition: color 0.2s; }
        .btn-icon:hover { color: var(--primary); }
        .btn-icon-danger:hover { color: #dc2626; }
      `}</style>
    </div>
  );
}
