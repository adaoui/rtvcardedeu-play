import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import Watch from "./pages/Watch";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/playlist/:playlistId" element={<Playlist />} />
      <Route path="/watch/:videoId" element={<Watch />} />
    </Routes>
  );
}
