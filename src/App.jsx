import { Component } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { useToast } from "./context/ToastContext.jsx";
import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ToastContainer from "./components/ToastContainer.jsx";

// Catches any render crash and shows the error instead of blank white screen
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, fontFamily: "monospace", color: "#ef4444" }}>
                    <h2>Something went wrong</h2>
                    <pre style={{ marginTop: 16, whiteSpace: "pre-wrap", fontSize: 13 }}>
                        {this.state.error?.message}
                        {"\n"}
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

function AppInner() {
    const { currentUser } = useAuth();
    const { toasts } = useToast();
    // "login" | "register"
    const [authView, setAuthView] = useState("login");

    return (
        <>
            {currentUser ? (
                <Dashboard />
            ) : authView === "register" ? (
                <RegisterPage onBack={() => setAuthView("login")} />
            ) : (
                <LoginPage onRegister={() => setAuthView("register")} />
            )}
            <ToastContainer toasts={toasts} />
        </>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppInner />
        </ErrorBoundary>
    );
}
