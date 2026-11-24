import { sfx } from "../game/sfx.js";

export default function ConfirmDialog({ title, body, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal pop-in" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {body && <p className="modal-body">{body}</p>}
        <div className="btn-row center">
          <button className="btn btn-ghost" onClick={() => { sfx.click(); onCancel(); }}>Cancel</button>
          <button className={"btn " + (danger ? "btn-danger" : "btn-primary")} onClick={() => { sfx.click(); onConfirm(); }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
