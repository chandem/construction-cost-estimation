import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ToastStack() {
  const { toasts, dismissToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toastIcon">
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error" && <AlertCircle size={18} />}
            {t.type === "info" && <Info size={18} />}
          </span>
          <span className="toastMsg">{t.message}</span>
          <button type="button" className="toastClose" onClick={() => dismissToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
