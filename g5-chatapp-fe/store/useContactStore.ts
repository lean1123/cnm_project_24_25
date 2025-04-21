import api from "@/api/api";
import { Contact } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { getSocket } from "@/lib/socket";
import { emit } from "process";
import { useConversationStore } from "./useConversationStore";

interface iContactStore {
  contacts: Contact[];
  myPendingContact: Contact[];
  myRequestContact: Contact[];
  isLoading: boolean;
  error: string | null;
  createContact: (userId: string, name: string) => Promise<void>;
  getMyContact: () => Promise<void>;
  getListPendingContact: () => Promise<void>;
  getListRequestContact: () => Promise<void>;
  acceptContact: (contactId: string) => Promise<void>;
  rejectContact: (contactId: string) => Promise<void>;
  cancelContact: (contactId: string) => Promise<void>;
  getContactById: (contactId: string) => Promise<Contact | null>;
  subscribeContact: () => void;
  unsubscribeContact: () => void;
  subscribeCancelContact: () => void;
  unsubscribeCancelContact: () => void;
  subscribeRejectContact: () => void;
  unsubscribeRejectContact: () => void;
  subscribeAcceptContact: () => void;
  unsubscribeAcceptContact: () => void;
}

export const useContactStore = create<iContactStore>((set, get) => ({
  contacts: [],
  myPendingContact: [],
  myRequestContact: [],
  isLoading: false,
  error: null,
  createContact: async (userId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/contact", {
        contactId: userId,
      });
      console.log("Contact data:", data);
      if (data.success) {
        set((state) => ({
          myPendingContact: [...state.myPendingContact, data.data],
        }));
        const socket = useAuthStore.getState().socket;
        if (socket) {
          console.log("Emitting contact request event...");
          socket.emit("sendRequestContact", {
            receiverId: userId,
            contact: data.data,
          });
        }
        toast.success(`Send contact request to ${name} successfully!`);
      }
    } catch (error) {
      set({ error: "Failed to create contact" });
      toast.error("Failed to send contact request. Please try again.");
    } finally {
      set({ isLoading: false });
    }
  },
  getMyContact: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contact/my-contact");
      if (data.success) {
        set({ contacts: data.data });
      }
    } catch (error) {
      set({ error: "Failed to fetch contacts" });
    } finally {
      set({ isLoading: false });
    }
  },
  getListPendingContact: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contact/get-my-pending-contact");
      if (data.success) {
        set({ myPendingContact: data.data });
      }
    } catch (error) {
      set({ error: "Failed to fetch accepted contacts" });
    } finally {
      set({ isLoading: false });
    }
  },
  getListRequestContact: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get("/contact/get-my-request-contact");
      if (data.success) {
        set({ myRequestContact: data.data });
      }
    } catch (error) {
      set({ error: "Failed to fetch request contacts" });
    } finally {
      set({ isLoading: false });
    }
  },
  acceptContact: async (contactId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contact/accept/${contactId}`);
      if (data.success) {
        set((state) => ({
          contacts: [...state.contacts, data.data],
          myRequestContact: state.myRequestContact?.filter(
            (contact) => contact._id !== contactId
          ),
        }));
        useConversationStore
          .getState()
          .getConversations(useAuthStore.getState().user?._id as string);
        toast.success("Started chat with this contact now!");
      }
    } catch (error) {
      set({ error: "Failed to accept contact" });
      toast.error("Failed to accept contact request. Please try again.");
    } finally {
      set({ isLoading: false });
    }
  },
  rejectContact: async (contactId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contact/reject/${contactId}`);
      if (data.success) {
        set((state) => ({
          myRequestContact: state.myRequestContact?.filter(
            (contact) => contact._id !== contactId
          ),
        }));
        const socket = useAuthStore.getState().socket;
        if (socket) {
          console.log("Emitting cancel contact event...");
          const receiverId =
            data.data.contact === useAuthStore.getState().user?._id
              ? data.data.user
              : data.data.contact;
          socket.emit("rejectRequestContact", {
            receiverId: receiverId,
            name: receiverId,
            contactId: contactId,
          });
        }
        toast.success("Rejected contact request successfully!");
      }
    } catch (error) {
      set({ error: "Failed to reject contact" });
      toast.error("Failed to reject contact request. Please try again.");
    } finally {
      set({ isLoading: false });
    }
  },
  cancelContact: async (contactId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contact/cancel/${contactId}`);
      if (data.success) {
        set((state) => ({
          myPendingContact: state.myPendingContact?.filter(
            (contact) => contact._id !== contactId
          ),
        }));
        const socket = useAuthStore.getState().socket;
        if (socket) {
          console.log("Emitting cancel contact event...");
          const receiverId =
            data.data.contact === useAuthStore.getState().user?._id
              ? data.data.user
              : data.data.contact;
          console.log("Receiver ID:", receiverId);
          socket.emit("cancelRequestContact", {
            receiverId: receiverId,
            contactId: contactId,
          });
        }
        toast.success("Cancelled contact request successfully!");
      }
    } catch (error) {
      set({ error: "Failed to cancel contact" });
      toast.error("Failed to cancel contact request. Please try again.");
    } finally {
      set({ isLoading: false });
    }
  },
  getContactById: async (contactId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/contact/${contactId}`);
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      set({ error: "Failed to fetch contact" });
    } finally {
      set({ isLoading: false });
    }
    return null;
  },
  subscribeContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Subscribing to contact events...");
      socket.on("newRequestContact", (data: Contact) => {
        console.log("Received new contact request:", data);
        set((state) => ({
          myRequestContact: [...state.myRequestContact, data],
        }));
        toast.success(
          `You have a new contact request from ${data.user.firstName} ${data.user.lastName}!`
        );
      });
    }
  },
  unsubscribeContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newRequestContact");
    }
  },
  subscribeCancelContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Subscribing to cancel contact events...");
      socket.on("cancelRequestContact", (contactId: string) => {
        console.log("Received cancel contact request:", contactId);
        set((state) => ({
          myRequestContact: state.myRequestContact?.filter(
            (contact) => contact._id !== contactId
          ),
        }));
      });
    }
  },
  unsubscribeCancelContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("cancelRequestContact");
    }
  },
  subscribeRejectContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Subscribing to reject contact events...");
      socket.on(
        "rejectRequestContact",
        ({ contactId, name }: { contactId: string; name: string }) => {
          set((state) => ({
            // myRequestContact: state.myRequestContact?.filter(
            //   (contact) => contact._id !== contactId
            // ),
            myPendingContact: state.myPendingContact?.filter(
              (contact) => contact._id !== contactId
            ),
          }));
          toast.success(`Your contact request to ${name} has been rejected!`);
        }
      );
    }
  },
  unsubscribeRejectContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("rejectRequestContact");
    }
  },
  subscribeAcceptContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log("Subscribing to accept contact events...");
      socket.on("acceptRequestContact", (data) => {
        socket.emit("joinNewConversation", {
          conversationId: data.conversation,
          userId: useAuthStore.getState().user?._id,
        });
        useConversationStore
          .getState()
          .getConversations(useAuthStore.getState().user?._id as string);
          console.log("Received accept contact request:", data);
      });
    }
  },
  unsubscribeAcceptContact: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("acceptRequestContact");
    }
  },
}));
