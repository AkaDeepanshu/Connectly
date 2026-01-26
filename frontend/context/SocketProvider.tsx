'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import {io, Socket} from 'socket.io-client';

interface ISocketContext {
    sendMessage: (message:string)=>any;
    messages:string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () =>{
    const state = useContext(SocketContext);
    if(!state) throw new Error('state is not defined');
    return state;
};

interface SocketProviderProps {
    children?: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) =>{

    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<string[]>([]);

    const sendMessage:ISocketContext["sendMessage"] = useCallback((msg)=>{
        console.log("Send Message", msg);
        socket?.emit("message:send",{message:msg})
    },[socket]) 

    const onMessageReceived = useCallback((msg:string)=>{
        console.log("Message received from server:",msg);
        const {message} = JSON.parse(msg) as {message:string};
        setMessages(prev=>[...prev, message]);
    },[]);

    useEffect(()=>{
        const _socket = io("http://localhost:5000");
        setSocket(_socket);

        _socket.on("message:new",onMessageReceived);

        _socket.on("connection", () => {
            console.log("Connected to socket server");
        });
        return () => {
            _socket.off("message:new",onMessageReceived);
            _socket.disconnect();
            setSocket(undefined);
        };
    },[]);

    return (
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    )
}