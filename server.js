const express = require('express');
// const cors = require("cors");
const app = express();
// app.use(cors());
const server = require('http').createServer(app);
const io = require('socket.io')(server)
const PORT = process.env.PORT || 1234;

const { addUser, getUserDetail, removeUser, getHostDetail } = require("./util/userManagement");

console.log(`server start at port ${PORT}`);
io.on("connection", (socket) => {
    console.log(`socket ID: ${socket.id} connected`);
    
    socket.on("joinroom", ({ roomId, host, name }) => {
        socket.join(roomId);
      console.log("user joined: ",{ roomId, host, name })
        addUser({ id: socket.id, room: roomId, host, name });
        const userDetail = getUserDetail(socket.id);
        socket.emit("joinroom", {host: userDetail.host ,roomId, name})
        const hostDetail = getHostDetail(roomId);
        console.log(hostDetail)
        if (hostDetail) {
          console.log("sending syncwithhost", JSON.stringify(hostDetail));
          socket.broadcast.to(hostDetail.id).emit("syncwithhost");
        }
    })

    socket.on("onplay", ({ roomId, videoState }) => {
      const userDetail = getUserDetail(socket.id);
      if(userDetail)
      socket.broadcast.to(roomId).emit("onplay", {host: userDetail.host, videoState });
    });

    socket.on("onpause", ({roomId, videoState}) => {
      const userDetail = getUserDetail(socket.id);
      if (userDetail)
        socket.broadcast
          .to(roomId)
          .emit("onpause", { host: userDetail.host, videoState });
    })

    socket.on("onseeked", ({ roomId, videoState}) => {
      const userDetail = getUserDetail(socket.id);
      socket.broadcast.to(roomId).emit("onseeked", {host: userDetail.host, videoState });
    })

    socket.on("syncwithhost", ({roomId}) => {
      const hostDetail = getHostDetail(roomId);
      console.log(hostDetail)
      if(hostDetail)
      socket.broadcast.to(hostDetail.id).emit("syncwithhost");
    });

    socket.on("hostvideostate", ({roomId, videoState}) => {
      // console.log("hostvideostate", { roomId, videoState })
      socket.broadcast.to(roomId).emit("hostvideostate", {hostVideoState: videoState});
    });

    socket.on("notify", (messageData) => {
      const { name, message, host, roomId } = messageData
      socket.broadcast.to(roomId).emit("notify", { name, message, host, roomId })
    });

    socket.on("chatmessage", (messageData) => {
      const { name, message, host, roomId } = messageData
      socket.broadcast.to(roomId).emit("chatmessage", { name, message, host, roomId })
    });

    socket.on("disconnect", () => {
      console.log(`socket ID: ${socket.id} disconnected`);
      const userDetail = getUserDetail(socket.id);
      if(userDetail) {
        socket.to(userDetail.room).emit("notify", { ...userDetail, message: `${userDetail.name} left`})
        socket.leave(userDetail.room);
      }
      removeUser(socket.id);
    })

})

server.prependListener("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

server.listen(PORT, () => {
  console.log(`server is started at ${PORT}`);
})