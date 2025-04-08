import { getMyConversations } from "@/api/conversationApi";
import { Conversation } from "@/types";
import { create } from "zustand";


interface iConversationStore {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    isLoading: boolean;
    error: string | null;
    getConversations: (userId: string) => Promise<void>;
    setSelectedConversation: (conversation: Conversation) => void;
}

export const useConversationStore = create<iConversationStore>((set, get) => ({
    conversations: [],
    selectedConversation: null,
    isLoading: false,
    error: null,

    getConversations: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await getMyConversations(userId);
            console.log("Conversations use store data:", data);
            set({ conversations: data.data });
        } catch (error) {
            set({ error: "Failed to fetch conversations" });
        } finally {
            set({ isLoading: false });
        }
    },
    setSelectedConversation: (conversation: Conversation) => {
        set({ selectedConversation: conversation });
    },
}));