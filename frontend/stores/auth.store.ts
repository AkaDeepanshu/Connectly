import { create } from "zustand";

interface AuthState {
    user: any | null;
    accessToken: string | null;
    setAuth:(user: any, accessToken: string) => void;
    setAccessToken:(accessToken: string) => void;
    logout:() => void;
}

export const authStore = create<AuthState>((set)=>({
    user: null,
    accessToken: null,
    setAuth: (user, accessToken) => set({user, accessToken}),
    setAccessToken: (accessToken) => set({accessToken}),
    logout: () => set({user: null, accessToken: null}),
}));