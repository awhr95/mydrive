import "./ConfirmDialog.scss";
import { FiAlertTriangle } from "react-icons/fi";

const ConfirmDialog = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, danger }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog__overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-dialog__icon${danger ? " confirm-dialog__icon--danger" : ""}`}>
          <FiAlertTriangle />
        </div>
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
            {cancelText || "Cancel"}
          </button>
          <button
            className={`confirm-dialog__btn confirm-dialog__btn--confirm${danger ? " confirm-dialog__btn--danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
