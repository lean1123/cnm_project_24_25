import api from "@/api/api";
import { getSocket } from "@/lib/socket";
import type { Conversation, CreateGroupRequest, User } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface iConversationStore {
  conversations: Conversation[];
  updateConversations: (conversations: Conversation[]) => void;
  selectedConversation: Conversation | null;
  userSelected: User | null;
  fetchingUser: (userId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  getConversations: (userId: string) => Promise<void>;
  getConversation: (conversationId: string) => Promise<Conversation | null>;
  setSelectedConversation: (conversation: Conversation | null) => void;
  membersCreateGroup: User[];
  addMemberCreateGroup: (member: User) => void;
  removeMemberCreateGroup: (member: User) => void;
  createGroup: (group: CreateGroupRequest) => Promise<void>;
  addMemberToGroup: (
    conversationId: string,
    userIds: string[]
  ) => Promise<void>;
  removeMemberFromGroup: (
    conversationId: string,
    memberId: string
  ) => Promise<void>;
  resetMembersCreateGroup: () => void;
  changeRoleMember: (conversationId: string, memberId: string) => Promise<void>;
  changeAdminGroup: (conversationId: string, memberId: string) => Promise<void>;
  leaveGroup: (conversationId: string) => Promise<void>;
  dissolveGroup: (conversationId: string) => Promise<void>;
  subscribeNewGroup: () => void;
  unsubscribeNewGroup: () => void;
  subscribeUpdateGroup: () => void;
  unsubscribeUpdateGroup: () => void;
  setSelectedUser: (user: User | null) => void;
}

export const useConversationStore = create<iConversationStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,
  userSelected: null,
  membersCreateGroup: [],
  setSelectedUser: (user: User | null) => {
    set({ userSelected: user });
  },
  resetMembersCreateGroup: () => {
    set({ membersCreateGroup: [] });
  },
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
  setSelectedConversation: (conversation: Conversation | null) => {
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
      const socket = getSocket();
      if (socket) {
        socket.emit("joinNewConversation", {
          conversationId: data.data._id,
          userId: useAuthStore.getState().user?._id,
        });
      }
    } catch (error) {
      set({ error: "Failed to create group" });
    } finally {
      set({ isLoading: false });
    }
  },
  addMemberToGroup: async (conversationId: string, userIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(
        `/conversation/add-member/${conversationId}`,
        { newMemberIds: userIds }
      );
      console.log("Add member to group response:", data);
      toast.success("Member added successfully!");
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to add member" });
    } finally {
      set({ isLoading: false });
    }
  },
  removeMemberFromGroup: async (conversationId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(
        `/conversation/remove-member/${conversationId}`,
        {
          data: { memberId },
        }
      );
      console.log("Remove member from group response:", data);
      toast.success("Member removed successfully!");
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to remove member" });
    } finally {
      set({ isLoading: false });
    }
  },
  leaveGroup: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/conversation/leave/${conversationId}`);
      console.log("Leave group response:", data);
      toast.success("Left group successfully!");
      get().getConversations(useAuthStore.getState().user?._id as string);
      set({ selectedConversation: null });
    } catch (error) {
      set({ error: "Failed to leave group" });
    } finally {
      set({ isLoading: false });
    }
  },
  dissolveGroup: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/conversation/${conversationId}`);
      console.log("Dissolve group response:", data);
      toast.success("Group dissolved successfully!");
      set({ selectedConversation: null });
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to dissolve group" });
    } finally {
      set({ isLoading: false });
    }
  },
  changeRoleMember: async (conversationId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(
        `/conversation/change-role/${conversationId}/${memberId}`
      );
      console.log("Change role response:", data);
      toast.success("Role changed successfully!");
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to change role" });
    } finally {
      set({ isLoading: false });
    }
  },
  changeAdminGroup: async (conversationId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(
        `/conversation/change-admin/${conversationId}`,
        {
          adminId: memberId,
        }
      );
      console.log("Change admin response:", data);
      toast.success("Admin changed successfully!");
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to change admin" });
    } finally {
      set({ isLoading: false });
    }
  },
  subscribeNewGroup: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("createConversationForGroup", (data) => {
        console.log("New group created:", data);
        get().getConversations(useAuthStore.getState().user?._id as string);
        console.log("Conversation ID:", data);
        socket.emit("joinNewConversation", {
          conversationId: data.conversation._id,
          userId: useAuthStore.getState().user?._id,
        });
      });
    }
  },
  unsubscribeNewGroup: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("createConversationForGroup");
    }
  },
  subscribeUpdateGroup: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("updateConversation", (data) => {
        console.log("Group updated:", data);
        if (data.conversation._id === get().selectedConversation?._id) {
          set({ selectedConversation: data.conversation });
        }
        get().getConversations(useAuthStore.getState().user?._id as string);
      });
      socket.on("removedGroupByAdmin", (data) => {
        console.log("You have been removed from the group:", data);
        if (data.memberId === useAuthStore.getState().user?._id) {
          toast.error("You have been removed from the group!");
          if (get().selectedConversation?._id === data.conversationId) {
            set({ selectedConversation: null });
          }
          get().getConversations(useAuthStore.getState().user?._id as string);
        }
      });
      socket.on("dissolvedGroup", (data) => {
        console.log("Group dissolved:", data);
        if (
          data.conversation._id === get().selectedConversation?._id &&
          useAuthStore.getState().user?._id !== data.adminId
        ) {
          toast.error("Group has been dissolved!");
          set({ selectedConversation: null });
        }
        get().getConversations(useAuthStore.getState().user?._id as string);
      });
    }
  },
  unsubscribeUpdateGroup: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("updateConversation");
    }
  },
}));
