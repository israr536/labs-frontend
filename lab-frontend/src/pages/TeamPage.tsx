import { useEffect, useState, type FormEvent } from 'react';
import { Check, Loader2, Mail, MoreHorizontal, Plus, Shield, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import usersService from '../services/usersService';
import { useToast } from '../components/Toast';

const roles = ['ADMIN', 'RECEPTIONIST', 'TECHNICIAN'] as const;
type Role = typeof roles[number];

type Member = { id: string; username?: string; email?: string; mobile?: string; role: Role; isActive: boolean };

export default function TeamPage() {
  const toast = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', mobile: '', password: '', role: 'TECHNICIAN' as Role });

  const load = async () => {
    setLoading(true);
    try {
      const result = await usersService.listUsers();
      setMembers((Array.isArray(result) ? result : result?.data ?? []) as Member[]);
    } catch (error: any) {
      toast.show({ type: 'error', message: error?.message || 'Could not load team members.' });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const member = await usersService.createUser({ ...form, isActive: true });
      setMembers((current) => [member as Member, ...current]);
      setForm({ email: '', mobile: '', password: '', role: 'TECHNICIAN' });
      setOpen(false);
      toast.show({ type: 'success', message: 'Team member added.' });
    } catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not add team member.' }); }
    finally { setSaving(false); }
  };

  const toggle = async (member: Member) => {
    try {
      const updated = await usersService.updateUser(member.id, { isActive: !member.isActive });
      setMembers((current) => current.map((item) => item.id === member.id ? updated as Member : item));
      toast.show({ type: 'success', message: member.isActive ? 'Member deactivated.' : 'Member activated.' });
    } catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not update member.' }); }
  };

  const remove = async (member: Member) => {
    if (!window.confirm(`Delete ${member.email || member.username || 'this user'}? This cannot be undone.`)) return;
    try {
      await usersService.deleteUser(member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      toast.show({ type: 'success', message: 'Team member removed.' });
    } catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Could not remove member.' }); }
  };

  return <div className="saas-page">
    <div className="saas-page-header"><div><span className="saas-eyebrow">Administration</span><h1>Team members</h1><p>Manage who can access your laboratory workspace and what they can do.</p></div><button className="saas-primary-btn" onClick={() => setOpen(true)}><Plus size={17} />Add member</button></div>
    <div className="team-summary"><div><UsersRound size={18} /><strong>{members.length}</strong><span>members</span></div><div><Shield size={18} /><strong>{members.filter((m) => m.role === 'ADMIN').length}</strong><span>administrators</span></div><div><Check size={18} /><strong>{members.filter((m) => m.isActive).length}</strong><span>active accounts</span></div></div>
    <section className="saas-table-card"><div className="saas-card-header"><div><h2>Workspace access</h2><span>Only administrators can manage team access.</span></div><MoreHorizontal size={20} /></div>{loading ? <div className="team-loading"><Loader2 className="spin" size={20} />Loading team...</div> : members.length === 0 ? <div className="team-empty"><UsersRound size={28} /><strong>No team members yet</strong><span>Add your first staff account to get started.</span></div> : <div className="team-table-wrap"><table className="team-table"><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><div className="member-cell"><div className="member-avatar">{(member.email || member.username || 'U').slice(0,1).toUpperCase()}</div><div><strong>{member.email || member.username || 'Unnamed user'}</strong><span>{member.mobile || 'No mobile number'}</span></div></div></td><td><span className={`role-pill ${member.role.toLowerCase()}`}>{member.role}</span></td><td><span className={`status-pill ${member.isActive ? 'active' : 'inactive'}`}><span />{member.isActive ? 'Active' : 'Inactive'}</span></td><td><div className="member-actions"><button onClick={() => toggle(member)}>{member.isActive ? 'Deactivate' : 'Activate'}</button><button className="delete-btn" onClick={() => remove(member)} title="Delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}</section>
    {open && <div className="team-overlay" role="dialog" aria-modal="true"><form className="team-modal" onSubmit={create}><div className="team-modal-head"><div><span className="saas-eyebrow">New account</span><h2>Add team member</h2></div><button type="button" className="icon-btn" onClick={() => setOpen(false)}><X size={18} /></button></div><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></label><label>Mobile<input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></label><label>Temporary password<input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" /><small>Minimum 8 characters.</small></label><label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label><div className="team-modal-actions"><button type="button" className="saas-secondary-btn" onClick={() => setOpen(false)}>Cancel</button><button type="submit" className="saas-primary-btn" disabled={saving}>{saving ? <Loader2 className="spin" size={16} /> : <UserRound size={16} />}{saving ? 'Creating...' : 'Create account'}</button></div></form></div>}
    <style>{`.saas-page{max-width:1240px;margin:0 auto;padding:24px 28px 80px;display:grid;gap:18px}.saas-page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.saas-eyebrow{font-size:.67rem;text-transform:uppercase;letter-spacing:.13em;font-weight:850;color:var(--primary)}.saas-page-header h1{font-size:clamp(1.8rem,3vw,2.35rem);margin:4px 0 5px}.saas-page-header p{font-size:.84rem;color:var(--text);margin:0;max-width:650px}.saas-primary-btn,.saas-secondary-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:11px;padding:10px 14px;font-weight:800;font-size:.76rem;cursor:pointer}.saas-primary-btn{background:var(--primary);color:#fff;border:1px solid var(--primary)}.saas-primary-btn:disabled{opacity:.6;cursor:not-allowed}.saas-secondary-btn{background:var(--panel-bg);color:var(--text-bold);border:1px solid var(--border)}.team-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.team-summary>div{display:flex;align-items:center;gap:9px;padding:15px 17px;border:1px solid var(--border);background:var(--panel-bg);border-radius:14px}.team-summary svg{color:var(--primary)}.team-summary strong{font-size:1.15rem;color:var(--text-bold)}.team-summary span{font-size:.72rem;color:var(--text)}.saas-table-card{background:var(--panel-bg);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);overflow:hidden}.saas-card-header{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;border-bottom:1px solid var(--border)}.saas-card-header h2{font-size:1rem;margin:0}.saas-card-header span{font-size:.7rem;color:var(--text)}.team-table-wrap{overflow-x:auto}.team-table{width:100%;border-collapse:collapse}.team-table th,.team-table td{text-align:left;padding:13px 17px;border-bottom:1px solid var(--border);font-size:.75rem}.team-table th{font-size:.64rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text);background:var(--primary-light)}.team-table tr:last-child td{border-bottom:0}.member-cell{display:flex;align-items:center;gap:10px}.member-cell>div:last-child{display:grid;gap:2px}.member-cell strong{color:var(--text-bold);font-size:.76rem}.member-cell span{color:var(--text);font-size:.67rem}.member-avatar{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--primary-light);color:var(--primary);font-weight:850}.role-pill,.status-pill{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 8px;font-size:.6rem;font-weight:850}.role-pill{background:rgba(99,102,241,.1);color:#6366f1}.status-pill.active{background:var(--success-bg);color:var(--success)}.status-pill.inactive{background:var(--danger-bg);color:var(--danger)}.status-pill span{width:5px;height:5px;border-radius:50%;background:currentColor}.member-actions{display:flex;align-items:center;gap:7px}.member-actions button{border:1px solid var(--border);background:transparent;color:var(--text);border-radius:8px;padding:6px 9px;font-size:.64rem;font-weight:750;cursor:pointer}.member-actions .delete-btn{padding:6px;color:var(--danger)}.team-loading,.team-empty{min-height:190px;display:grid;place-items:center;align-content:center;gap:8px;color:var(--text);font-size:.78rem}.team-empty strong{color:var(--text-bold)}.team-overlay{position:fixed;inset:0;background:rgba(15,23,42,.42);backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px;z-index:300}.team-modal{width:min(470px,100%);background:var(--panel-bg);border:1px solid var(--border);border-radius:20px;box-shadow:0 30px 80px rgba(15,23,42,.2);padding:21px;display:grid;gap:14px}.team-modal-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px}.team-modal h2{margin:3px 0 0;font-size:1.3rem}.icon-btn{border:1px solid var(--border);background:transparent;color:var(--text);border-radius:9px;padding:7px;cursor:pointer}.team-modal label{display:grid;gap:6px;font-size:.72rem;font-weight:800;color:var(--text-bold)}.team-modal input,.team-modal select{min-height:43px;border:1px solid var(--border);border-radius:11px;background:rgba(255,255,255,.55);padding:10px 12px;color:var(--text-bold);font:inherit;outline:none}.team-modal small{font-size:.63rem;color:var(--text);font-weight:500;margin-top:-3px}.team-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:5px}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:720px){.saas-page{padding:18px 14px 90px}.saas-page-header{align-items:flex-start;flex-direction:column}.team-summary{grid-template-columns:1fr}.team-table th:nth-child(2),.team-table td:nth-child(2){display:none}}`}</style>
  </div>;
}
