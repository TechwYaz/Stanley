export default function Spinner({ size = 28, label }) {
  return (
    <div className="center-load" role="status">
      <span className="spinner" style={{ width: size, height: size }} />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  )
}
