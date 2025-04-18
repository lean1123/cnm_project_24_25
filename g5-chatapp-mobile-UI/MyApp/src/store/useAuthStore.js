import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from "../config/constants";

let socket = null;

const getSocket = () => {
  if (!socket) {
    console.log("Connecting to socket server:", SOCKET_URL);
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      upgrade: true
    });
    
    socket.on('connect_error', (error) => {
      console.error("Socket connection error:", error.message);
      console.error("Error details:", error);
    });
    
    socket.on('connect_timeout', () => {
      console.error("Socket connection timeout");
    });
    
    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Attempting reconnection ${attempt}/5`);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
    });
    
    socket.on('error', (error) => {
      console.error("Socket general error:", error);
    });
    
    socket.io.on('upgrade', (transport) => {
      console.log("Transport upgraded to:", transport.name);
    });
    
    socket.io.on('transport', (transport) => {
      console.log("Using transport:", transport.name);
    });
  }
  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

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
            
            // Store user data in AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
            
            set({ user: data.data.user, isAuthenticated: true });
            
            // Connect socket after login, with a small delay like in web version
            setTimeout(() => {
              get().connectSocket();
            }, 100);
            
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
        try {
          await AsyncStorage.clear();
          get().disconnectSocket();
          set({ 
            user: null, 
            isAuthenticated: false,
            socket: null,
            activeUsers: []
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
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
        const { user } = get();
        if (!user) return;
        
        console.log('Connecting socket from useAuthStore for user:', user._id);
        const socket = getSocket(); // This will initialize if needed
        
        if (socket) {
          // Only emit login if socket is already connected
          if (socket.connected) {
            console.log('Socket already connected, sending login event');
            socket.emit('login', {
              userId: user._id,
            });
          }
          
          // Store socket reference in state
          set({ socket });
        }
      },

      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          console.log('Socket disconnected from useAuthStore');
        }
        set({ socket: null, activeUsers: [] });
      },

      setActiveUsers: (activeUsers) => {
        set({ activeUsers });
      },

      checkAuth: async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          
          if (token) {
            const currentUser = await AsyncStorage.getItem('auth-storage');
            if (currentUser) {
              const parsedUser = JSON.parse(currentUser);
              if (parsedUser.state && parsedUser.state.user) {
                set({ 
                  user: parsedUser.state.user, 
                  isAuthenticated: true 
                });
                
                get().connectSocket();
                return true;
              }
            }
          }
          return false;
        } catch (error) {
          console.error("Check auth error:", error);
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore; 