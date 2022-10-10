const io = require("socket.io")(3000, {
  cors: {
    origin: true,
  },
});

io.on("connection", (socket) => {
    console.log(socket.id); 
    socket.emit("connected",{message: `${socket.id} connected to the server`});
})