const shortId = require("shortid");
const { addUser, getUsersInRoom, getUserDetail, removeUser, getHostDetail } = require("./util/userManagement");
const io = require("socket.io")(3000, {
  cors: {
    origin: true,
  },
});

io.sockets.on("connection", (socket) => {
    const roomId = "thisisrandomroomId";
    const userList = getUsersInRoom(roomId);
    if(userList.length == 0) addUser({id: socket.id,room: roomId, host: true });
    else addUser({id: socket.id, room: roomId, host: false});
      
    console.log(socket.id, roomId); 
    socket.emit("connected",{message: `${socket.id} connected to the server`});
    socket.on("create-room", () => {
        
        socket.join(roomId);
        const userDetail = getUserDetail(socket.id);
        socket.emit("create-room", {host: userDetail.host ,roomId})
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
      removeUser(socket.id);
    })

})