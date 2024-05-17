import React, { useState, useEffect, useRef } from "react";
import "./Roulette.css";

// Import socket.io-client
import io from "socket.io-client";

const BACKEND_URL = "http://localhost:3000"; // Update this URL to match your backend server

function Roulette() {
  const [bet, setBet] = useState<{ number: number | string; amount: number }>({
    number: 0,
    amount: 0,
  });
  const [number, setNumber] = useState(0);
  const [stack, setStack] = useState(1000);
  const [counter, setCounter] = useState<number>(10);

  // Use useRef to persist the interval across renders
  const counterIntervalRef = useRef<NodeJS.Timeout>();

  // Create a ref to hold the socket connection
  const socketRef = useRef();

  // Function to initialize the socket connection
  const initSocket = () => {
    socketRef.current = io(BACKEND_URL);
    socketRef.current.on("rouletteSpinResult", (newNumber) => {
      console.log("rouletteSpinResult");
      setNumber(newNumber);
    });
    socketRef.current.on("roomJoined", (roomName) => {
      console.log(`Joined room: ${roomName}`);
    });
    socketRef.current.emit("join", "Room1");

    // Clean up the socket connection when the component unmounts
    return () => {
      socketRef.current.disconnect();
    };
  };

  useEffect(() => {
    initSocket();

    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const spinWheel = () => {
    socketRef.current.emit("spinWheel", "Room1");
    socketRef.current.on("rouletteSpinResult", (newNumber) => {
      console.log("rouletteSpinResult", newNumber);
      setNumber(newNumber);
    });

    if (bet.number === number) {
      setStack((prevStack) => prevStack + bet.amount * 36);
    } else if (
      (bet.number === "even" && number % 2 === 0) ||
      (bet.number === "odd" && number % 2 !== 0)
    ) {
      setStack((prevStack) => prevStack + bet.amount * 2);
    } else {
      // Ensure the stack doesn't go below 0
      setStack((prevStack) => Math.max(prevStack - bet.amount, 0));
    }
  };

  useEffect(() => {
    if (counter === 0) {
      spinWheel();
      socketRef.current.emit("updateCounter", "Room1", counter);
    }
    counterIntervalRef.current = setInterval(() => {
      socketRef.current.emit("updateCounter", "Room1", counter);
      socketRef.current.on("counterUpdated", (counter) => {
        console.log("counterUpdated", counter);
        setCounter(counter);
      });
    }, 1000);

    return () => clearInterval(counterIntervalRef.current);
  }, [bet, counter]);

  const placeBet = (newBet: number | string, amount: number) => {
    // Check if the stack is sufficient for the bet
    if (stack < amount) {
      // Show an alert if the stack is too low
      window.alert("You do not have enough money.");
      return;
    }

    // Proceed with placing the bet if the stack is sufficient
    setBet({ number: newBet, amount: amount });
  };

  return (
    <div className="board">
      {counter !== null && <div>Spinning in {counter} seconds...</div>}
      <div>The number is: {number}</div>
      <div>Your stack: {stack}</div>
      <div className="betOverlay">
        Place your bet:
        {[...Array(36)].map((_, i) => (
          <div key={i}>
            {i + 1}
            <input
              type="number"
              min="0"
              onChange={(e) => {
                e.preventDefault(); // Prevent the default action

                // Extract the current input value
                const currentValue = Number(e.target.value);

                // Check if the current value exceeds the stack
                if (currentValue > stack) {
                  // If it does, set the input value to the stack
                  e.target.value = stack.toString();
                }

                // Proceed with the rest of your logic
                if (stack >= currentValue) {
                  placeBet(i + 1, currentValue);
                } else {
                  window.alert("You do not have enough money.");
                }
              }}
            />
          </div>
        ))}
        <div>
          {"Even"}
          <input
            type="number"
            min="0"
            onChange={(e) => placeBet("even", Number(e.target.value))}
          />
        </div>
        <div>
          {"Odd"}
          <input
            type="number"
            onChange={(e) => placeBet("odd", Number(e.target.value))}
          />
        </div>
        {/* Add more buttons for other bets */}
      </div>
    </div>
  );
}

export default Roulette;
