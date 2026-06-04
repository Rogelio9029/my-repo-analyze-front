import { create } from "zustand";

interface User {
    id: string;
    role: string;
}

interface AuthStore {
    token: string | null;
    user: User | null;

    setAuth: (token: string) => void;

    logout: () => void;
}

function decodeUserFromToken(token: string | null): User | null {
    if (!token) return null;

    try {
        const payload = token.split(".")[1];

        const decoded = JSON.parse(atob(payload)) as User;

        return {
            id: decoded.id,
            role: decoded.role,
        };
    } catch {
        return null;
    }
}

const storedToken = localStorage.getItem("token");

export const useAuthStore = create<AuthStore>((set) => ({
    token: storedToken,

    user: decodeUserFromToken(storedToken),

    setAuth: (token) => {
        localStorage.setItem("token", token);

        set({
            token,
            user: decodeUserFromToken(token),
        });
    },

    logout: () => {
        localStorage.removeItem("token");

        localStorage.removeItem("github_linked");

        set({
            token: null,
            user: null,
        });
    },
}));
