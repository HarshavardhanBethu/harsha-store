import { Link } from "react-router-dom";

const features = [
  { icon:"🤖", title:"AI-Powered Design", desc:"Claude AI merges design elements from reference shirts into your perfect custom piece" },
  { icon:"🏭", title:"Live Factory Pricing", desc:"Real-time price calculation from manufacturer via WebSocket" },
  { icon:"🔒", title:"Price Lock", desc:"Your quoted price is locked for 15 minutes so you can order without worry" },
  { icon:"📦", title:"Live Order Tracking", desc:"Track every step from factory to your door in real time" },
];

const steps = [
  { n:"01", title:"Browse & Select", desc:"Pick any shirt as your canvas" },
  { n:"02", title:"Choose Features", desc:"Select logos, stripes, prints, collars" },
  { n:"03", title:"Upload References", desc:"Upload shirts whose designs you want merged" },
  { n:"04", title:"Describe to AI", desc:"Tell Claude exactly what you want" },
  { n:"05", title:"Get Live Price", desc:"Factory calculates cost in real time" },
  { n:"06", title:"Order & Track", desc:"Place order and track it live" },
];

export default function Home() {
  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .fadeUp { animation: fadeUp 0.6s ease both; }
      `}</style>

      {/* HERO */}
      <section style={{ minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"60px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, background:"radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 1px 1px,#1a1a1a 1px,transparent 0)", backgroundSize:"40px 40px", opacity:0.4, pointerEvents:"none" }} />

        <div className="fadeUp" style={{ position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:99, padding:"6px 18px", marginBottom:28 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"pulse 1.5s infinite" }} />
            <span style={{ color:"#f59e0b", fontSize:12, fontWeight:700, letterSpacing:1 }}>LIVE — AI FASHION PLATFORM</span>
          </div>
          <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(42px,7vw,88px)", fontWeight:900, lineHeight:1.0, letterSpacing:"-2px", marginBottom:24 }}>
            Design Any Shirt<br /><span style={{ color:"#f59e0b" }}>With AI.</span>
          </h1>
          <p style={{ color:"#555", fontSize:"clamp(15px,2vw,19px)", maxWidth:560, margin:"0 auto 40px", lineHeight:1.7 }}>
            Upload shirts you love, describe what you want, and watch Claude AI build your perfect custom garment with live factory pricing.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/customize" style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)", color:"#111", padding:"16px 36px", borderRadius:14, fontWeight:900, fontSize:16, textDecoration:"none", boxShadow:"0 8px 32px rgba(245,158,11,0.3)" }}>
              Start Designing Free
            </Link>
            <Link to="/products" style={{ background:"transparent", color:"#aaa", padding:"16px 36px", borderRadius:14, fontWeight:700, fontSize:16, textDecoration:"none", border:"1px solid #1e1e1e" }}>
              Browse Products
            </Link>
          </div>
        </div>

        <div style={{ marginTop:64, fontSize:120, animation:"float 4s ease-in-out infinite", filter:"drop-shadow(0 20px 60px rgba(245,158,11,0.2))" }}>
          👔
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"80px 32px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:12 }}>WHY STITCHAI</div>
          <h2 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(30px,4vw,52px)", fontWeight:900 }}>Fashion meets real-time AI</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:20 }}>
          {features.map((f, i) => (
            <div key={i}
              style={{ background:"#0c0c0c", border:"1px solid #141414", borderRadius:18, padding:28, transition:"all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(245,158,11,0.3)"; e.currentTarget.style.transform="translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#141414"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              <div style={{ fontSize:36, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ color:"#fff", fontWeight:700, fontSize:16, marginBottom:10 }}>{f.title}</h3>
              <p style={{ color:"#444", fontSize:13, lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"80px 32px", background:"#0a0a0a", borderTop:"1px solid #111", borderBottom:"1px solid #111" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:12 }}>THE PROCESS</div>
            <h2 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(30px,4vw,52px)", fontWeight:900 }}>Six steps to your perfect shirt</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:18, alignItems:"flex-start", padding:20, background:"#0c0c0c", borderRadius:16, border:"1px solid #141414" }}>
                <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:36, fontWeight:900, color:"rgba(245,158,11,0.2)", lineHeight:1, flexShrink:0 }}>{s.n}</div>
                <div>
                  <div style={{ color:"#ddd", fontWeight:700, fontSize:15, marginBottom:6 }}>{s.title}</div>
                  <div style={{ color:"#444", fontSize:13, lineHeight:1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"100px 32px", textAlign:"center" }}>
        <h2 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:"clamp(32px,5vw,64px)", fontWeight:900, marginBottom:20, lineHeight:1.1 }}>
          Your design.<br /><span style={{ color:"#f59e0b" }}>Your price. Right now.</span>
        </h2>
        <p style={{ color:"#444", fontSize:16, marginBottom:36 }}>Join thousands designing custom shirts with AI</p>
        <Link to="/customize" style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)", color:"#111", padding:"18px 48px", borderRadius:16, fontWeight:900, fontSize:18, textDecoration:"none", display:"inline-block" }}>
          Start Customizing — Free
        </Link>
      </section>
    </div>
  );
}