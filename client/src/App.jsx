import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Cases from "./pages/Cases.jsx";
import Investigation from "./pages/Investigation.jsx";
import Board from "./pages/Board.jsx";
import Results from "./pages/Results.jsx";
import Generate from "./pages/Generate.jsx";
import Flashlight from "./components/Flashlight.jsx";
import AudioAmbience from "./components/AudioAmbience.jsx";

export default function App() {
  return (
    <>
      <Flashlight />
      <Navbar />
      <AudioAmbience />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/investigation/:id" element={<Investigation />} />
        <Route path="/board/:id" element={<Board />} />
        <Route path="/results/:id" element={<Results />} />
      </Routes>
    </>
  );
}
