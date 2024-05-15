import React from "react";
// import Board from "./Board/Board";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import "./App.css";

const socket = io("http://localhost:3000");

function App() {
  const joinRoom = (roomName: string) => {
    console.log(`Joining room: ${roomName}`);
    socket.emit("join", roomName);
    // window.location.href = `http://localhost:3001/room/${roomName}`;
  };
  return (
    <div className="App">
      <header></header>
      <main>
        <Link to="/room/Room1">
          <div className="room" onClick={() => joinRoom("Room1")}>
            Room1
          </div>
        </Link>
        <Link to="/room/Room2">
          <div className="room" onClick={() => joinRoom("Room2")}>
            Room2
          </div>
        </Link>
        <Link to="/room/Room3">
          <div className="room" onClick={() => joinRoom("Room3")}>
            Room3
          </div>
        </Link>
        <Link to="/room/Room4">
          <div className="room" onClick={() => joinRoom("Room4")}>
            Room4
          </div>
        </Link>
      </main>
    </div>
  );
}

export default App;
