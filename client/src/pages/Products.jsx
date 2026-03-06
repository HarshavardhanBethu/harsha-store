import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FALLBACK = [
  { id:1, name:"Classic White Formal",  price:1034, originalPrice:2299, discount:55, color:"#f0ece4", fabric:"Premium Cotton",  badge:"Bestseller", rating:4.5, reviews:2341 },
  { id:2, name:"Navy Blue Oxford",       price:899,  originalPrice:1499, discount:40, color:"#1a2e4a", fabric:"Oxford Weave",    badge:"New Arrival", rating:4.3, reviews:876 },
  { id:3, name:"Charcoal Grey Linen",    price:1199, originalPrice:1699, discount:30, color:"#4a4a4a", fabric:"Pure Linen",      badge:"Premium",    rating:4.7, reviews:1203 },
  { id:4, name:"Sky Blue Casual",        price:749,  originalPrice:1899, discount:60, color:"#7ab8d4", fabric:"Cotton Blend",    badge:"Hot Deal",   rating:4.1, reviews:654 },
  { id:5, name:"Olive Green Slim Fit",   price:999,  originalPrice:1599, discount:37, color:"#556b2f", fabric:"Stretch Cotton",  badge:"Trending",   rating:4.4, reviews:432 },
  { id:6, name:"Burgundy Party Shirt",   price:1299, originalPrice:2199, discount:41, color:"#722F37", fabric:"Satin Blend",     badge:"Party Wear", rating:4.6, reviews:789 },
];

const BADGES = ["All","Bestseller","New Arrival","Premium","Hot Deal","Trending","Party Wear"];

export default function Products() {
  const [products, setProducts] = useState(FALLBACK);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("popular");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/products")
      .then(r => setProducts(r.data.shirts))
      .catch(() => {});
  }, []);

  const filtered = products.filter(p => filter === "All" || p.badge === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return b.reviews - a.reviews;
  });

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.card{animation:fadeUp 0.4s ease both}`}</style>

      <div style={{ marginBottom:40 }}>
        <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:10 }}>COLLECTION</div>
        <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(28px,4vw,52px)", fontWeight:900, marginBottom:6 }}>All Shirts</h1>
        <p style={{ color:"#444" }}>Select a shirt to customize with AI or buy as-is</p>
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20, alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {BADGES.map(b => (
            <button key={b} onClick={() => setFilter(b)}
              style={{ background:filter===b?"#f59e0b":"#0c0c0c", color:filter===b?"#111":"#444", border:filter===b?"none":"1px solid #1a1a1a", padding:"7px 16px", borderRadius:99, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {b}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ background:"#0c0c0c", color:"#666", border:"1px solid #1a1a1a", padding:"8px 14px", borderRadius:10, fontSize:12, cursor:"pointer" }}>
          <option value="popular">Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {sorted.map((p, i) => (
          <div key={p.id} className="card"
            style={{ animationDelay:`${i * 0.07}s`, background:"#0c0c0c", border:"1px solid #141414", borderRadius:20, overflow:"hidden", transition:"all 0.25s", cursor:"pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(245,158,11,0.3)"; e.currentTarget.style.transform="translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#141414"; e.currentTarget.style.transform="translateY(0)"; }}
          >
            <div style={{ height:200, background:`linear-gradient(145deg,${p.color}88,${p.color}33)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, position:"relative" }}>
              👔
              {p.badge && (
                <span style={{ position:"absolute", top:12, left:12, background:"#111", color:"#f59e0b", fontSize:9, padding:"4px 10px", borderRadius:20, fontWeight:800, border:"1px solid #2a1a00" }}>
                  {p.badge.toUpperCase()}
                </span>
              )}
              <span style={{ position:"absolute", top:12, right:12, background:"rgba(245,158,11,0.9)", color:"#111", fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:900 }}>
                -{p.discount}%
              </span>
            </div>
            <div style={{ padding:"20px 22px" }}>
              <div style={{ color:"#555", fontSize:11, marginBottom:4 }}>{p.fabric}</div>
              <h3 style={{ color:"#ddd", fontWeight:700, fontSize:16, marginBottom:8 }}>{p.name}</h3>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
                <span style={{ color:"#f59e0b", fontSize:13 }}>{"★".repeat(Math.floor(p.rating))}{"☆".repeat(5 - Math.floor(p.rating))}</span>
                <span style={{ color:"#333", fontSize:12 }}>({(p.reviews||0).toLocaleString()})</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <span style={{ color:"#fff", fontWeight:900, fontSize:20 }}>₹{p.price}</span>
                <span style={{ color:"#333", fontSize:13, textDecoration:"line-through" }}>₹{p.originalPrice}</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => navigate("/customize", { state: { shirt: p } })}
                  style={{ flex:1, padding:"11px 0", background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", borderRadius:10, color:"#111", fontWeight:800, fontSize:13, cursor:"pointer" }}>
                  Customize
                </button>
                <button style={{ padding:"11px 16px", background:"#111", border:"1px solid #1a1a1a", borderRadius:10, color:"#555", fontSize:13, cursor:"pointer" }}>
                  🛒
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}