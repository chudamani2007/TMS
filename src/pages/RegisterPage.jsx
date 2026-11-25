import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function RegisterPage({ onBack }) {
    const { registerIndividual, registerAdmin, createTeamMembers } = useAuth();
    const { showToast } = useToast();
    const [mode, setMode] = useState("individual");
    const [step, setStep] = useState(1);
    const [adminData, setAdminData] = useState(null);
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
    const [members, setMembers] = useState([{ name: "", username: "", email: "", password: "" }]);

    const handleIndividual = e => {
        e.preventDefault();
        if (form.password !== form.confirm) { showToast("Passwords do not match.", "error"); return; }
        const ok = registerIndividual(form);
        if (ok) onBack();
    };

    const handleAdminStep = e => {
        e.preventDefault();
        if (form.password !== form.confirm) { showToast("Passwords do not match.", "error"); return; }
        const admin = registerAdmin(form);
        if (admin) { setAdminData(admin); setStep(2); }
    };

    const adminId = adminData?.id ?? null;

    const handleTeamMembers = e => {
        e.preventDefault();
        if (!adminId) return;
        const ok = createTeamMembers(adminId, members);
        if (ok) onBack();
    };

    const updateMember = (i, field, value) => {
        setMembers(ms => ms.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
    };

    return (
        <div className="entry-page">
            <div className="entry-card" style={{ gridTemplateColumns: "1fr", maxWidth: 560 }}>
                <div className="entry-content" style={{ padding: "36px 42px" }}>
                    <button
                        type="button"
                        onClick={onBack}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 8, alignSelf: "flex-start", padding: 0 }}
                    >
                        ← Back to Login
                    </button>

                    <div>
                        <h2>{step === 1 ? "Create account" : "Add team members"}</h2>
                        {step === 2 && adminData && (
                            <p className="entry-desc">Setting up workspace for <strong>{adminData.name}</strong></p>
                        )}
                    </div>

                    {step === 1 && (
                        <>
                            <div className="view-toggle">
                                <button type="button" className={mode === "individual" ? "active" : ""} onClick={() => setMode("individual")}>Individual</button>
                                <button type="button" className={mode === "team" ? "active" : ""} onClick={() => setMode("team")}>Team Admin</button>
                            </div>

                            <form onSubmit={mode === "individual" ? handleIndividual : handleAdminStep} className="form">
                                {[
                                    { key: "name", label: "Full Name", type: "text" },
                                    { key: "username", label: "Username", type: "text" },
                                    { key: "email", label: "Email", type: "email" },
                                    { key: "password", label: "Password", type: "password" },
                                    { key: "confirm", label: "Confirm Password", type: "password" },
                                ].map(({ key, label, type }) => (
                                    <div className="form-group" key={key}>
                                        <label>{label}</label>
                                        <input
                                            className="input"
                                            type={type}
                                            placeholder={label}
                                            value={form[key]}
                                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            required
                                        />
                                    </div>
                                ))}
                                <button className="btn btn-primary" type="submit" style={{ width: "100%", justifyContent: "center" }}>
                                    {mode === "individual" ? "Create Account" : "Next: Add Members →"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleTeamMembers} className="form">
                            {members.map((m, i) => (
                                <div key={i} style={{ padding: "14px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Member {i + 1}</p>
                                    <div className="form-row" style={{ marginBottom: 8 }}>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input className="input" type="text" placeholder="Full Name" value={m.name} onChange={e => updateMember(i, "name", e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input className="input" type="text" placeholder="Username" value={m.username} onChange={e => updateMember(i, "username", e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input className="input" type="email" placeholder="Email" value={m.email} onChange={e => updateMember(i, "email", e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input className="input" type="password" placeholder="Password" value={m.password} onChange={e => updateMember(i, "password", e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setMembers(ms => [...ms, { name: "", username: "", email: "", password: "" }])}>
                                + Add Another Member
                            </button>
                            <button className="btn btn-primary" type="submit" style={{ width: "100%", justifyContent: "center" }}>
                                Create Team Workspace
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
