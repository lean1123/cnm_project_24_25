import { DataLogin, DataRegister, User } from "@/types";
import { create } from "zustand";
import { toast } from "sonner";
import { persist } from "zustand/middleware";
import { io, Socket } from "socket.io-client";
import { disconnectSocket, getSocket } from "@/lib/socket";
import api from "@/api/api";
import Cookies from "js-cookie";

interface iAuthStore {
  isAuthenticated: boolean;
  user: User | null;
  userRegistrationId: string | null;
  emailForgotPassword: string | null;
  login: (dataLogin: DataLogin) => Promise<Boolean>;
  isLogging: boolean;
  errorLogging: string | null;
  register: (dataRegister: DataRegister) => Promise<void>;
  isRegistering: boolean;
  errorRegistering: string | null;
  logout: () => void;
  getMyProfile: () => Promise<void>;
  verifyOtp: (userId: string, otp: string) => Promise<Boolean>;
  provideOtp: (userId: string) => Promise<void>;
  forgotPassword: (email: string, newPassword: string) => Promise<void>;
  verifyForgotPassword: (email: string, otp: string) => Promise<Boolean>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  socket: Socket | null;
}

export const useAuthStore = create<iAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLogging: false,
      errorLogging: null,
      isRegistering: false,
      errorRegistering: null,
      userRegistrationId: null,
      emailForgotPassword: null,
      socket: null,

      login: async (dataLogin: DataLogin) => {
        set({ isLogging: true, errorLogging: null, emailForgotPassword: null });
        try {
          const {data} = await api.post("/auth/sign-in", dataLogin);
          if (data.success) {
            Cookies.set("accessToken", data.data.token, {
              expires: 1,
              secure: true,
              sameSite: "Strict",
            });
            const result = data.data;
            set({ user: result.user, isAuthenticated: true });
            setTimeout(() => {
              get().connectSocket();
            }, 0);
            return true;
          }
          return false;
        } catch (error) {
          set({ errorLogging: "Login failed" });
          return false;
        } finally {
          set({ isLogging: false });
        }
      },
      register: async (dataRegister: DataRegister) => {
        set({ isRegistering: true, errorRegistering: null, emailForgotPassword: null });
        try {
          const {data} = await api.post("/auth/sign-up", dataRegister);
          set({ userRegistrationId: data.data.userId });
          setTimeout(() => {
            window.location.href = `/verify-otp`;
          }, 500);
        } catch (error) {
          set({ errorRegistering: "Registration failed" });
        } finally {
          set({ isRegistering: false });
        }
      },
      logout: async () => {
        set({ user: null, isAuthenticated: false, emailForgotPassword: null });
        Cookies.remove("accessToken"); // Remove the access token from cookies
        Cookies.remove("refreshToken"); // Remove the refresh token from cookies
        useAuthStore.persist.clearStorage(); // Clear the persisted state
        useAuthStore.persist.rehydrate(); // Rehydrate the store to its initial state
        // set({ user: null, isAuthenticated: false, emailForgotPassword: null });
        get().disconnectSocket(); // Disconnect the socket on logout
      },
      getMyProfile: async () => {
        // set({  error: null });
        const id = get().user?.id;
        try {
          const {data} = await api.get(`/users/${id}`);
          // fix after backend response
          const userid = data.data._id;
          set({ user: { ...data.data, id: userid } });
        } catch (error) {
          // set({ error: "Failed to fetch profile" });
        } finally {
          // set({ isLoading: false });
        }
      },
      verifyOtp: async (userId: string, otp: string) => {
        // set({ isLoading: true, error: null });
        try {
          const {data} = await api.post(`/auth/verify-otp/${userId}`, {
            otp});
          if (data.success) {
            Cookies.set("accessToken", data.data.token, {
              expires: 1,
              secure: true,
              sameSite: "Strict",
            });
            const result = data.data;
            set({ user: result.user, isAuthenticated: true });
            setTimeout(() => {
              get().connectSocket();
            }, 0);
            setTimeout(() => {
              window.location.href = "/conversations";
            }, 1000);
            return true;
          }
          return false;
        } catch (error) {
          // set({ error: "OTP verification failed" });
          return false;
        } finally {
          // set({ isLoading: false });
        }
      },
      provideOtp: async (userId: string) => {
        // set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/auth/provide-otp/${userId}`);
          set({ userRegistrationId: data.data.userId });
          toast.success("OTP sent successfully!");
        } catch (error) {
          // set({ error: "Failed to send OTP" });
        } finally {
          // set({ isLoading: false });
        }
      },
      forgotPassword: async (email: string, newPassword: string) => {
        // set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/forgot-password", {
            email,
            newPassword,
          });
          if (data.success) {
            set({ emailForgotPassword: email });
            setTimeout(() => {
              window.location.href = `/verify-otp`;
            }, 500);
          }
        } catch (error) {
          // set({ error: "Failed to reset password" });
          toast.error("Failed to reset password. Please try again.");
        } finally {
          // set({ isLoading: false });
        }
      },
      verifyForgotPassword: async (email: string, otp: string) => {
        // set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/forgot-password-verification", {
            email,
            otp,
          });
          if (data.success) {
            
            set({ emailForgotPassword: email });
            toast.success("OTP verified successfully!");
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 1000);
            return true;
          }
          return false;
        } catch (error) {
          // set({ error: "OTP verification failed" });
          // toast.error("OTP verification failed. Please try again.");
          return false;
        } finally {
          // set({ isLoading: false });
        }
      },

      connectSocket: () => {
        const user = get().user;
        if (!user || get().socket?.connected) return;
        const socket = getSocket();
        set({ socket });
        
      },
      disconnectSocket: () => {
        disconnectSocket();
        set({ socket: null });
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique);
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== "socket")
        ),
    }
  )
);
