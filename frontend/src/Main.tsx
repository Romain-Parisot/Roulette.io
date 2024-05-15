import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Roulette from "./Roulette/Roulette";

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/room/:roomName" element={<Roulette />} />
      </Routes>
    </Router>
  );
}

export default Main;
