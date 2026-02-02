import { create } from "zustand";

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    status: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    pendingVerificationEmail: string | null;
    setAuth:(user: User, accessToken: string) => void;
    setAccessToken:(accessToken: string) => void;
    setPendingVerificationEmail:(email: string) => void;
    logout:() => void;
}

export const useAuthStore = create<AuthState>((set)=>({
    user: null,
    accessToken: null,
    pendingVerificationEmail: null,
    setAuth: (user, accessToken) => set({user, accessToken}),
    setAccessToken: (accessToken) => set({accessToken}),
    setPendingVerificationEmail: (email) => set({pendingVerificationEmail: email}),
    logout: () => set({user: null, accessToken: null, pendingVerificationEmail: null}),
}));

export const authStore = useAuthStore;