import { DataLogin, DataRegister, User, UserUpdate } from "@/types";
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
  activeUsers: string[];
  setActiveUsers: (activeUsers: string[]) => void;
  changeAvatar: (file: File) => Promise<void>;
  updateProfile: (data: UserUpdate) => Promise<void>;
  subscribeActiveUsers: () => void;
  unsubscribeActiveUsers: () => void;
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
      activeUsers: [],

      login: async (dataLogin: DataLogin) => {
        set({ isLogging: true, errorLogging: null, emailForgotPassword: null });
        try {
          const { data } = await api.post("/auth/sign-in", dataLogin);
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
        set({
          isRegistering: true,
          errorRegistering: null,
          emailForgotPassword: null,
        });
        try {
          const { data } = await api.post("/auth/sign-up", dataRegister);
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
        // get().disconnectSocket(); // Disconnect the socket on logout
        disconnectSocket(); // Disconnect the socket on logout
        set({ socket: null });
      },
      getMyProfile: async () => {
        // set({  error: null });
        const id = get().user?.id;
        try {
          const { data } = await api.get(`/users/${id}`);
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
          const { data } = await api.post(`/auth/verify-otp/${userId}`, {
            otp,
          });
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
          const { data } = await api.post(
            "/auth/forgot-password-verification",
            {
              email,
              otp,
            }
          );
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
      setActiveUsers: (activeUsers: string[]) => {
        set({ activeUsers });
      },

      connectSocket: () => {
        const user = get().user;
        if (!user || get().socket?.connected) return;
        const socket = getSocket();
        // const socket = io("http://localhost:3000", {
        //   autoConnect: true,
        //   reconnection: true,
        // });
        // socket.on("connect", () => {
        //   console.log("Socket connected:", socket?.id);
        //   socket?.emit("login", {
        //     userId: user?.id || "userId",
        //   });
        //   socket?.on("activeUsers", (data) => {
        //     console.log("Active users:", data.activeUsers);
        //     set({ activeUsers: data.activeUsers });
        //   });
        // });
        socket.emit("login", {
          userId: user.id,
        });
        set({ socket });
      },
      disconnectSocket: () => {
        // disconnectSocket();
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          console.log("Socket disconnected:", socket?.id);
        }
        set({ socket: null });
      },
      changeAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
          toast.loading("Uploading avatar...", {
            id: "avatar-upload",
          });
          const { data } = await api.put("/users/change-avatar", formData);
          if (data.success) {
            const updatedUser = {
              ...get().user,
              avatar: data.data.avatar,
              id: get().user?.id || "",
              firstName: get().user?.firstName || "",
              lastName: get().user?.lastName || "",
              email: get().user?.email || "",
              gender: get().user?.gender || "",
              dob: get().user?.dob || "",
            };
            set({ user: updatedUser });
            toast.success("Avatar updated successfully!", {
              id: "avatar-upload",
            });
          }
        } catch (error) {
          toast.error("Failed to update avatar. Please try again.", {
            id: "avatar-upload",
          });
        }
      },
      updateProfile: async (data: UserUpdate) => {
        try {
          toast.loading("Updating profile...", {
            id: "profile-update",
          });
          const formData = new FormData();
          formData.append("firstName", data.firstName);
          formData.append("lastName", data.lastName);
          formData.append("gender", data.gender);
          formData.append("dob", data.dob);
          const { data: response } = await api.put("/users", formData);
          if (response.success) {
            set({ user: response.data });
            toast.success("Profile updated successfully!", {
              id: "profile-update",
            });
          }
        } catch (error) {
          toast.error("Failed to update profile. Please try again.", {
            id: "profile-update",
          });
        }
      },
      subscribeActiveUsers: () => {
        const socket = get().socket;
        if (socket) {
          console.log("Subscribing to active users events...");
          socket.on("activeUsers", (data) => {
            console.log("Received active users:", data.activeUsers);
            set({ activeUsers: data.activeUsers });
          });
        }
      },
      unsubscribeActiveUsers: () => {
        const socket = get().socket;
        if (socket) {
          console.log("Unsubscribing from active users events...");
          socket.off("activeUsers");
        }
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique);
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== "socket")
        ),
      onRehydrateStorage: () => ((state) => {
        if (state?.isAuthenticated) {
          state.connectSocket();
        }
      }),
    }
  )
);
