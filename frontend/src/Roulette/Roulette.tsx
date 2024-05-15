import React, { useState } from "react";
import "./Roulette.css";
import RouletteImages from "../images/american-roulette-table-and-wheel.jpg";

function Roulette() {
  const [bet, setBet] = useState<{ number: number | string; amount: number }>({
    number: 0,
    amount: 0,
  });
  const [number, setNumber] = useState(0);
  const [stack, setStack] = useState(1000);

  const placeBet = (newBet: number | string, amount: number) => {
    if (amount > stack) {
      return;
    }
    setBet({ number: newBet, amount: amount });
  };

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

  return (
    <div className="board">
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
          <input
            type="number"
            min="0"
            onChange={(e) => placeBet("even", Number(e.target.value))}
          />
          <button onClick={() => placeBet("even", bet.amount)}>Even</button>
        </div>
        <div>
          <input
            type="number"
            min="0"
            onChange={(e) => placeBet("odd", Number(e.target.value))}
          />
          <button onClick={() => placeBet("odd", bet.amount)}>Odd</button>
        </div>
        {/* Add more buttons for other bets */}
      </div>
      <button onClick={spinWheel}>Spin the wheel</button>

      <div className="boardimage">
        <img src={RouletteImages} />
      </div>
    </div>
  );
}

export default Roulette;
