import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import Watch from "./pages/Watch";
import Category from "./pages/Category";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/playlist/:id" element={<Playlist />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/categoria/:id" element={<Category />} />
    </Routes>
  );
}
