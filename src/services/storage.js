export const STORAGE = {
    users: "taskflow_users_v3",
    session: "taskflow_session_v3",
    tasks: "taskflow_tasks_v3",
    projects: "taskflow_projects_v3",
    reminders: "taskflow_reminders_v3",
    settings: "taskflow_settings_v3",
    mode: "taskflow_mode_v3"
};

export const getData = (key, fallback = []) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

export const setData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const removeData = key => {
    localStorage.removeItem(key);
};

export const clearAllStorage = () => {
    Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
};

export const ensureDefaultSettings = () => {
    if (!localStorage.getItem(STORAGE.settings)) {
        setData(STORAGE.settings, {
            theme: "light",
            notifications: false
        });
    }
    return getData(STORAGE.settings, { theme: "light", notifications: false });
};

export const exportTaskflowBackup = ({ users, tasks, projects, reminders }) => {
    const data = {
        users,
        tasks,
        projects,
        reminders,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taskflow-backup.json";
    a.click();
    URL.revokeObjectURL(url);
};
