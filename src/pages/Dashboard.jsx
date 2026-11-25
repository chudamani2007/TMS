import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { getGreeting, getInitials, isAdmin, visibleTasksForUser, visibleRemindersForUser, formatDate, isTaskOverdue } from "../utils/helpers.js";
import TaskModal from "../components/TaskModal.jsx";
import ProjectModal from "../components/ProjectModal.jsx";
import ReminderModal from "../components/ReminderModal.jsx";
import SettingsPanel from "../components/SettingsPanel.jsx";

const NAV_ITEMS = [
    { id: "Dashboard", icon: "⊞" },
    { id: "Tasks", icon: "✓" },
    { id: "Projects", icon: "◈" },
    { id: "Reminders", icon: "⏰" },
    { id: "Settings", icon: "⚙" },
];

export default function Dashboard() {
    const { currentUser, users, logout } = useAuth();
    const { tasks, projects, reminders, toggleTask, toggleTaskFavorite, deleteTask, toggleProjectFavorite, deleteProject, completeReminder, deleteReminder, settings, toggleTheme } = useData();

    const [activeNav, setActiveNav] = useState("Dashboard");
    const [taskModal, setTaskModal] = useState(null);
    const [projectModal, setProjectModal] = useState(null);
    const [reminderModal, setReminderModal] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const myTasks = visibleTasksForUser(tasks, currentUser, users);
    const myReminders = visibleRemindersForUser(reminders, currentUser, users);
    const myProjects = currentUser?.mode === "individual"
        ? projects.filter(p => p.createdBy === currentUser.id)
        : isAdmin(currentUser)
            ? projects
            : projects.filter(p => myTasks.some(t => t.projectId === p.id));

    const doneTasks = myTasks.filter(t => t.assignments?.find(a => a.userId === currentUser.id)?.completed);
    const pendingTasks = myTasks.filter(t => !t.assignments?.find(a => a.userId === currentUser.id)?.completed);
    const overdueTasks = myTasks.filter(t => isTaskOverdue(t, currentUser.id));

    return (
        <div className="app-layout">
            {/* Backdrop (mobile) */}
            <div
                className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="brand">
                    <div className="brand-lockup">
                        <div className="brand-mark">
                            <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
                                <path d="M9.5 16.5L14 21L22.5 11.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2>Task<span>Flow</span></h2>
                    </div>
                    <span className="workspace-pill">{currentUser?.mode === "team" ? "Team" : "Solo"}</span>
                    <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                <div className="user-mini">
                    <div className="avatar">{getInitials(currentUser?.name)}</div>
                    <div className="user-mini-meta">
                        <strong>{currentUser?.name}</strong>
                        <small>{currentUser?.role} · {currentUser?.mode}</small>
                    </div>
                </div>

                <nav className="nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                            onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                        >
                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                            <span className="nav-label">{item.id}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button className="sidebar-btn sidebar-btn-danger" onClick={logout}>
                        ⏻ Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main">
                <header className="topbar">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                    </button>
                    <div className="topbar-title-wrap">
                        <h1>{activeNav}</h1>
                    </div>
                    <div />
                    <div className="top-actions">
                        <button
                            className="btn btn-secondary btn-icon"
                            onClick={toggleTheme}
                            title={settings.theme === "dark" ? "Light mode" : "Dark mode"}
                        >
                            {settings.theme === "dark" ? "☀" : "☽"}
                        </button>
                    </div>
                </header>

                <div className="content">
                    <div className="page">
                        {activeNav === "Dashboard" && (
                            <DashboardView
                                greeting={getGreeting()}
                                name={currentUser?.name}
                                pendingTasks={pendingTasks}
                                doneTasks={doneTasks}
                                overdueTasks={overdueTasks}
                                myProjects={myProjects}
                                myReminders={myReminders}
                                onNewTask={() => setTaskModal("new")}
                            />
                        )}
                        {activeNav === "Tasks" && (
                            <TasksView
                                tasks={myTasks}
                                currentUser={currentUser}
                                onToggle={toggleTask}
                                onFavorite={toggleTaskFavorite}
                                onEdit={t => setTaskModal(t)}
                                onDelete={deleteTask}
                                onNew={() => setTaskModal("new")}
                            />
                        )}
                        {activeNav === "Projects" && (
                            <ProjectsView
                                projects={myProjects}
                                tasks={myTasks}
                                onFavorite={toggleProjectFavorite}
                                onDelete={deleteProject}
                                onNew={() => setProjectModal("new")}
                            />
                        )}
                        {activeNav === "Reminders" && (
                            <RemindersView
                                reminders={myReminders}
                                onComplete={completeReminder}
                                onDelete={deleteReminder}
                                onEdit={r => setReminderModal(r)}
                                onNew={() => setReminderModal("new")}
                            />
                        )}
                        {activeNav === "Settings" && <SettingsPanel />}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {taskModal && <TaskModal task={taskModal === "new" ? null : taskModal} onClose={() => setTaskModal(null)} />}
            {projectModal && <ProjectModal project={projectModal === "new" ? null : projectModal} onClose={() => setProjectModal(null)} />}
            {reminderModal && <ReminderModal reminder={reminderModal === "new" ? null : reminderModal} onClose={() => setReminderModal(null)} />}
        </div>
    );
}

/* ── Sub-views ─────────────────────────────────────────── */

function DashboardView({ greeting, name, pendingTasks, doneTasks, overdueTasks, myProjects, myReminders, onNewTask }) {
    return (
        <>
            <div className="page-header">
                <div>
                    <h2>{greeting}, {name?.split(" ")[0]}! 👋</h2>
                    <p>Here&apos;s your workspace overview.</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={onNewTask}>+ New Task</button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-body">
                        <small>Pending Tasks</small>
                        <strong>{pendingTasks.length}</strong>
                    </div>
                    <div className="stat-icon">📋</div>
                </div>
                <div className="stat-card stat-success">
                    <div className="stat-body">
                        <small>Completed</small>
                        <strong>{doneTasks.length}</strong>
                    </div>
                    <div className="stat-icon" style={{ background: "var(--success-soft)", color: "var(--success-text)" }}>✓</div>
                </div>
                <div className="stat-card stat-danger">
                    <div className="stat-body">
                        <small>Overdue</small>
                        <strong>{overdueTasks.length}</strong>
                    </div>
                    <div className="stat-icon" style={{ background: "var(--danger-soft)", color: "var(--danger-text)" }}>!</div>
                </div>
                <div className="stat-card">
                    <div className="stat-body">
                        <small>Projects</small>
                        <strong>{myProjects.length}</strong>
                    </div>
                    <div className="stat-icon">◈</div>
                </div>
                <div className="stat-card stat-warning">
                    <div className="stat-body">
                        <small>Reminders</small>
                        <strong>{myReminders.filter(r => !r.completed).length}</strong>
                    </div>
                    <div className="stat-icon" style={{ background: "var(--warning-soft)", color: "var(--warning-text)" }}>⏰</div>
                </div>
            </div>

            {pendingTasks.length > 0 && (
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title">
                            <h3>Upcoming Tasks</h3>
                        </div>
                    </div>
                    <div className="task-list">
                        {pendingTasks.slice(0, 5).map(t => (
                            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                                <span style={{ flex: 1, fontWeight: 500, fontSize: 13.5 }}>{t.title}</span>
                                {t.dueDate && <span style={{ fontSize: 12, color: "var(--muted)" }}>{formatDate(t.dueDate)}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function TasksView({ tasks, currentUser, onToggle, onFavorite, onEdit, onDelete, onNew }) {
    const [filter, setFilter] = useState("all");
    const filtered = tasks.filter(t => {
        const assignment = t.assignments?.find(a => a.userId === currentUser.id);
        if (filter === "pending") return !assignment?.completed;
        if (filter === "done") return assignment?.completed;
        if (filter === "overdue") return isTaskOverdue(t, currentUser.id);
        if (filter === "favorite") return t.favorite;
        return true;
    });

    return (
        <>
            <div className="page-header">
                <div><h2>Tasks</h2><p>{tasks.length} total</p></div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={onNew}>+ New Task</button>
                </div>
            </div>

            <div className="view-toggle">
                {["all", "pending", "done", "overdue", "favorite"].map(f => (
                    <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">📋</div>
                    <strong>No {filter} tasks</strong>
                    <span>Create a new task to get started.</span>
                </div>
            ) : (
                <div className="task-list">
                    {filtered.map(task => {
                        const assignment = task.assignments?.find(a => a.userId === currentUser.id);
                        const done = assignment?.completed;
                        const overdue = isTaskOverdue(task, currentUser.id);
                        return (
                            <div key={task.id} className={`task-card ${done ? "completed" : ""}`}>
                                <div className="task-check-wrap">
                                    <input
                                        type="checkbox"
                                        className="task-check"
                                        checked={!!done}
                                        onChange={() => onToggle(task.id)}
                                    />
                                </div>
                                <div className="task-info">
                                    <div className="task-title-row">
                                        <button className="task-title-btn" onClick={() => onEdit(task)}>{task.title}</button>
                                        {overdue && <span className="badge badge-overdue">Overdue</span>}
                                    </div>
                                    {task.description && <p className="task-desc">{task.description}</p>}
                                    <div className="task-badges">
                                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                        {task.dueDate && <span className="badge">{formatDate(task.dueDate)}</span>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                                    <button
                                        className={`btn btn-icon btn-small ${task.favorite ? "btn-favorite is-favorite" : "btn-ghost"}`}
                                        onClick={() => onFavorite(task.id)}
                                        title="Favourite"
                                    >★</button>
                                    <button className="btn btn-secondary btn-small" onClick={() => onEdit(task)}>Edit</button>
                                    <button className="btn btn-danger btn-small" onClick={() => onDelete(task.id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

function ProjectsView({ projects, tasks, onFavorite, onDelete, onNew }) {
    return (
        <>
            <div className="page-header">
                <div><h2>Projects</h2><p>{projects.length} projects</p></div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={onNew}>+ New Project</button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">◈</div>
                    <strong>No projects yet</strong>
                    <span>Create your first project to organise your tasks.</span>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => {
                        const projectTasks = tasks.filter(t => t.projectId === project.id);
                        const doneTasks = projectTasks.filter(t => t.assignments?.some(a => a.completed)).length;
                        const pct = projectTasks.length ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
                        return (
                            <div key={project.id} className="project-card">
                                <div className="project-header">
                                    <h3>{project.name}</h3>
                                    <button
                                        className={`btn btn-icon btn-small ${project.favorite ? "btn-favorite is-favorite" : "btn-ghost"}`}
                                        onClick={() => onFavorite(project.id)}
                                    >★</button>
                                </div>
                                {project.description && <p>{project.description}</p>}
                                <div className="project-progress-meta">
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{doneTasks}/{projectTasks.length} tasks done</span>
                                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{pct}%</span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="project-stats">
                                    <div className="project-stat">
                                        <small>Total Tasks</small>
                                        <strong>{projectTasks.length}</strong>
                                    </div>
                                    <div className="project-stat">
                                        <small>Completed</small>
                                        <strong>{doneTasks}</strong>
                                    </div>
                                </div>
                                <button className="btn btn-danger btn-small" onClick={() => onDelete(project.id)}>Delete Project</button>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

function RemindersView({ reminders, onComplete, onDelete, onEdit, onNew }) {
    return (
        <>
            <div className="page-header">
                <div><h2>Reminders</h2><p>{reminders.filter(r => !r.completed).length} active</p></div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={onNew}>+ New Reminder</button>
                </div>
            </div>

            {reminders.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">⏰</div>
                    <strong>No reminders yet</strong>
                    <span>Set a reminder to stay on top of important deadlines.</span>
                </div>
            ) : (
                <div className="reminder-grid">
                    {reminders.map(r => (
                        <div key={r.id} className={`reminder-card ${r.completed ? "completed" : ""}`}>
                            <div className="reminder-top">
                                <div>
                                    <h3>{r.title}</h3>
                                    {r.description && <p>{r.description}</p>}
                                </div>
                            </div>
                            <div className="reminder-meta">
                                <span className="reminder-meta-item">📅 {formatDate(r.date)}</span>
                                <span className="reminder-meta-item">⏰ {r.time}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {!r.completed && (
                                    <button className="btn btn-success btn-small" onClick={() => onComplete(r.id)}>✓ Done</button>
                                )}
                                <button className="btn btn-secondary btn-small" onClick={() => onEdit(r)}>Edit</button>
                                <button className="btn btn-danger btn-small" onClick={() => onDelete(r.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
