import api from "@/api/api";
import { getSocket } from "@/lib/socket";
import { Conversation, CreateGroupRequest, Message, MessageRequest, User } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface iConversationStore {
  conversations: Conversation[];
  updateConversations: (conversations: Conversation []) => void;
  selectedConversation: Conversation | null;
  userSelected: User | null;
  fetchingUser: (userId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  getConversations: (userId: string) => Promise<void>;
  getConversation: (conversationId: string) => Promise<Conversation | null>;
  setSelectedConversation: (conversation: Conversation) => void;
  membersCreateGroup: User[];
  addMemberCreateGroup: (member: User) => void;
  removeMemberCreateGroup: (member: User) => void;
  createGroup: (group: CreateGroupRequest) => Promise<void>;
  subscribeNewGroup: () => void;
  unsubscribeNewGroup: () => void;
}

export const useConversationStore = create<iConversationStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,
  userSelected: null,
  membersCreateGroup: [],
  updateConversations: (conversations: Conversation[]) => {
    console.log("Update conversations:", conversations);
    set({ conversations });
  },
  addMemberCreateGroup: (member: User) => {
    set((state) => ({
      membersCreateGroup: [...state.membersCreateGroup, member],
    }));
  },
  removeMemberCreateGroup: (member: User) => {
    set((state) => ({
      membersCreateGroup: state.membersCreateGroup.filter(
        (m) => m._id !== member._id
      ),
    }));
  },
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
  createGroup: async (group: CreateGroupRequest) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/conversation", group);
      console.log("Create group response:", data);
      toast.success("Group created successfully!");
      set({ membersCreateGroup: [] });
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to create group" });
    } finally {
      set({ isLoading: false });
    }
  },
  subscribeNewGroup: () => {
    const socket = getSocket();
    if (socket) {
      socket.on("createConversationForGroup", (data: Conversation) => {
        console.log("New group created:", data);
        set((state) => ({
          conversations: [...state.conversations, data],
        }));
      });
    }
  },
  unsubscribeNewGroup: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("createConversationForGroup");
    }
  }
}));
