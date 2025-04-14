import { useState } from 'react';
import { chatService } from "../../../services/chat.service";

export const useMessages = (conversation) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tempMessages, setTempMessages] = useState([]);

  const fetchMessages = async () => {
    if (!conversation?._id) return;
    
    try {
      setLoading(true);
      console.log("Fetching messages for conversation:", conversation._id);
      const response = await chatService.getMessagesByConversation(conversation._id, 1, 50);
      console.log("Fetched messages response:", response);

      if (response?.success) {
        const newMessages = response.data?.data || [];
        console.log("Number of messages fetched:", newMessages.length);
        console.log("First message:", newMessages[0]);
        
        setMessages(newMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setHasMore(response.data?.currentPage < response.data?.totalPages);
      } else {
        console.error("Failed to fetch messages:", response);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loading || !conversation?._id) return;
    
    try {
      const nextPage = page + 1;
      console.log("Loading more messages, page:", nextPage);
      
      const response = await chatService.getMessagesByConversation(conversation._id, nextPage, 50);
      console.log("Load more response:", response);

      if (response?.success) {
        const newMessages = response.data?.data || [];
        setMessages(prev => {
          const combined = [...prev, ...newMessages];
          return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        setPage(nextPage);
        setHasMore(response.data?.currentPage < response.data?.totalPages);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  };

  const addTempMessage = (message) => {
    console.log("Adding temp message:", message);
    setTempMessages(prev => [message, ...prev]);
    setMessages(prev => [message, ...prev]);
  };

  const removeTempMessage = (messageId) => {
    console.log("Removing temp message:", messageId);
    setTempMessages(prev => prev.filter(msg => msg._id !== messageId));
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
  };

  const addMessage = (message) => {
    setMessages(prev => {
      const exists = prev.some(m => m._id === message._id);
      if (!exists) {
        const formattedMessage = {
          _id: message._id,
          content: message.content,
          type: message.type,
          sender: message.sender,
          createdAt: message.createdAt || new Date().toISOString(),
          conversation: message.conversation || message.conversationId,
          files: message.files || []
        };
        return [formattedMessage, ...prev];
      }
      return prev;
    });
  };

  const markMessageAsError = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, isError: true } 
          : msg
      )
    );
  };

  return {
    messages,
    loading,
    hasMore,
    tempMessages,
    fetchMessages,
    loadMoreMessages,
    addTempMessage,
    removeTempMessage,
    addMessage,
    markMessageAsError
  };
}; 