import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Roulette.css";

// Import socket.io-client
import io from "socket.io-client";

const BACKEND_URL = "http://localhost:3000"; // Update this URL to match your backend server

type Bet = { number: number | string; amount: number };

function Roulette() {
  let { roomName } = useParams<{ roomName?: string }>();
  const [bets, setBets] = useState<Bet[]>([]);
  const [betAmount, setBetAmount] = useState<undefined | number>(undefined);
  const [number, setNumber] = useState(0);
  const [stack, setStack] = useState(1000);
  const [counter, setCounter] = useState<number>(10);
  const [messages, setMessages] = useState<string[]>([]);

  const counterIntervalRef = useRef<NodeJS.Timeout>();
  const socketRef = useRef<any>();

  useEffect(() => {}, []);

  // Function to initialize the socket connection
  const initSocket = () => {
    const usernameInput = prompt("Enter your username:");
    socketRef.current = io(BACKEND_URL);
    if (usernameInput !== undefined) {
      socketRef.current.emit("join", roomName, usernameInput);
      socketRef.current.on("rouletteSpinResult", (newNumber: number) => {
        console.log("rouletteSpinResult");
        setNumber(newNumber);
      });
      socketRef.current.on("roomJoined", (roomName: string) => {
        console.log(`Joined room: ${roomName}`);
      });

      // Listen for the "usersList" event to log the users in the room
      socketRef.current.on("usersList", (users: string[]) => {
        console.log("Current users in the room:", users);
      });
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      socketRef.current.disconnect();
    };
  };

  // Inside Roulette.tsx

  useEffect(() => {
    initSocket();

    // Add the listener for receiving messages here
    socketRef.current.on("receiveMessage", (message: string) => {
      console.log("yo");
      console.log("receiveMessage", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  const betsRef = useRef(bets);
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  const spinWheel = () => {
    socketRef.current.emit("spinWheel", roomName);
    socketRef.current.on("rouletteSpinResult", (newNumber: number) => {
      console.log("rouletteSpinResult", newNumber);
      setNumber(newNumber);

      const redNumbers = [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
      ];
      const blackNumbers = [
        2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
      ];

      betsRef.current.forEach((bet) => {
        if (bets.includes(bet)) {
          // Add this line
          if (bet.number === newNumber) {
            setStack((prevStack) => prevStack + bet.amount * 36);
          } else if (
            (bet.number === "even" && newNumber % 2 === 0) ||
            (bet.number === "odd" && newNumber % 2 !== 0)
          ) {
            setStack((prevStack) => prevStack + bet.amount * 2);
          } else if (
            (bet.number === "red" && redNumbers.includes(newNumber)) ||
            (bet.number === "black" && blackNumbers.includes(newNumber))
          ) {
            setStack((prevStack) => prevStack + bet.amount * 2);
          }
        }
      });

      // Reset bets after spinning the wheel
      setBets([]);
    });
  };

  useEffect(() => {
    console.log("after reset bets" + bets);
  }, [bets]);

  useEffect(() => {
    if (counter === 0) {
      spinWheel();
      socketRef.current.emit("updateCounter", roomName, counter);
    }
    counterIntervalRef.current = setInterval(() => {
      socketRef.current.emit("updateCounter", roomName, counter);
      socketRef.current.on("counterUpdated", (counter: number) => {
        setCounter(counter);
      });
    }, 1000);

    return () => clearInterval(counterIntervalRef.current);
  }, [counter]);

  function getColor(number: number) {
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    return redNumbers.includes(number) ? "red" : "black";
  }

  const handleCellClick = (number: number | string) => {
    // Check if the user has enough stack to place the bet
    if (betAmount === undefined || stack < betAmount) {
      return;
    }

    // Find the index of the existing bet for the selected number
    const existingBetIndex = bets.findIndex((bet) => bet.number === number);

    if (existingBetIndex !== -1) {
      // If the bet exists, update its amount
      setBets((prevBets) => {
        const newBets = [...prevBets];
        // Increment the existing bet amount by the amount you want to bet
        newBets[existingBetIndex].amount += betAmount / 2;
        return newBets;
      });
    } else {
      // If the bet does not exist, add a new one
      setBets((prevBets) => [...prevBets, { number, amount: betAmount }]);
    }

    // Deduct the bet amount from the stack
    setStack((prevStack) => prevStack - betAmount);
  };

  // Add a new function to handle clicking on a token
  const handleTokenClick = (amount: number) => {
    setBetAmount(amount);
  };

  // Fixed setInterval call
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Bet amount: " + betAmount);
    }, 1000);
    return () => clearInterval(intervalId); // Clear interval on cleanup
  }, [betAmount]); // Depend on betAmount so it updates correctly

  const sendMessage = (room: string, message: string) => {
    socketRef.current.emit("sendMessage", room, message);
  };

  return (
    <div className="board">
      {counter !== null && <div>Spinning in {counter} seconds...</div>}
      <div>The number is: {number}</div>
      <div>Your stack: {stack}</div>
      <div className="parentOverlay">
        <div className="mainOverlay">
          <div className="greencell" onClick={() => handleCellClick(number)}>
            0
            {bets.find((bet) => bet.number === number) && (
              <div className="token">
                {bets.find((bet) => bet.number === number)?.amount || ""}
              </div>
            )}
          </div>

          {Array.from({ length: 36 }, (_, i) => i + 1).map((number) => (
            <div
              key={number}
              className={`cell ${getColor(number)}`}
              onClick={() => handleCellClick(number)}
            >
              {number}
              {bets.find((bet) => bet.number === number) && (
                <div className="token">
                  {bets.find((bet) => bet.number === number)?.amount || ""}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="sideOverlay">
          <div className="cell green" onClick={() => handleCellClick("even")}>
            Even
            {bets.find((bet) => bet.number === "even") && (
              <div className="token">
                {bets.find((bet) => bet.number === "even")?.amount || ""}
              </div>
            )}
          </div>
          <div className="cell red" onClick={() => handleCellClick("red")}>
            Red
            {bets.find((bet) => bet.number === "red") && (
              <div className="token">
                {bets.find((bet) => bet.number === "red")?.amount || ""}
              </div>
            )}
          </div>
          <div className="cell black" onClick={() => handleCellClick("black")}>
            Black
            {bets.find((bet) => bet.number === "black") && (
              <div className="token">
                {bets.find((bet) => bet.number === "black")?.amount || ""}
              </div>
            )}
          </div>
          <div className="cell green" onClick={() => handleCellClick("odd")}>
            Odd
            {bets.find((bet) => bet.number === "odd") && (
              <div className="token">
                {bets.find((bet) => bet.number === "odd")?.amount || ""}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="tokenOverlay">
        <div className="token2" onClick={() => handleTokenClick(1)}>
          1
        </div>
        <div className="token2" onClick={() => handleTokenClick(5)}>
          5
        </div>
        <div className="token2" onClick={() => handleTokenClick(10)}>
          10
        </div>
        <div className="token2" onClick={() => handleTokenClick(50)}>
          50
        </div>
        <div className="token2" onClick={() => handleTokenClick(100)}>
          100
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const messageInput = document.getElementById(
            "messageInput"
          ) as HTMLInputElement;
          if (roomName) {
            sendMessage(roomName, messageInput.value);
            messageInput.value = "";
          }
        }}
      >
        <input id="messageInput" type="text" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
      <div className="chat">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
}

export default Roulette;
