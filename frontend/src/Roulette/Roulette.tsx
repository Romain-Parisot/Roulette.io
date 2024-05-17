import React, { useState, useEffect, useRef } from "react";
import "./Roulette.css";
import RouletteImages from "../images/american-roulette-table-and-wheel.jpg";

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

  const spinWheel = () => {
    const newNumber = Math.floor(Math.random() * 36);
    setNumber(newNumber);

    if (bet.number === newNumber) {
      setStack((prevStack) => prevStack + bet.amount * 36);
    } else if (
      (bet.number === "even" && newNumber % 2 === 0) ||
      (bet.number === "odd" && newNumber % 2 !== 0)
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
      setCounter(10);
    }
    counterIntervalRef.current = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
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
            min="0"
            onChange={(e) => placeBet("odd", Number(e.target.value))}
          />
        </div>
        {/* Add more buttons for other bets */}
      </div>
      {/* <div className="boardimage">
        <img src={RouletteImages} alt="Roulette Table" />
      </div> */}
    </div>
  );
}

export default Roulette;
