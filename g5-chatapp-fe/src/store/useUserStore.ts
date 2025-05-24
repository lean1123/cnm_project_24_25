import api from "@/api/api";
import type { User } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";

interface iUserStore {
    user: User | null;
    searchResults: User[] | null;
    isSearching: boolean;
    errorSearching: string | null;
    isLoading: boolean;
    error: string | null;
    getUserById: (userId: string) => Promise<User | null>;
    searchUsers: (keyword: string) => Promise<void>;
}

export const useUserStore = create<iUserStore>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,
    searchResults: [],
    isSearching: false,
    errorSearching: null,
    getUserById: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get(`/users/${userId}`);
            if (data.success) {
                set({ user: data.data });
                return data.data;
            }
        } catch (error) {
            set({ error: "Failed to fetch user" });
            return null;
        } finally {
            set({ isLoading: false });
        }
    },
    searchUsers: async (keyword: string) => {
        set({ isSearching: true, errorSearching: null });
        try {
            const { data } = await api.get(`/users/search?keyword=${keyword}`);
            if (data.success) {
                set({ searchResults: data.data });
            }
        } catch (error) {
            set({ errorSearching: "Failed to search users" });
            toast.error("Failed to search users. Please try again.");
        } finally {
            set({ isSearching: false });
        }
    },
}));