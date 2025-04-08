import api from "./api";


export const getMyConversations = async (userId: string) => {
    try {
        const data = await api.get("/convensation/my-conversation/"+userId);
        return data.data;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
}

export const getConversationById = async (id: string) => {
    try {
        const data = await api.get(`/convensation/${id}`);
        return data.data;
    } catch (error) {
        console.error("Error fetching conversation by ID:", error);
        throw error;
    }
}



