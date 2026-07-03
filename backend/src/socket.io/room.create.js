const socketToemail = new Map()
const emailToSocket = new Map()

const roomConnection = (io, socket) => {

  socket.on("register-user", (userId) => {
     if (userId) {
       socket.join(`user:${userId}`)
     }
  })

  socket.on("join-room", (user, roomId, email) => {
     emailToSocket.set(email, socket.id);
     socketToemail.set(socket.id, email);
     
     socket.join(roomId);

     // Notify everyone else in the room
     socket.to(roomId).emit("user-joined", `${user} with emailID ${email} joined the room`);
     
     // Send a confirmation event back to the user who just joined
     socket.emit("room-connected", `You successfully joined room ${roomId}`);
  });

  socket.on("send-message", (payload) => {
     const { roomId, message, sender } = payload || {};
     if (!roomId || !message) return;

     io.to(roomId).emit("receive-message", {
       roomId,
       message,
       sender,
       createdAt: new Date().toISOString(),
     });
  });

  socket.on("typing", ({ roomId, user }) => {
     if (roomId) socket.to(roomId).emit("typing", { roomId, user });
  });

  socket.on("stop-typing", ({ roomId, user }) => {
     if (roomId) socket.to(roomId).emit("stop-typing", { roomId, user });
  });
}

const roomDisconnection = (io, socket) => {
  socket.on("leave-room", (userId, roomId) => {
      socket.to(roomId).emit("user-left", `${userId} left the room`);
      socket.leave(roomId);
  });
}



export {roomConnection,roomDisconnection}
