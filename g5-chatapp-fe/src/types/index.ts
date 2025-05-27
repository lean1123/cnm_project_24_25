export type DataLogin = {
    email: string;
    password: string;
};

export type DataRegister = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: string;
    dob: string;
    role?: string[];
}

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender?: string;
    role?: string[];
    dob?: string;
    refreshToken?: string;
    _id?: string;
    avatar?: string | null;
}

export type SocketUser = {
    userId: string;
    socketId: string;
}

export type Conversation = {
    _id: string;
    name?: string;
    profilePicture?: string | null;
    isGroup: boolean;
    members: Member [];
    lastMessage: LastMessage | null;
    createdAt: string;
    updatedAt: string;
}


export type LastMessage = {
    _id: string;
    sender: User;
    content: string;
    type: string;
    files: MessageFile[] | null;
    forwardFromConversation?: string | null;
}

export type Member = {
    user: User;
    role: string;
}

export type Message = {
    _id: string;
    conversation: string;
    sender: User;
    content: string;
    files: MessageFile[] | null;
    deletedFor: any[];
    isRevoked: boolean;
    forwardFrom?: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
    isTemp?: boolean;
    isError?: boolean;
    reactions?: Reactions[];
    replyTo?: ReplyTo | null;
    forwardFromConversation?: string | null;
}

export type ReplyTo = {
    _id: string;
    sender: User;
    content: string;
    type: string;
}

export type MessageRequest = {
    content: string;
    files?: File[] | null;
    isRevoked?: boolean;
    forwardFrom?: string | null;
    replyTo?: string | null;
}

export type MessageFile = {
    fileName: string;
    url: string;
}

export type Contact = {
    _id: string;
    user: User;
    contact: User;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export type UserUpdate = {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
}

// 
export type OngoingCallex = {
    callId: string;
    conversationId: string;
    callType: "audio" | "video";
    isCallActive: boolean;
    isCallAccepted: boolean;
    callStatus: string;
    callDuration: number;
}

export type OngoingCall = {
    sender: User;
    isRinging: boolean;
    type: string;
}

export type Reactions = {
    user: string
    reaction: string;
}

export type CreateGroupRequest = {
    name: string;
    members: string[];
    file?: File | null;
}

export type GenerateQRCodeRes = {
    sessionId: string;
    qrData: string;
}