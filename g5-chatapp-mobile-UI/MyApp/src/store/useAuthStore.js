import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { io } from 'socket.io-client';

const useAuthStore = create(
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

      login: async (dataLogin) => {
        set({ isLogging: true, errorLogging: null, emailForgotPassword: null });
        try {
          const { data } = await api.post('/auth/sign-in', dataLogin);
          if (data.success) {
            await AsyncStorage.setItem('accessToken', data.data.token);
            set({ user: data.data.user, isAuthenticated: true });
            get().connectSocket();
            return true;
          }
          return false;
        } catch (error) {
          set({ errorLogging: 'Login failed' });
          return false;
        } finally {
          set({ isLogging: false });
        }
      },

      register: async (dataRegister) => {
        set({ isRegistering: true, errorRegistering: null, emailForgotPassword: null });
        try {
          const { data } = await api.post('/auth/sign-up', dataRegister);
          set({ userRegistrationId: data.data.userId });
          // Navigate to OTP verification screen
          return data.data.userId;
        } catch (error) {
          set({ errorRegistering: 'Registration failed' });
          return null;
        } finally {
          set({ isRegistering: false });
        }
      },

      logout: async () => {
        set({ user: null, isAuthenticated: false, emailForgotPassword: null });
        await AsyncStorage.removeItem('accessToken');
        get().disconnectSocket();
        // Navigate to login screen
      },

      verifyOtp: async (userId, otp) => {
        try {
          const { data } = await api.post(`/auth/verify-otp/${userId}`, { otp });
          if (data.success) {
            await AsyncStorage.setItem('accessToken', data.data.token);
            set({ user: data.data.user, isAuthenticated: true });
            get().connectSocket();
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },

      connectSocket: () => {
        const user = get().user;
        if (!user || get().socket?.connected) return;
        
        const socket = io('http://localhost:3000', {
          autoConnect: true,
          reconnection: true,
        });

        socket.on('connect', () => {
          socket.emit('login', { userId: user.id });
        });

        socket.on('activeUsers', (data) => {
          set({ activeUsers: data.activeUsers });
        });

        set({ socket });
      },

      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
        }
        set({ socket: null });
      },

      setActiveUsers: (activeUsers) => {
        set({ activeUsers });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore; 