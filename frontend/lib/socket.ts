import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

export const socket = io(SOCKET_URL, {
    path: '/socket.io/',
    autoConnect: false,
});

export const connectSocket = (token: string) => {
    socket.auth = { token };
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};
