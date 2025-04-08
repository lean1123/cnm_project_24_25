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
    role?: string[];
}

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    role: string[];
    refreshToken?: string;
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