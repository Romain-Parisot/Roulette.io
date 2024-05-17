const express = require("express");
const http = require("http");
const ip = require("ip");
const Server = require("socket.io").Server;
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.get("/", (req, res) => {
  res.json("ip address: http://" + ip.address() + ":" + PORT);
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.broadcast.emit("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.broadcast.emit("user disconnected");
  });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg);
  });

  socket.on("room", (room, msg) => {
    console.log("room: " + room + " message: " + msg);
    io.to(room).emit("message", msg);
  });

  socket.on("users", (room, users) => {
    console.log("room: " + room + " users: " + users);
    io.to(room).emit("users", users);
  });

  socket.on("join", (room) => {
    console.log("join room: " + room);
    if (io.sockets.adapter.rooms.get(room)?.size >= 5) {
      console.log(`Room ${room} is full.`);
      return;
    }
    socket.join(room);
    io.to(room).emit("join", room);
  });

  socket.on("leave", (room) => {
    console.log("leave room: " + room);
    socket.leave(room);
    io.to(room).emit("leave", room);
  });
});

// app.get("/room/:roomName", (req, res) => {
//   const roomName = req.params.roomName;
//   const room = io.sockets.adapter.rooms.get(roomName);
//   if (!room) {
//     res.json({ room: roomName, users: [] });
//     return;
//   }
//   res.json({ room: roomName, users: Array.from(room) });
// });

server.listen(PORT, () => {
  console.log("Server ip : http://" + ip.address() + ":" + PORT);
});
