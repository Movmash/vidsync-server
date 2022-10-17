const PORT = process.env.PORT || 3000;
const { addUser, getUserDetail, removeUser, getHostDetail } = require("./util/userManagement");
const io = require("socket.io")(PORT, {
  cors: {
    origin: '*',
  },
});
console.log(`server start at port ${PORT}`);
io.sockets.on("connection", (socket) => {
    console.log(`socket ID: ${socket.id} connected`);
    
    socket.on("joinroom", ({roomId, host}) => {
        socket.join(roomId);
        addUser({id: socket.id, room: roomId, host});
        const userDetail = getUserDetail(socket.id);
        socket.emit("joinroom", {host: userDetail.host ,roomId})
    })

    socket.on("onplay", ({ roomId, videoState }) => {
      const userDetail = getUserDetail(socket.id);
      socket.broadcast.to(roomId).emit("onplay", {host: userDetail.host, videoState });
    });

    socket.on("onpause", ({roomId, videoState}) => {
      const userDetail = getUserDetail(socket.id);
      socket.broadcast.to(roomId).emit("onpause", {host: userDetail.host, videoState})
    })

    socket.on("syncwithhost", ({roomId}) => {
      const hostDetail = getHostDetail(roomId);
      if(hostDetail)
      socket.broadcast.to(hostDetail.id).emit("syncwithhost");
    });

    socket.on("hostvideostate", ({roomId, videoState}) => {
      socket.broadcast.to(roomId).emit("hostvideostate", {hostVideoState: videoState});
    });

    socket.on("disconnect", () => {
      console.log(`socket ID: ${socket.id} disconnected`);
      const userDetail = getUserDetail(socket.id);
      if(userDetail)
        socket.leave(userDetail.room);
      removeUser(socket.id);
    })

})