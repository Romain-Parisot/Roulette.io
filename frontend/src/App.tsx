import React from "react";
// import Board from "./Board/Board";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

function App() {
  const joinRoom = (roomName: string) => {
    console.log(`Joining room: ${roomName}`);
    socket.emit("join", roomName);
  };
  return (
    <div className="App">
      <header></header>
      <main>
        <div className="room" onClick={() => joinRoom("Room1")}>
          Room1
        </div>
        <div className="room" onClick={() => joinRoom("Room2")}>
          Room2
        </div>
        <div className="room" onClick={() => joinRoom("Room3")}>
          Room3
        </div>
        <div className="room" onClick={() => joinRoom("Room4")}>
          Room4
        </div>
      </main>
    </div>
  );
}

export default App;
