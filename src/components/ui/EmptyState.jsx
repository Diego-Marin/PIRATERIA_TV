export default function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
    </div>
  );
}
