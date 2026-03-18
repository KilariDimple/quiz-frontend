export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p className="text-sm text-secondary">{text}</p>
    </div>
  );
}
