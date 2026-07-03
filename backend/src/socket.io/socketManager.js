import { Server } from "socket.io";


let io;

const initSocket = (httpServer) => {

  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  return io;
};

const getIO = () => {

  if (!io) {
    throw new Error(
      "Socket.IO not initialized"
    );
  }

  return io;
};

export { initSocket, getIO };