require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

/* ---------------- CORS ---------------- */

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

/* ---------------- Socket Setup ---------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
/* ---------------- Upload Folder ---------------- */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads", { recursive: true });
}

/* ---------------- Upload Setup ---------------- */

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

/* ---------------- Fake Live Data ---------------- */

let onlineUsers = 247;
let liveOrders = 12;
const orders = [];

setInterval(() => {

  onlineUsers += Math.floor(Math.random() * 6) - 2;
  onlineUsers = Math.max(50, onlineUsers);

  liveOrders = Math.floor(Math.random() * 20) + 5;

  io.emit("live_stats", { onlineUsers, liveOrders });

}, 3000);

/* ---------------- Products API ---------------- */

app.get("/api/products", (req, res) => {

  res.json({
    shirts: [
      { id:1, name:"Classic White Formal", price:1034, color:"#f0ece4", fabric:"Premium Cotton" },
      { id:2, name:"Navy Blue Oxford", price:899, color:"#1a2e4a", fabric:"Oxford Weave" },
      { id:3, name:"Charcoal Grey Linen", price:1199, color:"#4a4a4a", fabric:"Pure Linen" },
      { id:4, name:"Sky Blue Casual", price:749, color:"#7ab8d4", fabric:"Cotton Blend" }
    ]
  });

});

/* ---------------- Upload API ---------------- */

app.post("/api/upload", upload.array("images", 4), (req, res) => {

  const files = req.files.map(f => `/uploads/${f.filename}`);

  res.json({
    success: true,
    files
  });

});

/* ---------------- Orders API ---------------- */

app.post("/api/orders", (req, res) => {

  const order = {
    id: "SF" + uuidv4().slice(0,8).toUpperCase(),
    ...req.body,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    trackingSteps: [
      { label:"Order Confirmed", done:true, time:new Date().toISOString() },
      { label:"Design Sent to Factory", done:false, time:null },
      { label:"In Production", done:false, time:null },
      { label:"Shipped", done:false, time:null },
      { label:"Delivered", done:false, time:null }
    ]
  };

  orders.push(order);

  io.emit("new_order", {
    id: order.id,
    design: order.designName
  });

  res.json(order);

});

app.get("/api/orders/:id", (req, res) => {

  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error:"Order not found" });
  }

  res.json(order);

});

/* ---------------- Stats API ---------------- */

app.get("/api/stats", (req, res) => {

  res.json({
    onlineUsers,
    liveOrders
  });

});

/* ---------------- Socket Events ---------------- */

io.on("connection", (socket) => {

  console.log("User connected");

  onlineUsers++;

  io.emit("live_stats", { onlineUsers, liveOrders });

  socket.on("calculate_price", (data) => {

    const base = data.shirtPrice || 999;
    const fabricCost = Math.floor(Math.random()*80)+60;
    const printCost = (data.featureCount||1)*(Math.floor(Math.random()*60)+80);
    const laborCost = Math.floor(Math.random()*100)+120;

    const subtotal = base + fabricCost + printCost + laborCost;
    const gst = Math.round(subtotal * 0.05);

    socket.emit("price_result", {
      basePrice: base,
      fabricCost,
      printCost,
      laborCost,
      gst,
      total: subtotal + gst
    });

  });

  socket.on("disconnect", () => {

    console.log("User disconnected");

    onlineUsers = Math.max(10, onlineUsers - 1);

    io.emit("live_stats", { onlineUsers, liveOrders });

  });

});

/* ---------------- Start Server ---------------- */

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});