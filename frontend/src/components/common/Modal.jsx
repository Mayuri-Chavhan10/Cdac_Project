export default function Modal({ show, title, onClose, children, footer, size = '' }) {
  if (!show) return null;
  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1050 }} />
      <div className="modal d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
        <div className={`modal-dialog modal-dialog-centered ${size}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
