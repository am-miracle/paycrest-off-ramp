import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import OffRamp from "./pages/off-ramp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/off-ramp" element={<OffRamp />} />
      </Routes>
    </BrowserRouter>
  );
}