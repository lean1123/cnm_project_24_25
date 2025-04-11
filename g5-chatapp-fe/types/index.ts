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
    gender: string;
    role: string[];
    dob: string;
    refreshToken?: string;
    _id?: string;
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
    admin?: string;
    members: Member [];
    lastMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

export type Member = {
    userId: string;
    fullName: string;
}

export type Message = {
    _id: string;
    conversation: string;
    sender: Member;
    content: string;
    files: MessageFile[] | null;
    deletedFor: any[];
    isRevoked: boolean;
    forwardFrom: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
    isTemp?: boolean;
    isError?: boolean;
}

export type MessageRequest = {
    content: string;
    files?: File[] | null;
    isRevoked?: boolean;
    forwardFrom?: string | null;
}

export type MessageFile = {
    fileName: string;
    url: string;
}
