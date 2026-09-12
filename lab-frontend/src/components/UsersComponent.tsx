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


    </div>
  );
}
