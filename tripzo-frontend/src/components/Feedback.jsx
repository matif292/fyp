export function Loader() {
  return (
    <div className="center-loader">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {hint && <p className="muted">{hint}</p>}
      {action}
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
}