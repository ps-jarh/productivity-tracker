export default function Modal({ onClose, children, width = 490 }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box up" style={{ width }}>
        {children}
      </div>
    </div>
  )
}
