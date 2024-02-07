import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextProps {
    children: React.ReactNode;
}

interface WebSocketContextType {
    socket: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketContextProps> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:8080');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
