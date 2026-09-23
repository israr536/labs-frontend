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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function SubscriptionCard({ subscription, loading, onUpgrade }: Props) {
  if (loading && !subscription) {
    return <section className="saas-subscription-card"><div className="subscription-skeleton" /><div className="subscription-skeleton short" /><div className="subscription-skeleton rows" /></section>;
  }

  if (!subscription) return null;

  const isTrial = Boolean(subscription.trial) || subscription.plan === 'TRIAL' || subscription.plan === 'FREE';
  const isExpired = subscription.status === 'expired';
  const isScheduled = subscription.status === 'scheduled' || subscription.status === 'pending';
  const statusLabel = isExpired ? 'Expired' : isScheduled ? 'Scheduled' : isTrial ? 'Trial active' : 'Active';

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

      {isTrial && !isExpired && subscription.endsAt && (
        <div className="subscription-trial-banner">
          <strong>Your 30-day free trial is active.</strong>
          <span>Your workspace remains available until {formatDate(subscription.endsAt)}. Choose a paid plan before the trial ends to continue without interruption.</span>
        </div>
      )}

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
          <div>
            <strong>{isExpired ? 'Keep your lab running' : 'Plan ahead'}</strong>
            <span>{isExpired ? 'Choose a paid plan to restore workspace access.' : 'Review Monthly and Yearly plans before your trial ends.'}</span>
          </div>
          <button type="button" onClick={onUpgrade}><span>{isExpired ? 'Choose a plan' : 'View plans'}</span><ArrowUpRight size={16} /></button>
        </div>
      )}
    </section>
  );
}
