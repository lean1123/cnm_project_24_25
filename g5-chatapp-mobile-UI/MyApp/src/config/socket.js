// import { io } from 'socket.io-client';
// import { API_URL } from './constants';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// let socket = null;

// export const initSocket = async () => {
//   try {
//     const userData = await AsyncStorage.getItem('userData');
//     if (!userData) {
//       console.warn('No user data found in AsyncStorage');
//       return null;
//     }

//     const parsedUserData = JSON.parse(userData);
//     const userId = parsedUserData?._id || parsedUserData?.id;
    
//     if (!userId) {
//       console.warn('No userId found in user data');
//       return null;
//     }

//     console.log('Initializing socket with userId:', userId);

//     if (!socket) {
//       socket = io(API_URL, {
//         transports: ['websocket'],
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         timeout: 20000,
//         query: { userId }
//       });

//       socket.on('connect', () => {
//         console.log('Socket connected successfully');
//         socket.emit('login', { userId });
//       });

//       socket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//         if (reason === 'io server disconnect') {
//           socket.connect();
//         }
//       });

//       socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//       });

//       socket.on('error', (error) => {
//         console.error('Socket error:', error);
//       });

//       // One-on-one chat events
//       socket.on('privateMessage', (data) => {
//         console.log('Received private message:', data);
//       });

//       socket.on('messageDelivered', (data) => {
//         console.log('Message delivered:', data);
//       });

//       socket.on('messageRead', (data) => {
//         console.log('Message read:', data);
//       });

//       socket.on('typing', (data) => {
//         console.log('User typing:', data);
//       });

//       socket.on('stopTyping', (data) => {
//         console.log('User stopped typing:', data);
//       });

//       socket.on('userOnline', (data) => {
//         console.log('User online:', data);
//       });

//       socket.on('userOffline', (data) => {
//         console.log('User offline:', data);
//       });
//     } else {
//       console.log('Socket already initialized');
//     }
//     return socket;
//   } catch (error) {
//     console.error('Error initializing socket:', error);
//     return null;
//   }
// };

// export const getSocket = () => {
//   if (!socket) {
//     console.warn('Socket not initialized yet');
//     return null;
//   }
//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket && typeof socket.disconnect === 'function') {
//     socket.disconnect();
//     socket = null;
//   }
// }; 