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

  // Use useRef to persist the interval across renders
  const counterIntervalRef = useRef<NodeJS.Timeout>();

  // Create a ref to hold the socket connection
  const socketRef = useRef<any>();

  // Function to initialize the socket connection
  const initSocket = () => {
    socketRef.current = io(BACKEND_URL);
    socketRef.current.on("rouletteSpinResult", (newNumber: number) => {
      console.log("rouletteSpinResult");
      setNumber(newNumber);
    });
    socketRef.current.on("roomJoined", (roomName: string) => {
      console.log(`Joined room: ${roomName}`);
    });
    socketRef.current.emit("join", roomName);

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
    socketRef.current.emit("spinWheel", roomName);
    socketRef.current.on("rouletteSpinResult", (newNumber: number) => {
      console.log("rouletteSpinResult", newNumber);
      setNumber(newNumber);

      bets.forEach((bet) => {
        if (bet.number === newNumber) {
          setStack((prevStack) => prevStack + bet.amount * 36);
        } else if (
          (bet.number === "even" && newNumber % 2 === 0) ||
          (bet.number === "odd" && newNumber % 2 !== 0)
        ) {
          setStack((prevStack) => prevStack + bet.amount * 2);
        }
      });

      // Reset bets after spinning the wheel
      setBets([]);
    });
  };

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

  const handleCellClick = (number: number) => {
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
        <div className="rightOverlay"></div>
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
    </div>
  );
}

export default Roulette;
