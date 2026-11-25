import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage({ onRegister }) {
    const { login } = useAuth();
    const [mode, setMode] = useState("individual");
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = e => {
        e.preventDefault();
        setError("");
        const result = login(form.username, form.password, mode);
        if (!result.ok) setError(result.error);
    };

    return (
        <div className="entry-page">
            <div className="entry-card">
                {/* Brand panel */}
                <div className="entry-brand">
                    <div>
                        <div className="entry-logo">
                            <div className="entry-logo-mark">
                                <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                                    <path d="M9.5 16.5L14 21L22.5 11.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>TaskFlow</span>
                        </div>
                        <h1 style={{ marginTop: 28, fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                            Manage tasks.<br />Ship faster.
                        </h1>
                        <p className="entry-brand-subtitle">
                            Your all-in-one workspace for tasks, projects and team reminders — beautifully simple.
                        </p>
                    </div>
                    <div className="entry-highlights">
                        {["Individual & team workspaces", "Project tracking with progress", "Smart reminders & notifications"].map(f => (
                            <div key={f} className="entry-highlight">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M3 7.5L6.5 11L12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {f}
                            </div>
                        ))}
                    </div>
                    <div className="entry-badge">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="3" /></svg>
                        Free to use · No account required to explore
                    </div>
                </div>

                {/* Form panel */}
                <div className="entry-content">
                    <div>
                        <h2>Welcome back</h2>
                        <p className="entry-desc">Sign in to continue to your workspace.</p>
                    </div>

                    <div className="view-toggle">
                        <button
                            type="button"
                            className={mode === "individual" ? "active" : ""}
                            onClick={() => setMode("individual")}
                        >Individual</button>
                        <button
                            type="button"
                            className={mode === "team" ? "active" : ""}
                            onClick={() => setMode("team")}
                        >Team</button>
                    </div>

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter your username"
                                value={form.username}
                                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                            />
                        </div>
                        {error && <p className="form-error">{error}</p>}
                        <button className="btn btn-primary" type="submit" style={{ width: "100%", justifyContent: "center" }}>
                            Sign In
                        </button>
                    </form>

                    <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={onRegister}
                            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
