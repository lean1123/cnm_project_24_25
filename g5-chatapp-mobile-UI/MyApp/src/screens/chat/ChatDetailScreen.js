import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Modal,
  Keyboard,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Location from "expo-location";
import AntDesign from "@expo/vector-icons/AntDesign";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket } from "../../services/socket";
import axiosInstance from "../../config/axiosInstance";
import { format } from "date-fns";
import ChatOptions from "../chat/components/ChatOptions";

const ChatDetailScreen = ({ navigation, route }) => {
  const { conversation } = route.params;
  const [showOptions, setShowOptions] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [tempMessages, setTempMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const flatListRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleReturn = () => {
    navigation.navigate("Home_Chat");
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("Initializing chat with conversation:", conversation);
        setLoading(true);

        // Data from AsyncStorage
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const currentUserData = JSON.parse(userData);
          setCurrentUser(currentUserData);
          console.log("Current user:", currentUserData);

          // User data
          if (conversation) {
            if (conversation.name) {
              setOtherUser({
                _id: conversation._id,
                firstName: conversation.name.split(" ").slice(0, -1).join(" "),
                lastName: conversation.name.split(" ").slice(-1)[0],
                avatar: conversation.avatar,
              });
            } else if (conversation.user) {
              setOtherUser(conversation.user);
            }
          }

          // Set socket state
          const socketInstance = getSocket();
          console.log("Got existing socket:", socketInstance ? "yes" : "no");

          if (socketInstance) {
            console.log(
              "Socket connection status:",
              socketInstance.connected ? "connected" : "disconnected"
            );

            // Set socket state
            setSocket(socketInstance);
            setIsOnline(socketInstance.connected);

            // Join conversation room
            console.log("Joining conversation room:", conversation._id);
            socketInstance.emit("join", {
              conversationId: conversation._id,
              userId: currentUserData._id,
            });

            // Set up message listeners
            const handleNewMessage = (data) => {
              console.log("New message received:", data);

              const messageData = data.message || data;
              const messageConvId =
                messageData.conversation?._id || messageData.conversation;

              console.log("Message conversation:", messageConvId);
              console.log("Current conversation:", conversation._id);

              if (messageConvId === conversation._id) {
                setMessages((prevMessages) => {
                  const messageExists = prevMessages.some(
                    (msg) => msg._id === messageData._id
                  );
                  if (!messageExists) {
                    console.log("Adding new message to state");
                    const updatedMessages = [...prevMessages, messageData].sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );

                    requestAnimationFrame(() => {
                      if (flatListRef.current) {
                        flatListRef.current.scrollToEnd({ animated: true });
                      }
                    });

                    return updatedMessages;
                  }
                  return prevMessages;
                });
              }
            };

            // Remove any existing listeners
            socketInstance.off("messageReceived");
            socketInstance.off("newMessage");

            // Add new listeners
            socketInstance.on("messageReceived", handleNewMessage);
            socketInstance.on("newMessage", handleNewMessage);

            // Set up connect/disconnect handlers
            socketInstance.on("connect", () => {
              console.log("Socket reconnected in chat detail");
              setIsOnline(true);
              socketInstance.emit("join", {
                conversationId: conversation._id,
                userId: currentUserData._id,
              });
            });

            socketInstance.on("disconnect", () => {
              console.log("Socket disconnected in chat detail");
              setIsOnline(false);
            });
          } else {
            console.error("No socket connection available");
          }

          // Fetch initial messages
          await fetchMessages();
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      const socketInstance = getSocket();
      if (socketInstance && conversation?._id && currentUser?._id) {
        console.log("Leaving conversation room:", conversation._id);
        socketInstance.emit("leave", {
          conversationId: conversation._id,
          userId: currentUser._id,
        });

        // Remove only the listeners for this conversation
        socketInstance.off("messageReceived");
        socketInstance.off("newMessage");
        socketInstance.off("connect");
        socketInstance.off("disconnect");
      }
    };
  }, [conversation]);

  // Add useEffect for messages changes
  useEffect(() => {
    console.log("Messages changed, checking if scroll needed");
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      if (!conversation?._id) {
        console.log("No conversation ID available");
        return;
      }

      console.log("Fetching messages for conversation:", conversation._id);
      const response = await axiosInstance.get(`/message/${conversation._id}`);
      console.log("Messages response:", response.data);

      if (response.data && response.data.data) {
        let messagesData = response.data.data;

        if (messagesData.data && Array.isArray(messagesData.data)) {
          messagesData = messagesData.data;
        }
        const validMessages = messagesData.filter((msg) => {
          if (!msg || !msg.sender || !msg._id) {
            console.log("Invalid message format:", msg);
            return false;
          }
          return true;
        });

        // Sắp xếp tin nhắn từ cũ đến mới
        const sortedMessages = validMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        console.log("Valid messages count:", validMessages.length);
        setMessages(sortedMessages);

        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      } else {
        console.log("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const combinedMessages = useMemo(() => {
    const allMessages = [...messages];

    tempMessages.forEach((tempMsg) => {
      if (!allMessages.find((msg) => msg._id === tempMsg._id)) {
        allMessages.push(tempMsg);
      }
    });
    return allMessages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages, tempMessages]);

  const addTempMessage = (message) => {
    console.log("Adding temp message:", message);
    setTempMessages((prev) => [...prev, message]);
  };

  const removeTempMessage = (messageId) => {
    console.log("Removing temp message with ID:", messageId);
    setTempMessages((prev) => {
      const updatedMessages = prev.filter((msg) => msg._id !== messageId);
      console.log("Updated temp messages:", updatedMessages);
      return updatedMessages;
    });
  };

  const updateTempMessageStatus = (messageId, status) => {
    setTempMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
    );
  };

  const sendMessage = async (messageData = null) => {
    if (
      (!newMessage.trim() && !messageData) ||
      !socket ||
      !currentUser ||
      !conversation?._id
    ) {
      console.log("Invalid data, aborting message send.");
      return;
    }

    const currentContent = newMessage.trim();

    try {
      // --- GỬI ẢNH ---
      if (messageData?.type === "image") {
        const files = messageData.files || [];
        if (files.length === 0) return;

        for (const media of files) {
          const tempId = `temp-${Date.now()}-${Math.random()}`;

          const tempMessage = {
            _id: tempId,
            url: media.url,
            fileName: media.fileName || "image.jpg",
            sender: currentUser,
            conversation: conversation._id,
            createdAt: new Date().toISOString(),
            status: "sending",
            type: "image",
          };

          setTempMessages((prev) => [...prev, tempMessage]);

          const formData = new FormData();
          formData.append("files", {
            uri: media.url,
            name: media.fileName || "image.jpg",
            type: media.type || "image/jpeg",
          });
          formData.append("conversationId", conversation._id);
          formData.append("type", "image");

          try {
            const response = await axiosInstance.post(
              `/message/send-message/${conversation._id}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            console.log("Image message send response:", response.data);
            removeTempMessage(tempId);

            if (response.data?.data) {
              const newMessage = response.data.data;

              setMessages((prevMessages) =>
                prevMessages
                  .filter((msg) => msg._id !== tempId)
                  .concat({
                    ...newMessage,
                    sender: currentUser,
                  })
              );

              socket.emit("sendMessage", {
                message: newMessage,
                conversationId: conversation._id,
                senderId: currentUser._id,
              });

              requestAnimationFrame(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              });
            }
          } catch (error) {
            console.error("Error sending image:", error);
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === tempId ? { ...msg, status: "error" } : msg
              )
            );
          }
        }

        return;
      }

      // --- GỬI FILE ---
if (messageData?.type === "file") {
  const file = messageData.files?.[0];
  if (!file) return;

  const tempId = `temp-${Date.now()}`;
  const tempMessage = {
    _id: tempId,
    url: file.url,
    fileName: file.fileName || "file.txt",
    sender: currentUser,
    conversation: conversation._id,
    createdAt: new Date().toISOString(),
    status: "sending",
    type: "FILE",  // Đảm bảo type là "file"
  };

  // Lưu tin nhắn tạm thời để hiển thị trong UI
  setTempMessages((prev) => [...prev, tempMessage]);

  const formData = new FormData();
  formData.append("files", {
    uri: file.url,
    name: file.fileName || "file.txt",
    type: file.type || "application/octet-stream", // Đảm bảo MIME type là chuẩn
  });
  formData.append("conversationId", conversation._id);
  formData.append("type", "FILE");  // Gửi đúng loại tệp

  try {
    // Gửi tệp tin lên server
    const response = await axiosInstance.post(
      `/message/send-message/${conversation._id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Upload response:", response.data); // Debugging the response

    if (response.data?.data?.url) {
      // Xóa tin nhắn tạm thời sau khi gửi thành công
      removeTempMessage(tempId);

      const newMessage = response.data.data;

      // Đảm bảo rằng bạn cập nhật đúng loại tệp khi lưu vào state
      setMessages((prevMessages) =>
        prevMessages
          .filter((msg) => msg._id !== tempId) // Xóa tin nhắn tạm
          .concat({
            ...newMessage,
            sender: currentUser, // Gắn thông tin người gửi
            type: "file",  // Đảm bảo type là "file"
          })
      );

      // Gửi tin nhắn qua socket
      socket.emit("sendMessage", {
        message: newMessage,
        conversationId: conversation._id,
        senderId: currentUser._id,
      });

      // Cuộn xuống cuối danh sách tin nhắn
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    } else {
      console.error("Upload response is invalid or missing URL");
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "error" } : msg
        )
      );
    }
  } catch (error) {
    console.error("Error sending file:", error);

    // Xử lý lỗi bằng cách thay đổi trạng thái của tin nhắn tạm thời
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === tempId ? { ...msg, status: "error" } : msg
      )
    );
  }

  return;
}


      // --- GỬI VỊ TRÍ ---
      if (messageData?.type === "location") {
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          _id: tempId,
          content: messageData.content,
          preview: messageData.preview,
          sender: currentUser,
          conversation: conversation._id,
          createdAt: new Date().toISOString(),
          status: "sending",
          type: "location",
        };

        setTempMessages((prev) => [...prev, tempMessage]);

        const response = await axiosInstance.post(
          `/message/send-message/${conversation._id}`,
          {
            content: messageData.content,
            preview: messageData.preview,
          }
        );

        removeTempMessage(tempId);

        if (response.data?.data) {
          const newMessage = response.data.data;

          setMessages((prevMessages) =>
            prevMessages
              .filter((msg) => msg._id !== tempId)
              .concat({
                ...newMessage,
                sender: currentUser,
              })
          );

          socket.emit("sendMessage", {
            message: newMessage,
            conversationId: conversation._id,
            senderId: currentUser._id,
          });

          requestAnimationFrame(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          });
        }

        return;
      }

      // --- GỬI VĂN BẢN ---

      const finalContent = messageData?.content || currentContent;

      if (!finalContent.trim()) return;

      setNewMessage("");
      Keyboard.dismiss();

      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        content: finalContent,
        sender: currentUser,
        conversation: conversation._id,
        createdAt: new Date().toISOString(),
        status: "sending",
        type: "text",
      };

      setTempMessages((prev) => [...prev, tempMessage]);

      const response = await axiosInstance.post(
        `/message/send-message/${conversation._id}`,
        { content: finalContent }
      );

      removeTempMessage(tempId);

      if (response.data?.data) {
        const newMessage = response.data.data;

        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => msg._id !== tempId)
            .concat({
              ...newMessage,
              sender: currentUser,
            })
        );

        socket.emit("sendMessage", {
          message: newMessage,
          conversationId: conversation._id,
          senderId: currentUser._id,
        });

        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.log("Error details:", error.response?.data);
    }
  };

  //submit  TextInput
  const handleSubmitEditing = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  //  press send button
  const handlePressSend = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  const handlePressLike = () => {
    sendMessage({ type: "text", content: "👍" });
  };

  const retryMessage = async (tempMessage) => {
    try {
      updateTempMessageStatus(tempMessage._id, "sending");

      const messageData = {
        content: tempMessage.content,
      };

      // Send through socket for real-time
      socket.emit("sendMessage", {
        conversationId: conversation._id,
        content: tempMessage.content,
      });

      // Send to API
      const response = await axiosInstance.post(
        `/message/send-message/${conversation._id}`,
        messageData
      );

      if (response.data) {
        removeTempMessage(tempMessage._id);
        setMessages((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error("Error retrying message:", error);
      console.log("Error details:", error.response?.data);
      updateTempMessageStatus(tempMessage._id, "error");
    }
  };

  const handleCamera = async () => {
    setCapturedImage(null);
    console.log("reset capturedImage");

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Tạo fileName nếu asset không có
        const timestamp = Date.now();
        const fileName = asset.fileName || `image_${timestamp}.jpg`;

        // Đường dẫn mới (lưu trữ ảnh ở thư mục riêng)
        const newPath = `${FileSystem.documentDirectory}${fileName}`;

        try {
          // Sao chép file ảnh sang thư mục mới để đảm bảo là ảnh mới
          await FileSystem.copyAsync({
            from: asset.uri,
            to: newPath,
          });

          // Cập nhật asset với uri mới
          const copiedAsset = {
            ...asset,
            uri: newPath,
            fileName,
          };

          setCapturedImage(copiedAsset); // Hiển thị ảnh preview
          setIsUploading(true);

          // Tiến hành upload ảnh mới
          const uploadResponse = await handleMediaUpload(
            copiedAsset,
            "image",
            fileName
          );

          if (uploadResponse && uploadResponse.url) {
            console.log("✅ Upload successful, image URL:", uploadResponse.url);

            const messageData = {
              files: [
                {
                  _id: uploadResponse._id,
                  fileName: fileName,
                  url: uploadResponse.url, // Không cần thêm `?t=`
                },
              ],
              type: "image",
            };

            // Gửi tin nhắn với ảnh
            await sendMessage(messageData);
            console.log("✅ Message sent with image:", uploadResponse.url);
            setCapturedImage(null); // Dọn sạch ảnh đã chụp sau khi gửi xong
          } else {
            console.error("❌ Upload response is invalid or missing URL");
          }
        } catch (err) {
          console.error("❌ Error uploading image:", err);
          alert("Upload thất bại");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (err) {
      console.error("❌ Error using camera:", err);
      alert("Không thể mở camera");
    }

    setShowOptions(false);
  };

  const handleGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need gallery permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (!result.canceled) {
        setIsUploading(true);
        try {
          const uploadPromises = result.assets.map(async (asset) => {
            console.log("Selected image asset:", asset);

            const uploadResponse = await handleMediaUpload(asset, "image");

            if (uploadResponse && uploadResponse.url) {
              console.log("Upload successful, image URL:", uploadResponse.url);

              const messageData = {
                files: [
                  {
                    _id: uploadResponse._id,
                    fileName: asset.fileName,
                    url: uploadResponse.url,
                  },
                ],
                type: "image",
              };

              console.log("Prepared message data to send:", messageData);

              await sendMessage(messageData);

              console.log(
                "Message sent successfully with image:",
                uploadResponse.url
              );
            } else {
              console.error("Upload response is invalid or missing URL");
            }
          });

          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("Error uploading images:", error);
          alert("Error uploading images");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
      alert("Error accessing gallery");
      setIsUploading(false);
    }
    setShowOptions(false);
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });
  
      if (
        result.type === "success" ||
        (Array.isArray(result.assets) && result.assets.length > 0)
      ) {
        setIsUploading(true);
        try {
          const files = Array.isArray(result.assets) ? result.assets : [result];
          const uploadPromises = files.map(async (file) => {
            console.log("Selected file asset:", file);
  
            const uploadResponse = await handleMediaUpload(file, "file");
  
            if (uploadResponse && uploadResponse.url) {
              console.log("Upload successful, file URL:", uploadResponse.url);
  
              const messageData = {
                files: [
                  {
                    fileName: file.name,
                    url: uploadResponse.url,
                    // Nếu cần _id, bạn có thể truyền từ backend về kèm với URL
                  },
                ],
                type: "file",
              };
  
              console.log("Prepared message data to send:", messageData);
  
              await sendMessage(messageData);
  
              console.log(
                "Message sent successfully with file:",
                uploadResponse.url
              );
            } else {
              console.error("Upload response is invalid or missing URL");
            }
          });
  
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("Error processing documents:", error);
          alert("Error processing documents");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking documents:", error);
      alert("Error selecting documents");
      setIsUploading(false);
    }
    setShowOptions(false);
  };
  

  const handleLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const locationMessage = {
        type: "location",
        content: `${latitude},${longitude}`,
        preview: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`, // Ảnh xem trước vị trí
      };

      console.log("Prepared location message to send:", locationMessage);

      await sendMessage(locationMessage);

      console.log("Location message sent successfully");
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Error getting location");
    }
    setShowOptions(false);
  };

  const handleMediaUpload = async (asset, type) => {
    try {
      if (!asset || !asset.uri) {
        throw new Error("Invalid asset provided");
      }
  
      // Kiểm tra loại file dựa trên `type` và các đuôi file hoặc MIME type
      let fileExtension, mimeType;
  
      // Nếu `type` là ảnh
      if (type === "image") {
        fileExtension = "jpg"; // Mặc định ảnh là jpg
        mimeType = "image/jpeg";
      }
      // Nếu `type` là video
      else if (type === "video") {
        fileExtension = "mp4"; // Mặc định video là mp4
        mimeType = "video/mp4";
      }
      // Nếu `type` là các file tài liệu (pdf, txt, ppt, ...)
      else {
        // Tìm phần mở rộng dựa trên tên file nếu không có `type`
        const extension = asset.name.split(".").pop().toLowerCase();
  
        // Kiểm tra đuôi file và quyết định loại
        if (["pdf", "txt", "doc", "docx", "ppt", "pptx"].includes(extension)) {
          fileExtension = extension;
          mimeType = "application/octet-stream"; // Hoặc thay bằng mimeType chính xác cho các tài liệu
          type = "file"; // Cập nhật lại type cho file
        } else {
          throw new Error("Unsupported file type");
        }
      }
  
      const fallbackName = `media.${fileExtension || "txt"}`;
      const fallbackMime = mimeType || "application/octet-stream";
  
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.name || asset.fileName || fallbackName,
        type: asset.mimeType || fallbackMime,
      });
  
      // Thực hiện upload file
      const response = await axiosInstance.post("/upload-test/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Response from upload:", response);
  
      const fileUrl = response?.data?.data;
      const success = response?.data?.success;
  
      if (success && fileUrl && typeof fileUrl === "string") {
        console.log("✅ File URL:", fileUrl);
        return { url: fileUrl };
      } else {
        throw new Error("Upload failed: Missing success flag or file URL in response");
      }
    } catch (error) {
      console.error("❌ Error uploading media:", error);
      alert("⚠️ Failed to upload media");
      throw error;
    }
  };
  

  const getFileTypeForDatabase = (mimeType = "", fileName = "") => {
    const ext = fileName.split(".").pop()?.toLowerCase(); // Lấy đuôi file
  
    // Các định dạng hình ảnh
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  
    // Các định dạng file (PDF, DOCX, PPTX, TXT, ...)
    const fileTypes = ["pdf", "doc", "docx", "txt", "xlsx", "xls", "ppt", "pptx"];
  
    // Nếu là hình ảnh
    if (mimeType.startsWith("image/") || imageTypes.includes(ext)) {
      return "IMAGE";
    }
  
    // Nếu là file (PDF, DOCX, PPTX, TXT,...)
    if (fileTypes.includes(ext) || mimeType.startsWith("application/")) {
      return "FILE";
    }
  
    return "FILE"; // Fallback mặc định là FILE nếu không xác định được
  };
  

  const renderMessage = ({ item }) => {
    if (!item || !item.sender) {
      console.log("Invalid message item:", item);
      return null;
    }

    const isMyMessage = currentUser && item.sender._id === currentUser._id;
    const isTemp = item._id.startsWith("temp-");

    const renderMessageContent = () => {
      switch (item.type) {
        case "IMAGE":
          const imageUrl = item.files.length > 0 ? item.files[0].url : "";

          if (!imageUrl) {
            console.warn("No image URL found");
            return null;
          }

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ImageViewer", { uri: imageUrl })
              }
              style={styles.mediaContainer}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              {isTemp && item.status === "sending" && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        case "video":
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("VideoPlayer", { uri: item.content })
              }
              style={styles.mediaContainer}
            >
              <Image
                source={{ uri: item.thumbnail || item.content }}
                style={styles.videoThumbnail}
              />
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="white" />
              </View>
              {isTemp && item.status === "sending" && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        case "FILE":
          const file = item.files && item.files[0];
          const fileName = file?.fileName || "File";
          const fileUrl = file?.url || "";
          // console.log("file name ---:", fileName);

          if (!fileUrl) {
            console.warn("No file URL found");
            return null;
          }

          const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`;
          return (
            <TouchableOpacity
              style={styles.fileContainer}
              onPress={() => Linking.openURL(viewerUrl)}
            >
              <View style={styles.rowContainer}>
                <Ionicons
                  name={getFileIcon(fileName)}
                  size={27}
                  color={isMyMessage ? "white" : "#666"}
                />
                <Text
                  style={[
                    styles.fileName,
                    isMyMessage && styles.userMessageText,
                  ]}
                  numberOfLines={1}
                >
                  {fileName || "Unnamed File"}
                </Text>
              </View>

              {isTemp && item.status === "sending" && (
                <ActivityIndicator
                  size="small"
                  color={isMyMessage ? "#fff" : "#666"}
                  style={{ marginTop: 5 }}
                />
              )}
            </TouchableOpacity>
          );

        case "location":
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MapViewer", {
                  latitude: parseFloat(item.content.split(",")[0]),
                  longitude: parseFloat(item.content.split(",")[1]),
                })
              }
            >
              <Image
                source={{ uri: item.preview }}
                style={styles.locationPreview}
              />
            </TouchableOpacity>
          );
        default:
          return (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.userMessageText : styles.friendMessageText,
              ]}
            >
              {item.content || ""}
            </Text>
          );
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isMyMessage ? styles.userMessage : styles.friendMessage,
        ]}
        onLongPress={() => {
          if (isTemp && item.status === "error") {
            retryMessage(item);
          }
        }}
      >
        {!isMyMessage && (
          <Image
            source={
              item.sender.avatar
                ? { uri: item.sender.avatar }
                : require("../../../assets/chat/man.png")
            }
            style={styles.messageAvatar}
          />
        )}
        <View style={styles.messageContent}>
          {renderMessageContent()}
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {item.createdAt ? format(new Date(item.createdAt), "HH:mm") : ""}
            </Text>
            {isTemp && (
              <View style={styles.messageStatus}>
                {item.status === "sending" && (
                  <ActivityIndicator size="small" color="#999" />
                )}
                {item.status === "error" && (
                  <TouchableOpacity onPress={() => retryMessage(item)}>
                    <Ionicons name="reload" size={16} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Utility functions
  const getFileIcon = (fileName) => {
    if (!fileName) return "document-outline";
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "document-text-outline";
      case "doc":
      case "docx":
        return "document-text-outline";
      case "xls":
      case "xlsx":
        return "document-text-outline";
      case "zip":
      case "rar":
        return "archive-outline";
      default:
        return "document-outline";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMessages();
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReturn}>
            <Icon name="chevron-left" size={30} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.friendName}>Loading...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0099ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReturn}>
          <Icon name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Image
          source={
            otherUser?.avatar
              ? { uri: otherUser.avatar }
              : require("../../../assets/chat/man.png")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.friendName}>
            {otherUser
              ? otherUser.name || `${otherUser.firstName} ${otherUser.lastName}`
              : "Chat"}
          </Text>
          <Text style={styles.statusUser}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="videocamera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather
              name="more-horizontal"
              size={24}
              color="white"
              onPress={() => {
                if (otherUser) {
                  navigation.navigate("UserInfo", { user: otherUser });
                }
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={combinedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messageList}
        inverted={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        ref={flatListRef}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <View style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color="#0099ff" />
            <Ionicons
              name="add"
              size={20}
              color="white"
              style={{ position: "absolute" }}
            />
          </View>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
          onSubmitEditing={handleSubmitEditing}
        />

        {newMessage.trim().length > 0 ? (
          <TouchableOpacity onPress={handlePressSend}>
            <Ionicons name="send" size={28} color="#0099ff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handlePressLike}>
            <Ionicons name="thumbs-up" size={28} color="#0099ff" />
          </TouchableOpacity>
        )}
      </View>

      <ChatOptions
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onLocation={handleLocation}
        onDocument={handleDocument}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#135CAF",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  statusUser: {
    fontSize: 12,
    color: "white",
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  messageList: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "100%",
    width: "auto",
    flexWrap: "wrap",
  },
  messageContent: {
    padding: 10,
    borderRadius: 15,
    maxWidth: "90%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0099ff",
  },
  friendMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e4e4e4",
  },
  userMessageText: {
    color: "white",
  },
  friendMessageText: {
    color: "black",
  },
  messageTime: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addButton: {
    position: "relative",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  videoContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    position: "relative",
    marginVertical: 5,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fileContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "transparent",
    maxWidth: "100%",
    borderRadius: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
    flexShrink: 1,
    overflow: "hidden",
  },
  userMessageText: {
    color: "white",
  },

  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageStatus: {
    marginLeft: 4,
  },
  mediaContainer: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatDetailScreen;
