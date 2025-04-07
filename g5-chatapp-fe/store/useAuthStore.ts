import { DataLogin, DataRegister, User } from "@/types";
import { create } from "zustand";
import {
  login,
  logout,
  myProfile,
  provideOtp,
  register,
  verifyOtp,
} from "@/api/authApi";
import { toast } from "sonner";
import { persist } from "zustand/middleware";

interface iAuthStore {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  userRegistrationId: string | null;
  login: (dataLogin: DataLogin) => Promise<void>;
  register: (dataRegister: DataRegister) => Promise<void>;
  logout: () => void;
  getMyProfile: () => Promise<void>;
  verifyOtp: (userId: string, otp: string) => Promise<void>;
  provideOtp: (userId: string) => Promise<void>;
}

export const useAuthStore = create<iAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userRegistrationId: null,

      login: async (dataLogin: DataLogin) => {
        set({ isLoading: true, error: null });
        try {
          const data = await login(dataLogin);
          set({ user: data.user, isAuthenticated: true });
          toast.success("Login successful!");
          setTimeout(() => {
            window.location.href = "/conversations";
          }, 1000);
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
          set({ userRegistrationId: data });
          setTimeout(() => {
            window.location.href = `/verify-otp`;
          }, 500);
        } catch (error) {
          set({ error: "Registration failed" });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async () => {
        await logout();
        useAuthStore.persist.clearStorage(); // Clear the persisted state
        useAuthStore.persist.rehydrate(); // Rehydrate the store to its initial state
        set({ user: null, isAuthenticated: false });
      },
      getMyProfile: async () => {
        set({ isLoading: true, error: null });
        const id = get().user?.id;
        try {
          const data = await myProfile(id!);
          // fix after backend response
          const userid = data._id;
          set({ user: {...data, id: userid } });
        } catch (error) {
          set({ error: "Failed to fetch profile" });
        } finally {
          set({ isLoading: false });
        }
      },
      verifyOtp: async (userId: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await verifyOtp(userId, otp);
          set({ user: data.user, isAuthenticated: true });
          toast.success("OTP verified successfully!");
          setTimeout(() => {
            window.location.href = "/conversations";
          }, 1000);
        } catch (error) {
          set({ error: "OTP verification failed" });
        } finally {
          set({ isLoading: false });
        }
      },
      provideOtp: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await provideOtp(userId);
          set({ userRegistrationId: data });
          toast.success("OTP sent successfully!");
        } catch (error) {
          set({ error: "Failed to send OTP" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique);
    }
  )
);
