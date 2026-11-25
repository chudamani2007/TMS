export const uid = prefix =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const todayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatDate = date => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

export const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};

export const getInitials = name =>
    String(name || "?")
        .trim()
        .split(/\s+/)
        .map(x => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";

export const isAdmin = user => user?.role === "admin";

export const canManageTasks = user => {
    if (!user) return false;
    return user.mode === "individual" || user.role === "admin";
};

export const canManageProjects = user => {
    if (!user) return false;
    return user.mode === "individual" || user.role === "admin";
};

export const taskHasUser = (task, userId) =>
    Array.isArray(task.assignments) &&
    task.assignments.some(a => a.userId === userId);

export const getAssignment = (task, userId) =>
    task.assignments?.find(a => a.userId === userId);

export const isTaskCompletedForUser = (task, userId) =>
    getAssignment(task, userId)?.completed === true;

export const isTaskOverdue = (task, userId) => {
    if (!task?.dueDate) return false;
    if (isTaskCompletedForUser(task, userId)) return false;
    return task.dueDate < todayISO();
};

export const taskProgress = task => {
    if (!task.assignments?.length) return 0;
    const completed = task.assignments.filter(a => a.completed).length;
    return Math.round((completed / task.assignments.length) * 100);
};

export const projectProgress = (projectId, tasks) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    let totalAssignments = 0;
    let completedAssignments = 0;

    projectTasks.forEach(task => {
        task.assignments?.forEach(a => {
            totalAssignments++;
            if (a.completed) completedAssignments++;
        });
    });

    if (!totalAssignments) return 0;
    return Math.round((completedAssignments / totalAssignments) * 100);
};

export const visibleTasksForUser = (tasks, user, users) => {
    if (!user) return [];

    if (user.mode === "individual") {
        return tasks.filter(
            task => task.createdBy === user.id || taskHasUser(task, user.id)
        );
    }

    if (user.role === "admin") {
        const individualUserIds = new Set(
            users.filter(u => u.mode === "individual").map(u => u.id)
        );
        return tasks.filter(task => !individualUserIds.has(task.createdBy));
    }

    return tasks.filter(task => taskHasUser(task, user.id));
};

export const projectForUser = (project, user, tasks, users) => {
    if (!user) return false;

    if (user.mode === "individual") {
        return project.createdBy === user.id || !project.createdBy;
    }

    if (user.role === "admin") {
        const individualUserIds = new Set(
            users.filter(u => u.mode === "individual").map(u => u.id)
        );
        return !individualUserIds.has(project.createdBy);
    }

    return tasks.some(
        task => task.projectId === project.id && taskHasUser(task, user.id)
    );
};

export const visibleRemindersForUser = (reminders, user, users) => {
    if (!user) return [];

    if (user.mode === "individual") {
        return reminders.filter(
            reminder =>
                reminder.createdBy === user.id ||
                reminder.userIds?.includes(user.id)
        );
    }

    if (user.role === "admin") {
        const individualUserIds = new Set(
            users.filter(u => u.mode === "individual").map(u => u.id)
        );
        return reminders.filter(r => !individualUserIds.has(r.createdBy));
    }

    return reminders.filter(
        reminder =>
            reminder.createdBy === user.id ||
            reminder.userIds?.includes(user.id)
    );
};

export const reminderTimestamp = reminder =>
    new Date(`${reminder.date}T${reminder.time}`).getTime();
