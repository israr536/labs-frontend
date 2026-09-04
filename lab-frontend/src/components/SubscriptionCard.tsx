import { ArrowUpRight, CheckCircle2, Clock3, CreditCard, Database, FileText, FlaskConical, Users } from 'lucide-react';
import type { SubscriptionStatus } from '../services/subscriptionService';

type Props = {
  subscription: SubscriptionStatus | null;
  loading?: boolean;
  onUpgrade?: () => void;
};

const resources = [
  { key: 'users' as const, label: 'Team members', icon: Users, limitKey: 'maxUsers' as const },
  { key: 'patients' as const, label: 'Patients', icon: Database, limitKey: 'maxPatients' as const },
  { key: 'tests' as const, label: 'Tests', icon: FlaskConical, limitKey: 'maxTests' as const },
  { key: 'orders' as const, label: 'Orders', icon: FileText, limitKey: 'maxOrders' as const },
];

function percent(value: number, limit: number | null) {
  if (limit === null) return 0;
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((value / limit) * 100));
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function SubscriptionCard({ subscription, loading, onUpgrade }: Props) {
  if (loading && !subscription) {
    return <section className="saas-subscription-card"><div className="subscription-skeleton" /><div className="subscription-skeleton short" /><div className="subscription-skeleton rows" /></section>;
  }

  if (!subscription) return null;

  const isTrial = subscription.plan === 'TRIAL';
  const isExpired = subscription.status === 'expired';
  const statusLabel = isExpired ? 'Expired' : subscription.status === 'scheduled' ? 'Scheduled' : isTrial ? 'Trial active' : 'Active';

  return (
    <section className={`saas-subscription-card ${isExpired ? 'is-expired' : ''}`}>
      <div className="subscription-topline">
        <div className="subscription-title-wrap">
          <div className="subscription-icon"><CreditCard size={19} /></div>
          <div>
            <p className="subscription-eyebrow">Workspace plan</p>
            <h2>{subscription.planName}</h2>
          </div>
        </div>
        <span className={`subscription-status ${isExpired ? 'danger' : ''}`}>
          {isExpired ? <Clock3 size={14} /> : <CheckCircle2 size={14} />}
          {statusLabel}
        </span>
      </div>

      <div className="subscription-meta">
        <span>{isTrial ? 'Trial started' : 'Plan started'} <strong>{formatDate(subscription.startsAt)}</strong></span>
        <span>{isExpired ? 'Ended' : 'Renews / ends'} <strong>{formatDate(subscription.endsAt)}</strong></span>
      </div>

      <div className="usage-grid">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const value = subscription.usage[resource.key];
          const limit = subscription.limits[resource.limitKey];
          const used = percent(value, limit);
          return (
            <div className="usage-item" key={resource.key}>
              <div className="usage-heading"><span><Icon size={15} />{resource.label}</span><strong>{value} / {limit === null ? '∞' : limit}</strong></div>
              <div className="usage-track"><span style={{ width: `${limit === null ? 8 : used}%` }} /></div>
            </div>
          );
        })}
      </div>

      {(isTrial || isExpired) && (
        <div className="subscription-cta">
          <div><strong>{isExpired ? 'Keep your lab running' : 'Ready to grow?'}</strong><span>{isExpired ? 'Choose a paid plan to restore workspace access.' : 'Upgrade when your team or patient volume grows.'}</span></div>
          <button type="button" onClick={onUpgrade}><span>View plans</span><ArrowUpRight size={16} /></button>
        </div>
      )}

      <style>{`
        .saas-subscription-card{background:linear-gradient(135deg,rgba(6,96,137,.08),rgba(14,184,157,.05));border:1px solid var(--border);border-radius:20px;padding:20px;box-shadow:var(--shadow);display:grid;gap:18px}.saas-subscription-card.is-expired{border-color:rgba(239,68,68,.3);background:linear-gradient(135deg,rgba(239,68,68,.07),rgba(255,255,255,.7))}.subscription-topline{display:flex;align-items:center;justify-content:space-between;gap:16px}.subscription-title-wrap{display:flex;align-items:center;gap:12px}.subscription-icon{width:42px;height:42px;border-radius:13px;background:var(--panel-bg);border:1px solid var(--border);display:grid;place-items:center;color:var(--primary)}.subscription-eyebrow{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:var(--text);margin:0 0 2px}.subscription-title-wrap h2{font-size:1.2rem;margin:0}.subscription-status{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 10px;background:var(--success-bg);color:var(--success);font-size:.76rem;font-weight:800}.subscription-status.danger{background:var(--danger-bg);color:var(--danger)}.subscription-meta{display:flex;gap:24px;flex-wrap:wrap;color:var(--text);font-size:.78rem}.subscription-meta strong{color:var(--text-bold);margin-left:4px}.usage-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.usage-item{padding:12px;background:var(--panel-bg);border:1px solid var(--border);border-radius:13px}.usage-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:.74rem;color:var(--text);margin-bottom:9px}.usage-heading span{display:flex;align-items:center;gap:6px}.usage-heading strong{color:var(--text-bold);white-space:nowrap}.usage-track{height:5px;border-radius:999px;background:rgba(148,163,184,.18);overflow:hidden}.usage-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--primary),var(--secondary))}.subscription-cta{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 15px;border-radius:14px;background:var(--panel-bg);border:1px solid var(--border)}.subscription-cta div{display:grid;gap:2px}.subscription-cta strong{font-size:.86rem;color:var(--text-bold)}.subscription-cta span{font-size:.76rem;color:var(--text)}.subscription-cta button{display:inline-flex;align-items:center;gap:5px;border:0;border-radius:10px;padding:9px 12px;background:var(--primary);color:#fff;font-weight:800;cursor:pointer;white-space:nowrap}.subscription-skeleton{height:20px;width:38%;border-radius:8px;background:rgba(148,163,184,.16);animation:pulse 1.4s infinite}.subscription-skeleton.short{width:20%}.subscription-skeleton.rows{height:90px;width:100%}@keyframes pulse{50%{opacity:.5}}@media(max-width:900px){.usage-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.subscription-topline,.subscription-cta{align-items:flex-start;flex-direction:column}.subscription-status{align-self:flex-start}.usage-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
