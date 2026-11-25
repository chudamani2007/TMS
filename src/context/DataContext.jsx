import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    STORAGE,
    clearAllStorage,
    ensureDefaultSettings,
    exportTaskflowBackup,
    getData,
    setData
} from "../services/storage";
import {
    formatDate,
    getAssignment,
    isAdmin,
    reminderTimestamp,
    uid
} from "../utils/helpers";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const { currentUser, users, removeUserFromList } = useAuth();
    const { showToast } = useToast();

    const [tasks, setTasks] = useState(() => getData(STORAGE.tasks, []));
    const [projects, setProjects] = useState(() => getData(STORAGE.projects, []));
    const [reminders, setReminders] = useState(() => getData(STORAGE.reminders, []));
    const [settings, setSettings] = useState(() => ensureDefaultSettings());

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            settings.theme === "dark" ? "dark" : "light"
        );
    }, [settings.theme]);

    const persistTasks = useCallback(next => {
        setTasks(next);
        setData(STORAGE.tasks, next);
    }, []);

    const persistProjects = useCallback(next => {
        setProjects(next);
        setData(STORAGE.projects, next);
    }, []);

    const persistReminders = useCallback(next => {
        setReminders(next);
        setData(STORAGE.reminders, next);
    }, []);

    const persistSettings = useCallback(next => {
        setSettings(next);
        setData(STORAGE.settings, next);
    }, []);

    // Reminder background checker (every 60s + on user/reminder change)
    useEffect(() => {
        if (!currentUser) return;

        const checkReminders = () => {
            const now = Date.now();
            let changed = false;

            const updated = reminders.map(reminder => {
                if (reminder.completed) return reminder;
                if (!reminder.userIds?.includes(currentUser.id)) return reminder;

                const due = reminderTimestamp(reminder);
                const reminderTime = due - reminder.offsetMinutes * 60 * 1000;

                if (now >= reminderTime && !reminder.notified) {
                    if (
                        settings.notifications &&
                        "Notification" in window &&
                        Notification.permission === "granted"
                    ) {
                        new Notification("TaskFlow Reminder", {
                            body: `${reminder.title} — due ${formatDate(reminder.date)} at ${reminder.time}`
                        });
                    }
                    changed = true;
                    showToast(`Reminder: ${reminder.title}`, "success");
                    return { ...reminder, notified: true };
                }
                return reminder;
            });

            if (changed) {
                persistReminders(updated);
            }
        };

        checkReminders();
        const interval = setInterval(checkReminders, 60000);
        return () => clearInterval(interval);
    }, [currentUser, reminders, settings.notifications, persistReminders, showToast]);

    const saveTask = useCallback((existingTask, payload) => {
        if (!currentUser) return false;
        if (currentUser.mode === "team" && !isAdmin(currentUser)) {
            showToast("Only the admin can create or edit team tasks.", "error");
            return false;
        }

        if (currentUser.mode === "team" && (!payload.assignedUsers || payload.assignedUsers.length === 0)) {
            showToast("Select at least one team member.", "error");
            return false;
        }

        let assignments;
        if (currentUser.mode === "individual") {
            const old = existingTask?.assignments?.find(a => a.userId === currentUser.id);
            assignments = [old || { userId: currentUser.id, completed: false, completedAt: null }];
        } else {
            assignments = payload.assignedUsers.map(userId => {
                const old = existingTask?.assignments?.find(a => a.userId === userId);
                return old || { userId, completed: false, completedAt: null };
            });
        }

        const projectId = payload.projectId || null;

        if (existingTask) {
            const next = tasks.map(t =>
                t.id === existingTask.id
                    ? {
                        ...t,
                        title: payload.title.trim(),
                        description: payload.description.trim(),
                        projectId,
                        priority: payload.priority,
                        dueDate: payload.dueDate,
                        assignments
                    }
                    : t
            );
            persistTasks(next);
            showToast("Task updated.", "success");
        } else {
            const newTask = {
                id: uid("task"),
                title: payload.title.trim(),
                description: payload.description.trim(),
                projectId,
                priority: payload.priority,
                dueDate: payload.dueDate,
                assignments,
                favorite: false,
                createdBy: currentUser.id,
                createdAt: new Date().toISOString()
            };
            persistTasks([...tasks, newTask]);
            showToast("Task created.", "success");
        }
        return true;
    }, [currentUser, tasks, persistTasks, showToast]);

    const toggleTask = useCallback(taskId => {
        if (!currentUser) return;
        const target = tasks.find(t => t.id === taskId);
        if (!target) return;

        let assignment = getAssignment(target, currentUser.id);
        let nextAssignments = [...(target.assignments || [])];

        if (!assignment) {
            if (currentUser.mode === "individual") {
                assignment = { userId: currentUser.id, completed: false, completedAt: null };
                nextAssignments.push(assignment);
            } else {
                return;
            }
        }

        const nextCompleted = !assignment.completed;
        nextAssignments = nextAssignments.map(a =>
            a.userId === currentUser.id
                ? {
                    ...a,
                    completed: nextCompleted,
                    completedAt: nextCompleted ? new Date().toISOString() : null
                }
                : a
        );

        persistTasks(tasks.map(t => (t.id === taskId ? { ...t, assignments: nextAssignments } : t)));
        showToast(nextCompleted ? "Task marked complete." : "Task reopened.", "success");
    }, [currentUser, tasks, persistTasks, showToast]);

    const toggleTaskFavorite = useCallback(taskId => {
        persistTasks(tasks.map(t => (t.id === taskId ? { ...t, favorite: !t.favorite } : t)));
    }, [tasks, persistTasks]);

    const deleteTask = useCallback(taskId => {
        if (currentUser?.mode === "team" && !isAdmin(currentUser)) {
            showToast("Only the admin can delete team tasks.", "error");
            return;
        }
        persistTasks(tasks.filter(t => t.id !== taskId));
        showToast("Task deleted.", "success");
    }, [currentUser, tasks, persistTasks, showToast]);

    const createProject = useCallback(({ name, description }) => {
        if (currentUser?.mode === "team" && !isAdmin(currentUser)) {
            showToast("Only the admin can create team projects.", "error");
            return false;
        }
        const next = [
            ...projects,
            {
                id: uid("project"),
                name: name.trim(),
                description: description.trim(),
                favorite: false,
                createdBy: currentUser.id,
                createdAt: new Date().toISOString()
            }
        ];
        persistProjects(next);
        showToast("Project created.", "success");
        return true;
    }, [currentUser, projects, persistProjects, showToast]);

    const toggleProjectFavorite = useCallback(projectId => {
        persistProjects(projects.map(p => (p.id === projectId ? { ...p, favorite: !p.favorite } : p)));
    }, [projects, persistProjects]);

    const deleteProject = useCallback(projectId => {
        if (currentUser?.mode === "team" && !isAdmin(currentUser)) {
            showToast("Only the admin can delete team projects.", "error");
            return;
        }
        persistProjects(projects.filter(p => p.id !== projectId));
        persistTasks(tasks.filter(t => t.projectId !== projectId));
        showToast("Project deleted.", "success");
    }, [currentUser, projects, tasks, persistProjects, persistTasks, showToast]);

    const saveReminder = useCallback((existingReminder, payload) => {
        if (!currentUser) return false;
        const userIds = payload.userIds;

        if (currentUser.role === "admin" && currentUser.mode === "team" && !userIds.length) {
            showToast("Select at least one recipient.", "error");
            return false;
        }

        if (existingReminder) {
            persistReminders(
                reminders.map(r =>
                    r.id === existingReminder.id
                        ? {
                            ...r,
                            title: payload.title.trim(),
                            description: payload.description.trim(),
                            date: payload.date,
                            time: payload.time,
                            type: payload.type,
                            userIds
                        }
                        : r
                )
            );
            showToast("Reminder updated.", "success");
        } else {
            persistReminders([
                ...reminders,
                {
                    id: uid("reminder"),
                    title: payload.title.trim(),
                    description: payload.description.trim(),
                    date: payload.date,
                    time: payload.time,
                    type: payload.type,
                    offsetMinutes: 1440,
                    userIds,
                    createdBy: currentUser.id,
                    completed: false,
                    favorite: false,
                    notified: false,
                    createdAt: new Date().toISOString()
                }
            ]);
            showToast("Reminder created.", "success");
        }
        return true;
    }, [currentUser, reminders, persistReminders, showToast]);

    const completeReminder = useCallback(reminderId => {
        persistReminders(reminders.map(r => (r.id === reminderId ? { ...r, completed: true } : r)));
    }, [reminders, persistReminders]);

    const reopenReminder = useCallback(reminderId => {
        persistReminders(
            reminders.map(r => (r.id === reminderId ? { ...r, completed: false, notified: false } : r))
        );
    }, [reminders, persistReminders]);

    const toggleReminderFavorite = useCallback(reminderId => {
        persistReminders(reminders.map(r => (r.id === reminderId ? { ...r, favorite: !r.favorite } : r)));
    }, [reminders, persistReminders]);

    const deleteReminder = useCallback(reminderId => {
        persistReminders(reminders.filter(r => r.id !== reminderId));
        showToast("Reminder deleted.", "success");
    }, [reminders, persistReminders, showToast]);

    const removeTeamMember = useCallback(userId => {
        removeUserFromList(userId);
        persistTasks(
            tasks.map(task => ({
                ...task,
                assignments: task.assignments?.filter(a => a.userId !== userId) || []
            }))
        );
        persistReminders(
            reminders.map(reminder => ({
                ...reminder,
                userIds: reminder.userIds?.filter(id => id !== userId) || []
            }))
        );
        showToast("User removed.", "success");
    }, [removeUserFromList, tasks, reminders, persistTasks, persistReminders, showToast]);

    const toggleTheme = useCallback(() => {
        const nextTheme = settings.theme === "dark" ? "light" : "dark";
        persistSettings({ ...settings, theme: nextTheme });
    }, [settings, persistSettings]);

    const requestNotifications = useCallback(async () => {
        if (!("Notification" in window)) {
            showToast("This browser does not support notifications.", "error");
            return;
        }
        const permission = await Notification.requestPermission();
        const granted = permission === "granted";
        persistSettings({ ...settings, notifications: granted });
        if (granted) {
            showToast("Browser notifications enabled.", "success");
        } else {
            showToast("Notification permission was not granted.", "error");
        }
    }, [settings, persistSettings, showToast]);

    const exportData = useCallback(() => {
        exportTaskflowBackup({ users, tasks, projects, reminders });
        showToast("TaskFlow data exported.", "success");
    }, [users, tasks, projects, reminders, showToast]);

    const clearAllData = useCallback(() => {
        clearAllStorage();
        location.reload();
    }, []);

    return (
        <DataContext.Provider
            value={{
                tasks,
                projects,
                reminders,
                settings,
                saveTask,
                toggleTask,
                toggleTaskFavorite,
                deleteTask,
                createProject,
                toggleProjectFavorite,
                deleteProject,
                saveReminder,
                completeReminder,
                reopenReminder,
                toggleReminderFavorite,
                deleteReminder,
                removeTeamMember,
                toggleTheme,
                requestNotifications,
                exportData,
                clearAllData
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be used within DataProvider");
    return ctx;
};
