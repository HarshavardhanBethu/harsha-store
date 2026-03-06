import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { createOrder } from "../api";

const socket = io("http://localhost:4000");

const stepIcons = ["✅","🎨","🏭","🚚","🎉"];

export default function Orders() {

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LIVE ORDER UPDATES (Step 2 & 3) ---------------- */

  useEffect(() => {

    if (!order?.id) return;

    const eventName = "order_update_" + order.id;

    socket.on(eventName, (steps) => {

      setOrder(prev => ({
        ...prev,
        trackingSteps: steps
      }));

    });

    return () => {
      socket.off(eventName);
    };

  }, [order]);

  /* ---------------- Create Order ---------------- */

  const handleOrder = async () => {

    const orderData = {
      designName: "Custom Shirt",
      shirtPrice: 999,
      fabric: "Premium Cotton",
      features: ["Pocket Logo"]
    };

    const newOrder = await createOrder(orderData);

    alert("Order created: " + newOrder.id);

    setOrderId(newOrder.id);

  };

  /* ---------------- Track Order ---------------- */

  async function lookup() {

    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {

      const { data } = await axios.get(
        "http://localhost:4000/api/orders/" + orderId.trim()
      );

      setOrder(data);

    } catch (e) {

      setError("Order not found. Please check the ID.");

    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 24px" }}>

      <div style={{ textAlign:"center", marginBottom:40 }}>
        <h1 style={{ fontSize:42, fontWeight:800 }}>
          Order Tracking
        </h1>
      </div>

      {/* Create Order */}

      <div style={{ textAlign:"center", marginBottom:30 }}>
        <button
          onClick={handleOrder}
          style={{
            padding:"12px 24px",
            background:"#f59e0b",
            border:"none",
            borderRadius:10,
            fontWeight:700,
            cursor:"pointer"
          }}
        >
          Create Test Order
        </button>
      </div>

      {/* Search Order */}

      <div style={{ display:"flex", gap:10, marginBottom:32 }}>

        <input
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          style={{
            flex:1,
            padding:"14px",
            borderRadius:10,
            border:"1px solid #333",
            background:"#111",
            color:"#ddd"
          }}
        />

        <button
          onClick={lookup}
          disabled={loading}
          style={{
            padding:"14px 20px",
            background:"#f59e0b",
            border:"none",
            borderRadius:10,
            fontWeight:700,
            cursor:"pointer"
          }}
        >
          {loading ? "Loading..." : "Track"}
        </button>

      </div>

      {/* Error */}

      {error && (
        <div style={{ color:"red", marginBottom:20 }}>
          {error}
        </div>
      )}

      {/* Order Result */}

      {order && (

        <div style={{
          background:"#0c0c0c",
          padding:24,
          borderRadius:16,
          border:"1px solid #222"
        }}>

          <h2 style={{ marginBottom:20 }}>
            Order ID: {order.id}
          </h2>

          {(order.trackingSteps || []).map((s, i, arr) => (

            <div key={i} style={{ display:"flex", gap:12, marginBottom:14 }}>

              <div style={{
                width:32,
                height:32,
                borderRadius:"50%",
                background:s.done ? "#f59e0b" : "#222",
                display:"flex",
                alignItems:"center",
                justifyContent:"center"
              }}>
                {s.done ? stepIcons[i] : i+1}
              </div>

              <div>

                <div style={{
                  color:s.done ? "#fff" : "#666",
                  fontWeight:600
                }}>
                  {s.label}
                </div>

                {s.done && s.time && (
                  <div style={{ fontSize:12, color:"#777" }}>
                    {new Date(s.time).toLocaleTimeString()}
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}