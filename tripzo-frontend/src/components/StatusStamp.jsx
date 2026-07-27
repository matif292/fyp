export default function StatusStamp({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  return <span className={`stamp stamp-${normalized}`}>{normalized.replace('_', ' ')}</span>;
}
