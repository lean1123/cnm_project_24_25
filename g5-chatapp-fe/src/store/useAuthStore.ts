import api from "@/api/api";
import { disconnectSocket, getSocket } from "@/lib/socket";
import type { DataLogin, DataRegister, GenerateQRCodeRes, User, UserUpdate } from "@/types";
import Cookies from "js-cookie";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  selectedHomePage: string;
  setSelectedHomePage: (value: string) => void;

  generateQRCode: () => Promise<GenerateQRCodeRes>;
  setUser: (user: User) => void;
  setIsAuthenticated: (value: boolean) => void;
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

      hasHydrated: false,
      setUser: (user: User) => {
        set({ user });
      },
      setIsAuthenticated: (value: boolean) => {
        set({ isAuthenticated: value });
      },
      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
      selectedHomePage: "conversations",
      setSelectedHomePage: (value: string) => {
        set({ selectedHomePage: value });
      },

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

          // ✅ Kiểm tra kết quả trả về từ server
          if (!data.success) {
            set({ errorRegistering: "Registration failed" });
            toast.error("Đăng ký không thành công. Vui lòng thử lại.");
            return; // 🛑 Ngăn việc chuyển hướng nếu lỗi logic từ server
          }

          // ✅ Nếu thành công
          set({ userRegistrationId: data.data.userId });
          setTimeout(() => {
            window.location.href = `/verify-otp`;
          }, 500);
        } catch (error: any) {
          // ✅ Lấy message cụ thể nếu có
          const message =
            error.response?.data?.message ||
            "Đăng ký không thành công. Vui lòng thử lại.";

          set({ errorRegistering: message });
          toast.error(message);
          return; // 🛑 Ngăn việc chuyển hướng nếu có exception
        } finally {
          set({ isRegistering: false });
        }
      },
      logout: async () => {
        set({ user: null, isAuthenticated: false, emailForgotPassword: null });
        Cookies.remove("accessToken"); // Remove the access token from cookies
        Cookies.remove("refreshToken"); // Remove the refresh token from cookies
        useAuthStore.persist.clearStorage(); // Clear the persisted state
        // useAuthStore.persist.rehydrate(); // Rehydrate the store to its initial state
        // set({ user: null, isAuthenticated: false, emailForgotPassword: null });
        // get().disconnectSocket(); // Disconnect the socket on logout
        disconnectSocket(); // Disconnect the socket on logout
        set({ socket: null });
        // window.location.href = "/login"; // nếu muốn điều hướng tay
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
              window.location.href = "/";
            }, 1000);
            return true;
          }
          return false;
        } catch (error) {
          // set({ error: "OTP verification failed" });
          toast.error("Xác thực OTP không thành công. Vui lòng thử lại.");
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
          if (data.success) {
            toast.success("Yêu cầu cấp OTP thành công!");
          }
        } catch (error) {
          // set({ error: "Failed to send OTP" });
          toast.error("Không thể gửi OTP. Vui lòng thử lại.");
        } finally {
          // set({ isLoading: false });
        }
      },
      forgotPassword: async (email: string, newPassword: string) => {
        try {
          const { data } = await api.post("/auth/forgot-password", {
            email,
            newPassword,
          });

          // Kiểm tra rõ ràng: chỉ chuyển trang khi success
          if (data.success) {
            set({ emailForgotPassword: email });
            setTimeout(() => {
              window.location.href = `/verify-otp`;
            }, 500);
          } else {
            // Trả lỗi từ server (trong body)
            const message =
              Array.isArray(data.message) && data.message.length > 0
                ? data.message[0]
                : "Không thể đặt lại mật khẩu.";
            toast.error(message);
          }
        } catch (error: any) {
          // Lỗi mạng hoặc HTTP status != 200
          const message =
            error.response?.data?.message ??
            "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
          toast.error(Array.isArray(message) ? message[0] : message);
        }
      },
      verifyForgotPassword: async (email: string, otp: string) => {
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
            toast.success("Đặt lại mật khẩu thành công!");
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
            return true;
          } else {
            // ✅ Hiển thị lỗi từ server
            const message =
              Array.isArray(data.message) && data.message.length > 0
                ? data.message[0]
                : "Xác minh OTP thất bại. Vui lòng thử lại.";
            toast.error(message);
            return false;
          }
        } catch (error: any) {
          // ✅ Bắt lỗi từ HTTP response hoặc mạng
          const message =
            error.response?.data?.message ??
            "Xác minh OTP thất bại. Vui lòng thử lại.";
          toast.error(Array.isArray(message) ? message[0] : message);
          return false;
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
          toast.loading("Đang tải ảnh...", {
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
            toast.success("Cập nhật ảnh đại diện thành công", {
              id: "avatar-upload",
            });
          }
        } catch (error) {
          toast.error("Không thể tải ảnh, vui lòng thử lại!", {
            id: "avatar-upload",
          });
        }
      },
      updateProfile: async (data: UserUpdate) => {
        try {
          toast.loading("Đang cập nhật...", {
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
            toast.success("Cập nhật thông tin thành công!", {
              id: "profile-update",
            });
          }
        } catch (error) {
          toast.error("Không thể cập nhật, vui lòng thử lại.", {
            id: "profile-update",
          });
        }
      },
      generateQRCode: async () => {
        try {
          const {data} = await api.get("/auth/gennerate-qr-code");
          return data.data
        } catch (error) {
          toast.error('Không thể tạo mã qr code, vui lòng thử lại.')
          return null;
        } 
      }
      ,
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
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          state.connectSocket();
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
