import { Server } from "socket.io";

let io;

export const initSocket = (server, originChecker) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!originChecker || originChecker(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
