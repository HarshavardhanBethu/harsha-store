import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Dashboard() {

  const [stats, setStats] = useState({
    onlineUsers: 0,
    liveOrders: 0
  });

  const [ordersFeed, setOrdersFeed] = useState([]);

  useEffect(() => {

    /* -------- Live Stats -------- */

    socket.on("live_stats", (data) => {
      setStats(data);
    });

    /* -------- Live Orders Feed -------- */

    socket.on("new_order", (order) => {

      setOrdersFeed(prev => {
        const updated = [order, ...prev];
        return updated.slice(0, 10); // keep last 10 orders
      });

    });

    return () => {
      socket.off("live_stats");
      socket.off("new_order");
    };

  }, []);

  return (
    <div style={{ padding:40 }}>

      <h1 style={{ marginBottom:30 }}>Live Dashboard</h1>

      {/* -------- Stats Cards -------- */}

      <div style={{ display:"flex", gap:20, marginBottom:40 }}>

        <div style={{
          padding:30,
          background:"#111",
          borderRadius:12,
          color:"#fff",
          width:220
        }}>
          <h3>Online Users</h3>
          <h2>{stats.onlineUsers}</h2>
        </div>

        <div style={{
          padding:30,
          background:"#111",
          borderRadius:12,
          color:"#fff",
          width:220
        }}>
          <h3>Live Orders</h3>
          <h2>{stats.liveOrders}</h2>
        </div>

      </div>

      {/* -------- Live Orders Feed -------- */}

      <div style={{
        background:"#111",
        padding:20,
        borderRadius:12,
        color:"#fff",
        maxWidth:420
      }}>

        <h3 style={{ marginBottom:15 }}>Live Orders Feed</h3>

        {ordersFeed.length === 0 && (
          <p style={{ color:"#777" }}>No orders yet</p>
        )}

        {ordersFeed.map((o, i) => (

          <div key={i} style={{
            padding:"10px 0",
            borderBottom:"1px solid #222"
          }}>
            📦 <strong>{o.id}</strong> — {o.design}
          </div>

        ))}

      </div>

    </div>
  );
}