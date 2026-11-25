import { createContext, useCallback, useContext, useState } from "react";
import { uid } from "../utils/helpers";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "") => {
        const id = uid("toast");
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3200);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
};
