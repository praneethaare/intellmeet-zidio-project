import {roomConnection,roomDisconnection} from './room.create.js'

const registerSocket = (io) => {

  io.on(
    "connection",
    (socket) => {
      console.log("User connected:", socket.id);
      roomConnection(io, socket);
     
      roomDisconnection(io, socket);
    }
  );

};

export { registerSocket };