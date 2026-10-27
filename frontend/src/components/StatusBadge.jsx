export default function StatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase();
  const palette = {
    ACTIVE: 'badge badge-blue',
    CLAIM_PENDING: 'badge badge-amber',
    RETURNED: 'badge badge-green',
    CLOSED: 'badge badge-slate',
    PENDING: 'badge badge-amber',
    APPROVED: 'badge badge-green',
    REJECTED: 'badge badge-red',
  };

  return <span className={palette[normalized] || 'badge badge-slate'}>{normalized || 'UNKNOWN'}</span>;
}
