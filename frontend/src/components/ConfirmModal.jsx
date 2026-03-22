import './ConfirmModal.css';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Yes, Delete" }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p dangerouslySetInnerHTML={{ __html: message }}></p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
