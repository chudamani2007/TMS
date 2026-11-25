import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { todayISO } from "../utils/helpers.js";

export default function TaskModal({ task, onClose }) {
    const { saveTask } = useData();
    const { currentUser, users } = useAuth();

    const teamMembers = users.filter(u => u.mode === "team" && u.adminId === currentUser?.id);

    const [form, setForm] = useState({
        title: task?.title || "",
        description: task?.description || "",
        priority: task?.priority || "medium",
        dueDate: task?.dueDate || todayISO(),
        projectId: task?.projectId || "",
        assignedUsers: task?.assignments?.map(a => a.userId) || (currentUser ? [currentUser.id] : [])
    });

    const handleSubmit = e => {
        e.preventDefault();
        const ok = saveTask(task || null, form);
        if (ok) onClose();
    };

    const toggleMember = id => {
        setForm(f => ({
            ...f,
            assignedUsers: f.assignedUsers.includes(id)
                ? f.assignedUsers.filter(x => x !== id)
                : [...f.assignedUsers, id]
        }));
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>{task ? "Edit Task" : "New Task"}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description…" rows={3} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                        </div>
                    </div>

                    {currentUser?.mode === "team" && teamMembers.length > 0 && (
                        <div className="form-group">
                            <label>Assign To</label>
                            <div className="checkbox-grid">
                                {teamMembers.map(m => (
                                    <label key={m.id} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={form.assignedUsers.includes(m.id)}
                                            onChange={() => toggleMember(m.id)}
                                        />
                                        {m.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{task ? "Update Task" : "Create Task"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
