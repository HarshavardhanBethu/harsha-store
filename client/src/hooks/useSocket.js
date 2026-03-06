import { useEffect, useState } from "react";
import { io } from "socket.io-client";

/* backend URL */
const SERVER_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

/* create single socket instance */
const socket = io(SERVER_URL, {
  transports: ["websocket"],
  reconnection: true
});

export function useSocket() {

  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [liveOrders, setLiveOrders] = useState(0);

  useEffect(() => {

    const handleConnect = () => {
      setConnected(true);
      console.log("Socket connected");
    };

    const handleDisconnect = () => {
      setConnected(false);
      console.log("Socket disconnected");
    };

    const handleStats = ({ onlineUsers, liveOrders }) => {
      setOnlineUsers(onlineUsers);
      setLiveOrders(liveOrders);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("live_stats", handleStats);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("live_stats", handleStats);
    };

  }, []);

  /* -------- PRICE CALCULATION -------- */

  const calculatePrice = (data, onProgress, onResult) => {

    const handleProgress = (progress) => {
      if (onProgress) onProgress(progress);
    };

    const handleResult = (result) => {
      if (onResult) onResult(result);
    };

    socket.off("price_progress");
    socket.off("price_result");

    socket.emit("calculate_price", data);

    socket.on("price_progress", handleProgress);
    socket.once("price_result", handleResult);

  };

  /* -------- ORDER TRACKING -------- */

  const subscribeOrderUpdates = (orderId, callback) => {

    const eventName = `order_update_${orderId}`;

    socket.on(eventName, callback);

    return () => socket.off(eventName, callback);

  };

  return {
    connected,
    onlineUsers,
    liveOrders,
    calculatePrice,
    subscribeOrderUpdates
  };
}