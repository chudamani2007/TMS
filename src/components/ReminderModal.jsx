import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { todayISO } from "../utils/helpers.js";

export default function ReminderModal({ reminder, onClose }) {
    const { saveReminder } = useData();
    const { currentUser } = useAuth();

    const [form, setForm] = useState({
        title: reminder?.title || "",
        description: reminder?.description || "",
        date: reminder?.date || todayISO(),
        time: reminder?.time || "09:00",
        type: reminder?.type || "once",
        userIds: reminder?.userIds || (currentUser ? [currentUser.id] : [])
    });

    const handleSubmit = e => {
        e.preventDefault();
        const ok = saveReminder(reminder || null, form);
        if (ok) onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>{reminder ? "Edit Reminder" : "New Reminder"}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Reminder title" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional note…" rows={2} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input type="time" className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{reminder ? "Update Reminder" : "Create Reminder"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
