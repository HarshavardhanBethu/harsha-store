import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Customize from "./pages/customize";
import Orders from "./pages/orders";
import { useSocket } from "./hooks/useSocket";

export default function App() {
  const { onlineUsers, liveOrders } = useSocket();
  return (
    <div>
      <Navbar onlineUsers={onlineUsers} liveOrders={liveOrders} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  );
}
fetch("http://localhost:4000/api/products")
  .then(res => res.json())
  .then(data => console.log(data));