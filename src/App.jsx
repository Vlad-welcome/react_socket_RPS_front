import { Routes, Route } from "react-router-dom";
import { Game } from "./pages/index.js";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Game />}></Route>
      </Routes>
    </>
  );
}
