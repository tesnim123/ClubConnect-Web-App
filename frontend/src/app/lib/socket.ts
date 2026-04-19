import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socketInstance: Socket | null = null;

const socketBaseUrl = API_BASE_URL.replace(/\/api$/, "");

export const getSocket = (token: string) => {
  if (!socketInstance) {
    socketInstance = io(socketBaseUrl, {
      autoConnect: false,
      auth: { token },
    });
  }

  socketInstance.auth = { token };

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
