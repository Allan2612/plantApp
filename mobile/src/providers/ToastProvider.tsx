import AppToast, { ToastType } from "@/src/components/shared/AppToast/AppToast";
import { normalizeErrorMessage } from "@/src/services/errors/errorMessages";
import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: () => void;
}

interface ToastState {
  message: string;
  type: ToastType;
}

const TOAST_DURATION_MS = 4200;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const safeMessage = type === "error" ? normalizeErrorMessage(message) : message;
      setToast({ message: safeMessage, type });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast ? (
        <AppToast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
