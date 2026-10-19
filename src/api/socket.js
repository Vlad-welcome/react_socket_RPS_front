import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_FRONT_API || "http://localhost:3000", {
  autoConnect: false,
  withCredentials: true,
});
