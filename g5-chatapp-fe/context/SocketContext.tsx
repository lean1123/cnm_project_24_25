"use client"

import { getSocket } from "@/lib/socket";
import { get } from "http";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type SocketContextType = {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
})

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = getSocket();
        setSocket(socketInstance);
        return () => {
            socketInstance.disconnect();   
            setSocket(null); 
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}