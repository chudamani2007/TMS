import { useState } from "react";
import { useData } from "../context/DataContext.jsx";

export default function ProjectModal({ project, onClose }) {
    const { createProject } = useData();
    const [form, setForm] = useState({ name: project?.name || "", description: project?.description || "" });

    const handleSubmit = e => {
        e.preventDefault();
        const ok = createProject(form);
        if (ok) onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>{project ? "Edit Project" : "New Project"}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Project Name *</label>
                        <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Project" required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" rows={3} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{project ? "Update Project" : "Create Project"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
