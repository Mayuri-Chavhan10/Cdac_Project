export default function ConfirmDialog({ state, onConfirm, onCancel }) {
  if (!state?.open) return null;

  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1050 }} />
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1055 }} role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{state.title}</h5>
              <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
            </div>
            <div className="modal-body">
              <p className="mb-0">{state.message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className={`btn btn-${state.variant}`} onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
