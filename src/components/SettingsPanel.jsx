import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function SettingsPanel() {
    const { settings, toggleTheme, requestNotifications, exportData, clearAllData } = useData();
    const { currentUser, updateProfile, logout } = useAuth();
    const [profile, setProfile] = useState({ name: currentUser?.name || "", email: currentUser?.email || "" });

    const handleProfileSave = e => {
        e.preventDefault();
        updateProfile(profile);
    };

    return (
        <>
            <div className="page-header">
                <div><h2>Settings</h2><p>Manage your account and preferences.</p></div>
            </div>

            <div className="settings-grid">
                {/* Profile */}
                <div className="setting-card">
                    <div className="setting-card-head">
                        <h3>Profile</h3>
                    </div>
                    <p>Update your display name and email address.</p>
                    <form onSubmit={handleProfileSave} className="form">
                        <div className="form-group">
                            <label>Name</label>
                            <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" className="input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
                        </div>
                        <button className="btn btn-primary" type="submit">Save Changes</button>
                    </form>
                </div>

                {/* Appearance */}
                <div className="setting-card">
                    <div className="setting-card-head">
                        <h3>Appearance</h3>
                    </div>
                    <p>Switch between light and dark theme.</p>
                    <div className="setting-actions">
                        <button className="btn btn-secondary" onClick={toggleTheme}>
                            {settings.theme === "dark" ? "☀ Light Mode" : "☽ Dark Mode"}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="setting-card">
                    <div className="setting-card-head">
                        <h3>Notifications</h3>
                        <span className={`badge ${settings.notifications ? "badge-primary" : ""}`}>
                            {settings.notifications ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                    <p>Allow browser notifications for reminder alerts.</p>
                    <div className="setting-actions">
                        <button className="btn btn-secondary" onClick={requestNotifications}>
                            Request Permission
                        </button>
                    </div>
                </div>

                {/* Data */}
                <div className="setting-card">
                    <div className="setting-card-head">
                        <h3>Data</h3>
                    </div>
                    <p>Export a backup of your data or clear all stored data.</p>
                    <div className="setting-actions">
                        <button className="btn btn-secondary" onClick={exportData}>⬇ Export Backup</button>
                        <button
                            className="btn btn-danger"
                            onClick={() => { if (window.confirm("Clear ALL data? This cannot be undone.")) clearAllData(); }}
                        >
                            🗑 Clear All Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="setting-card" style={{ marginTop: 2 }}>
                <div className="setting-card-head">
                    <h3>Account</h3>
                </div>
                <p>Signed in as <strong>{currentUser?.username}</strong> ({currentUser?.role})</p>
                <div className="setting-actions">
                    <button className="btn btn-danger-solid" onClick={logout}>Sign Out</button>
                </div>
            </div>
        </>
    );
}
