const { Server } = require("socket.io");

let ioInstance = null;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", (roomId) => {
      if (roomId) {
        socket.join(roomId);
      }
    });

    socket.on("assistant-message", (payload) => {
      const roomId = payload?.roomId;
      if (roomId) {
        socket.to(roomId).emit("assistant-message", payload);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => ioInstance;

module.exports = {
  initSocket,
  getIO
};
