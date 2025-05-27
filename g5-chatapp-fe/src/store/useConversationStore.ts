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
  isCreatingGroup: boolean;
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
  updateAvatar: (file: File, conversationId: string) => Promise<void>;
}

export const useConversationStore = create<iConversationStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,
  userSelected: null,
  membersCreateGroup: [],
  isCreatingGroup: false,
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
    set({ isLoading: true, error: null, isCreatingGroup: true });
    try {
      toast.loading("Đang tạo nhóm...", {
        id: "create-group",
      });
      const form = new FormData();
      form.append("name", group.name);
      form.append("isGroup", "true");
      group.members.forEach((member) => {
        form.append("members", member);
      });
      if (group.file) {
        form.append("file", group.file);
      }
      const { data } = await api.post("/conversation", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Create group response:", data);
      set({ membersCreateGroup: [] });
      get().getConversations(useAuthStore.getState().user?._id as string);
      toast.success("Tạo nhóm thành công!", {
        id: "create-group",
      });
      const socket = getSocket();
      if (socket) {
        socket.emit("joinNewConversation", {
          conversationId: data.data._id,
          userId: useAuthStore.getState().user?._id,
        });
      }
    } catch (error) {
      set({ error: "Failed to create group" });
      toast.error("Tạo nhóm thất bại!", {
        id: "create-group",
      });
    } finally {
      set({ isLoading: false, isCreatingGroup: false });
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
      toast.success("Thêm thành viên thành công!");
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
      toast.success("Xóa thành viên thành công!");
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
      toast.success("Rời nhóm thành công!");
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
      toast.loading("Đang giải tán nhóm...", {
        id: "dissolve-group",
      });
      const { data } = await api.delete(`/conversation/${conversationId}`);
      console.log("Dissolve group response:", data);
      set({ selectedConversation: null });
      // Remove the conversation from the list
      const updatedConversations = get().conversations.filter(
        (conv) => conv._id !== conversationId
      );
      set({ conversations: updatedConversations });
      get().getConversations(useAuthStore.getState().user?._id as string);
      toast.success("Nhóm đã được giải tán!", {
        id: "dissolve-group",
      });
    } catch (error) {
      set({ error: "Failed to dissolve group" });
      toast.error("Giải tán nhóm thất bại!", {
        id: "dissolve-group",
      });
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
      toast.success("Chuyển vai trò thành công!");
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
      toast.success("Đổi quản trị viên thành công!");
      get().getConversations(useAuthStore.getState().user?._id as string);
    } catch (error) {
      set({ error: "Failed to change admin" });
    } finally {
      set({ isLoading: false });
    }
  },
  updateAvatar: async (file: File, conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      toast.loading("Đang cập nhật ảnh đại diện nhóm...", {
        id: "update-avatar-group",
      });
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(
        `/conversation/change-avatar/${conversationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Update avatar response:", data);
      get().getConversations(useAuthStore.getState().user?._id as string);
      toast.success("Cập nhật ảnh đại diện thành công!", 
        {
          id: "update-avatar-group",
        }
      );
    } catch (error) {
      set({ error: "Failed to update avatar" });
      toast.error("Cập nhật ảnh đại diện thất bại!", {
        id: "update-avatar-group",
      });
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
          toast.error("Bạn đã bị xóa khỏi nhóm!");
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
          toast.error("Nhóm đã bị giải tán!");
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
