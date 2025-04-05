import { DataLogin, DataRegister, User } from "@/types";
import { create } from "zustand";
import api from "@/api/api";
import Cookies from "js-cookie";
import { login, logout, myProfile, register } from "@/api/auth";

interface iAuthStore {
  isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (dataLogin: DataLogin) => Promise<void>;
    register: (dataRegister: DataRegister) => Promise<void>;
    logout: () => void;
    getMyProfile: () => Promise<void>;
}

export const useAuthStore = create<iAuthStore>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (dataLogin: DataLogin) => {
        set({ isLoading: true, error: null });
        try {
            const data = await login(dataLogin);
            set({ user: data.user, isAuthenticated: true });
        } catch (error) {
            set({ error: "Login failed" });
        } finally {
            set({ isLoading: false });
        }
    },
    register: async (dataRegister: DataRegister) => {
        set({ isLoading: true, error: null });
        try {
            const data = await register(dataRegister);
            set({ user: data.user, isAuthenticated: true });
        } catch (error) {
            set({ error: "Registration failed" });
        } finally {
            set({ isLoading: false });
        }
    },
    logout: async () => {
        await logout();
        set({ user: null, isAuthenticated: false });
    },
    getMyProfile: async () => {
        set({ isLoading: true, error: null });
        const id = get().user?._id;
        try {
            const data = await myProfile(id!);
            set({ user: data });
            Cookies.set("refreshToken", data.refreshToken, { expires: 7, secure: true, sameSite: "Strict" });
        } catch (error) {
            set({ error: "Failed to fetch profile" });
        } finally {
            set({ isLoading: false });
        }
    }
}));
