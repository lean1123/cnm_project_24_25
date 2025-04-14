import api from "@/api/api";
import { getSocket } from "@/lib/socket";
import { Conversation, Message, MessageRequest, User } from "@/types";
import { create } from "zustand";

interface iConversationStore {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  userSelected: User | null;
  fetchingUser: (userId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  getConversations: (userId: string) => Promise<void>;
  getConversation: (conversationId: string) => Promise<Conversation | null>;
  setSelectedConversation: (conversation: Conversation) => void;
  //   connectSocket: () => void;
  //   disconnectSocket: () => void;
  //   socket: Socket | null;
  messages: Message[];
  messagesTemp: Message[];
  isLoadingMessages: boolean;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (message: MessageRequest) => void;
  isLoadingSendMessage: boolean;
  errorSendMessage: string | null;
  isSuccessSendMessage: boolean;
  addTempMessage: (message: Message) => void;
  removeTempMessage: (messageId: string) => void;
  subscribeToNewMessages: () => void;
  unsubscribeFromNewMessages: () => void;
}

export const useConversationStore = create<iConversationStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,
  userSelected: null,
  messages: [],
  messagesTemp: [],
  isLoadingMessages: false,
  isLoadingSendMessage: false,
  errorSendMessage: null,
  isSuccessSendMessage: false,
  //   socket: null,
  //   connectSocket: () => {
  //     const { user } = useAuthStore.getState();
  //     const socket = io("http://localhost:3000");
  //     set({ socket });
  //     socket.on("connect", () => {
  //       console.log("Connected to socket server:", socket.id);
  //       if (user && get().selectedConversation) {
  //         socket.emit("join", {
  //           userId: user.id,
  //           conversationId: get().selectedConversation?._id,
  //         });
  //       }
  //     });
  //   },
  //   disconnectSocket: () => {
  //     const { socket } = get();
  //     if (socket) {
  //       socket.disconnect();
  //       set({ socket: null });
  //     }
  //   },
  fetchingUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/users/${userId}`);
      console.log("User selected:", data.data);
      set({ userSelected: data.data });
    } catch (error) {
      set({ error: "Failed to fetch user" });
    } finally {
      set({ isLoading: false });
    }
  },

  getConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/conversation/my-conversation");
      console.log("Conversations use store data:", data);
      set({ conversations: data.data });
    } catch (error) {
      set({ error: "Failed to fetch conversations" });
    } finally {
      set({ isLoading: false });
    }
  },
  setSelectedConversation: (conversation: Conversation) => {
    // get().disconnectSocket(); // Disconnect previous socket connection
    set({ selectedConversation: conversation });
    // get().connectSocket(); // Connect socket when conversation is selected
  },

  getConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/conversation/${conversationId}`);
      set({ selectedConversation: data.data });
      return data.data;
    } catch (error) {
      set({ error: "Failed to fetch conversation" });
      return null;
    }
  },
  // message

  fetchMessages: async (conversationId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const { data } = await api.get(
        `/message/${conversationId}?page=${1}&limit=${20}`
      );
      console.log("Fetched messages:", data.data);
      set({ messages: data.data.data });
    } catch (error) {
      set({ error: "Failed to fetch messages" });
    } finally {
      set({ isLoadingMessages: false });
    }
  },
  sendMessage: async (message: MessageRequest) => {
    set({ isLoadingSendMessage: true, errorSendMessage: null });
    const formData = new FormData();
    formData.append("content", message.content);
    message.files &&
      message?.files.forEach((file) => {
        formData.append("files", file); // tên 'files' này cần trùng với bên backend
      });
    try {
      const { selectedConversation } = get();
      const response = await api.post(
        `/message/send-message/${selectedConversation?._id}`,
        formData
      );
      set({ isSuccessSendMessage: true });
      // get().removeTempMessage("temp"); // Xóa tin nhắn tạm thời sau khi gửi thành công
      // console.log("Sent message:", response.data);
    } catch (error) {
      console.error("Failed to send message:", error);
      set({ errorSendMessage: "Failed to send message" });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === "temp" ? { ...msg, isError: true } : msg
        ),
        messagesTemp: state.messagesTemp.map((msg) =>
          msg._id === "temp" ? { ...msg, isError: true } : msg
        ),
      }));
    } finally {
      set({ isLoadingSendMessage: false });
    }
  },
  addTempMessage: (message: Message) => {
    set((state) => ({
      messages: [message, ...state.messages],
      messagesTemp: [message, ...state.messagesTemp],
    }));
  },
  removeTempMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.filter((message) => message._id !== messageId),
      messagesTemp: state.messagesTemp.filter(
        (message) => message._id !== messageId
      ),
    }));
  },
  subscribeToNewMessages: () => {
    const socket = getSocket(); // Ensure socket is initialized
    if (socket) {
      socket.on("newMessage", (message: Message) => {
        set((state) => ({
          messages: [
            message,
            ...state.messages.filter((m) => m._id !== "temp"),
          ],
          messagesTemp: state.messagesTemp.filter((m) => m._id !== "temp"),
          conversations: state.conversations.map((conversation) => {
            if (conversation._id === message.conversation) {
              return {
                ...conversation,
                lastMessage: {
                  _id: message._id,
                  sender: message.sender.userId,
                  message: message.content,
                },
              };
            }
            return conversation;
          }),
        }));
      });
    }
  },
  unsubscribeFromNewMessages: () => {
    const socket = getSocket(); // Ensure socket is initialized
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
