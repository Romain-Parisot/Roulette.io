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

// Declare a variable to keep track of users in each room
const usersInRooms = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.broadcast.emit("user connected");

  socket.on("sendMessage", (room, message) => {
    console.log(`Message received: ${message} in room ${room}`);
    io.to(room).emit("receiveMessage", message);
    console.log("message: " + message);
  });

  socket.on("updateCounter", (room, counter) => {
    if (counter === 0) {
      counter = 10;
    } else {
      counter = counter - 1;
    }
    io.to(room).emit("counterUpdated", counter);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.broadcast.emit("user disconnected");
  });

  // Modify the join handler to accept the username
  socket.on("join", (room, username) => {
    console.log("User joining room:", username);
    if (io.sockets.adapter.rooms.get(room)?.size >= 5) {
      console.log(`Room ${room} is full.`);
      return;
    }
    if (usersInRooms[room]?.find((user) => user.username === username)) {
      console.log(`Username ${username} is already taken in room ${room}.`);
      return;
    }
    if (username === undefined) {
      console.log("Username is undefined.");
      return;
    }
    socket.join(room);
    console.log("room: " + room);
    socket.emit("roomJoined", room);

    // Emit the list of users in the room to the newly joined user
    const users = usersInRooms[room]?.slice() || [];
    io.to(room).emit("usersList", users);

    // Update the global usersInRooms object
    if (!usersInRooms[room]) {
      usersInRooms[room] = [{ id: socket.id, username }];
    } else {
      usersInRooms[room].push({ id: socket.id, username });
    }

    // Emit the updated list of users to all users in the room
    io.to(room).emit("updatedUsersList", usersInRooms[room]);

    // Handle requests to get the current list of users in a room
    socket.on("getUsersList", (room) => {
      const users = usersInRooms[room]?.slice() || [];
      socket.emit("usersList", users);
    });
  });

  socket.on("spinWheel", (room) => {
    console.log(`Spinning roulette wheel in room ${room}`);
    const newNumber = Math.floor(Math.random() * 36); // Generate a random number between 0 and 35
    console.log(`The new number is: ${newNumber}`);
    io.to(room).emit("rouletteSpinResult", newNumber); // Emit the result to all clients in the room
  });

  socket.on("placeBet", (room, betDetails) => {
    console.log(`Placing bet in room ${room}: ${JSON.stringify(betDetails)}`);
    // Implement logic to handle the bet placement and determine the winner
    // This could involve checking the bet against the newNumber and updating the usersInRooms object accordingly
    // For simplicity, this example just logs the bet details
  });

  socket.on("leave", (room) => {
    console.log("leave room: " + room);
    socket.leave(room);
    io.to(room).emit("leave", room);
  });
});

server.listen(PORT, () => {
  console.log("Server ip : http://" + ip.address() + ":" + PORT);
});
