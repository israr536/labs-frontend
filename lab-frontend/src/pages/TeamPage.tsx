import { useEffect, useState, type FormEvent } from 'react';
import { Check, Loader2, MoreHorizontal, Plus, Shield, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import usersService, { type LabUser, type UserRole } from '../services/usersService';
import { useToast } from '../components/Toast';

const roles: UserRole[] = ['ADMIN', 'RECEPTIONIST', 'TECHNICIAN'];

export default function TeamPage() {
  const toast = useToast();
  const [members, setMembers] = useState<LabUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', mobile: '', password: '', role: 'TECHNICIAN' as UserRole });

  const load = async () => {
    setLoading(true);
    try { setMembers(await usersService.listUsers()); }
    catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not load team members.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true);
    try { const member = await usersService.createUser({ ...form, isActive: true }); setMembers((current) => [member, ...current]); setForm({ email: '', mobile: '', password: '', role: 'TECHNICIAN' }); setOpen(false); toast.show({ type: 'success', message: 'Team member added.' }); }
    catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not add team member.' }); }
    finally { setSaving(false); }
  };

  const toggle = async (member: LabUser) => {
    try { const updated = await usersService.updateUser(member.id, { isActive: !member.isActive }); setMembers((current) => current.map((item) => item.id === member.id ? updated : item)); toast.show({ type: 'success', message: member.isActive ? 'Member deactivated.' : 'Member activated.' }); }
    catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not update member.' }); }
  };

  const remove = async (member: LabUser) => {
    if (!window.confirm(`Delete ${member.email || member.username}? This cannot be undone.`)) return;
    try { await usersService.deleteUser(member.id); setMembers((current) => current.filter((item) => item.id !== member.id)); toast.show({ type: 'success', message: 'Team member removed.' }); }
    catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not remove member.' }); }
  };

  return <div className="saas-page">
    <div className="saas-page-header"><div><span className="saas-eyebrow">Administration</span><h1>Team members</h1><p>Manage who can access your laboratory workspace and what they can do.</p></div><button className="saas-primary-btn" onClick={() => setOpen(true)}><Plus size={17} />Add member</button></div>
    <div className="team-summary"><div><UsersRound size={18} /><strong>{members.length}</strong><span>members</span></div><div><Shield size={18} /><strong>{members.filter((m) => m.role === 'ADMIN').length}</strong><span>administrators</span></div><div><Check size={18} /><strong>{members.filter((m) => m.isActive).length}</strong><span>active accounts</span></div></div>
    <section className="saas-table-card"><div className="saas-card-header"><div><h2>Workspace access</h2><span>Only administrators can manage team access.</span></div><MoreHorizontal size={20} /></div>{loading ? <div className="team-loading"><Loader2 className="spin" size={20} />Loading team...</div> : members.length === 0 ? <div className="team-empty"><UsersRound size={28} /><strong>No team members yet</strong><span>Add your first staff account to get started.</span></div> : <div className="team-table-wrap"><table className="team-table"><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><div className="member-cell"><div className="member-avatar">{(member.email || member.username || 'U').slice(0,1).toUpperCase()}</div><div><strong>{member.email || member.username}</strong><span>{member.mobile || 'No mobile number'}</span></div></div></td><td><span className={`role-pill ${member.role.toLowerCase()}`}>{member.role}</span></td><td><span className={`status-pill ${member.isActive ? 'active' : 'inactive'}`}><span />{member.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="member-actions"><button onClick={() => toggle(member)}>{member.isActive ? 'Deactivate' : 'Activate'}</button><button className="delete-btn" onClick={() => remove(member)} title="Delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}</section>
    {open && <div className="team-overlay" role="dialog" aria-modal="true"><form className="team-modal" onSubmit={create}><div className="team-modal-head"><div><span className="saas-eyebrow">New account</span><h2>Add team member</h2></div><button type="button" className="icon-btn" onClick={() => setOpen(false)}><X size={18} /></button></div><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></label><label>Mobile<input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></label><label>Temporary password<input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" /><small>Minimum 8 characters.</small></label><label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label><div className="team-modal-actions"><button type="button" className="saas-secondary-btn" onClick={() => setOpen(false)}>Cancel</button><button type="submit" className="saas-primary-btn" disabled={saving}>{saving ? <Loader2 className="spin" size={16} /> : <UserRound size={16} />}{saving ? 'Creating...' : 'Create account'}</button></div></form></div>}

  </div>;
}
