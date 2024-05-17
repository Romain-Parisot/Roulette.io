import React, { useState, useEffect } from "react";
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

  let counterInterval: NodeJS.Timeout;

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
      setStack((prevStack) => prevStack - bet.amount);
    }
  };

  useEffect(() => {
    if (counter === 0) {
      spinWheel();
      setCounter(10);
    }
    counterInterval = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    return () => clearInterval(counterInterval); // Cleanup on unmount
  }, [bet, counter]);

  const placeBet = (newBet: number | string, amount: number) => {
    if (amount > stack) {
      return;
    }
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
              onChange={(e) => placeBet(i + 1, Number(e.target.value))}
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
      <div className="boardimage">
        <img src={RouletteImages} alt="Roulette Table" />
      </div>
    </div>
  );
}

export default Roulette;
