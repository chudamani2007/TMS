import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE, getData, removeData, setData } from "../services/storage";
import { uid } from "../utils/helpers";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { showToast } = useToast();

    const [users, setUsers] = useState(() => getData(STORAGE.users, []));
    const [session, setSession] = useState(() => getData(STORAGE.session, null));

    const currentUser = useMemo(() => {
        if (!session) return null;
        return users.find(u => u.id === session.userId) || null;
    }, [session, users]);

    useEffect(() => {
        setData(STORAGE.users, users);
    }, [users]);

    const login = useCallback((username, password, mode) => {
        const trimmed = username.trim().toLowerCase();
        const user = users.find(
            u =>
                u.username.toLowerCase() === trimmed &&
                u.password === password &&
                (mode === "individual" ? u.mode === "individual" : u.mode === "team")
        );

        if (!user) {
            return { ok: false, error: "Incorrect username or password." };
        }

        const nextSession = { userId: user.id };
        setSession(nextSession);
        setData(STORAGE.session, nextSession);
        return { ok: true, user };
    }, [users]);

    const logout = useCallback(() => {
        setSession(null);
        removeData(STORAGE.session);
    }, []);

    const registerIndividual = useCallback(({ name, username, email, password }) => {
        const cleanUsername = username.trim();
        if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
            showToast("Username already exists.", "error");
            return false;
        }

        const newUser = {
            id: uid("user"),
            name: name.trim(),
            username: cleanUsername,
            email: email.trim(),
            password,
            role: "user",
            mode: "individual",
            createdAt: new Date().toISOString()
        };

        const nextUsers = [...users, newUser];
        setUsers(nextUsers);
        setData(STORAGE.users, nextUsers);
        showToast("Account created successfully.", "success");
        return true;
    }, [users, showToast]);

    const registerAdmin = useCallback(({ name, username, email, password }) => {
        const cleanUsername = username.trim();
        if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
            showToast("Admin username already exists.", "error");
            return null;
        }

        const admin = {
            id: uid("user"),
            name: name.trim(),
            username: cleanUsername,
            email: email.trim(),
            password,
            role: "admin",
            mode: "team",
            createdAt: new Date().toISOString()
        };

        const nextUsers = [...users, admin];
        setUsers(nextUsers);
        setData(STORAGE.users, nextUsers);
        return admin;
    }, [users, showToast]);

    const createTeamMembers = useCallback((adminId, members) => {
        const newUsers = [];
        for (const member of members) {
            const cleanUsername = member.username.trim();
            if (
                users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase()) ||
                newUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())
            ) {
                showToast(`Username ${cleanUsername} already exists.`, "error");
                return false;
            }

            newUsers.push({
                id: uid("user"),
                name: member.name.trim(),
                username: cleanUsername,
                email: member.email.trim(),
                password: member.password,
                role: "user",
                mode: "team",
                adminId,
                createdAt: new Date().toISOString()
            });
        }

        const nextUsers = [...users, ...newUsers];
        setUsers(nextUsers);
        setData(STORAGE.users, nextUsers);
        showToast("Team created successfully.", "success");
        return true;
    }, [users, showToast]);

    const addTeamMember = useCallback(({ name, username, email, password }) => {
        const cleanUsername = username.trim();
        if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
            showToast("Username already exists.", "error");
            return false;
        }

        const member = {
            id: uid("user"),
            name: name.trim(),
            username: cleanUsername,
            email: email.trim(),
            password,
            role: "user",
            mode: "team",
            adminId: currentUser?.id,
            createdAt: new Date().toISOString()
        };

        const nextUsers = [...users, member];
        setUsers(nextUsers);
        setData(STORAGE.users, nextUsers);
        showToast("Team member added.", "success");
        return true;
    }, [users, currentUser, showToast]);

    const updateProfile = useCallback(({ name, email }) => {
        if (!currentUser) return;
        const nextUsers = users.map(u =>
            u.id === currentUser.id
                ? { ...u, name: name.trim(), email: email.trim() }
                : u
        );
        setUsers(nextUsers);
        setData(STORAGE.users, nextUsers);
        showToast("Profile updated.", "success");
    }, [users, currentUser, showToast]);

    const removeUserFromList = useCallback(userId => {
        const nextUsers = users.filter(u => u.id !== userId);
        setUsers(nextUsers);
        setData(STORAGE.users, nextUsers);
    }, [users]);

    const setWorkspaceMode = useCallback(mode => {
        setData(STORAGE.mode, mode);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                users,
                currentUser,
                login,
                logout,
                registerIndividual,
                registerAdmin,
                createTeamMembers,
                addTeamMember,
                updateProfile,
                removeUserFromList,
                setWorkspaceMode
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
