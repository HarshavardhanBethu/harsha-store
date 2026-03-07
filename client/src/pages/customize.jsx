import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";

const STEPS = ["Select Shirt", "Features", "Upload", "AI Design", "Pricing", "Order"];

const SHIRTS = [
  { id:1, name:"Classic White Formal",   price:1034, color:"#f0ece4", fabric:"Premium Cotton",  badge:"Bestseller" },
  { id:2, name:"Navy Blue Oxford",       price:899,  color:"#1a2e4a", fabric:"Oxford Weave",    badge:"New" },
  { id:3, name:"Charcoal Grey Linen",    price:1199, color:"#4a4a4a", fabric:"Pure Linen",      badge:"Premium" },
  { id:4, name:"Sky Blue Casual",        price:749,  color:"#7ab8d4", fabric:"Cotton Blend",    badge:"Sale" },
];

const FEATURES = [
  { id:1, feature:"Pocket Logo",     emoji:"🦁", desc:"Embroidered crest on chest pocket" },
  { id:2, feature:"Side Stripe",     emoji:"⚡", desc:"Contrast stripe down both sides" },
  { id:3, feature:"Floral Print",    emoji:"🌸", desc:"Subtle all-over floral motif" },
  { id:4, feature:"Mandarin Collar", emoji:"🔷", desc:"Structured mandarin collar" },
  { id:5, feature:"Back Graphic",    emoji:"🎨", desc:"Statement graphic on back" },
  { id:6, feature:"Cuff Embroidery", emoji:"✨", desc:"Monogram embroidery on cuffs" },
];

function UploadBox({ label, preview, onUpload, required }) {
  const ref = useRef();
  return (
    <div style={{ flex:"1 1 150px" }}>
      <div style={{ fontSize:10, color:required?"#f59e0b":"#444", fontWeight:800, letterSpacing:1, marginBottom:8 }}>
        {label}{required ? " *" : ""}
      </div>
      <div
        onClick={() => ref.current && ref.current.click()}
        style={{ border:preview?"1.5px solid #f59e0b":"1.5px dashed #2a2a2a", borderRadius:14, padding:16, textAlign:"center", cursor:"pointer", background:preview?"rgba(245,158,11,0.04)":"#0a0a0a", minHeight:140, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}
      >
        {preview ? (
          <img src={preview} style={{ maxHeight:110, maxWidth:"100%", borderRadius:8, objectFit:"contain" }} alt="upload" />
        ) : (
          <div>
            <div style={{ fontSize:32, marginBottom:8 }}>📁</div>
            <div style={{ color:"#333", fontSize:11, marginBottom:8 }}>Click to upload</div>
            <span style={{ background:"#f59e0b", color:"#111", padding:"5px 14px", borderRadius:20, fontSize:11, fontWeight:800 }}>Browse</span>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display:"none" }}
          onChange={e => {
            const f = e.target.files[0];
            if (f) onUpload(URL.createObjectURL(f));
          }}
        />
      </div>
    </div>
  );
}

export default function Customize() {
  const loc = useLocation();
  const { calculatePrice } = useSocket();

  const [step, setStep] = useState(loc.state && loc.state.shirt ? 1 : 0);
  const [shirt, setShirt] = useState(loc.state ? loc.state.shirt : null);
  const [selected, setSelected] = useState([]);
  const [images, setImages] = useState([null, null, null, null]);
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [priceMsg, setPriceMsg] = useState("");
  const [pricePct, setPricePct] = useState(0);
  const [size, setSize] = useState("M");
  const [order, setOrder] = useState(null);
  const [trackSteps, setTrackSteps] = useState([]);

  function toggleFeat(f) {
    setSelected(prev => {
      if (prev.find(x => x.id === f.id)) return prev.filter(x => x.id !== f.id);
      if (prev.length < 4) return [...prev, f];
      return prev;
    });
  }

  async function runAI() {
    if (!prompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const { data } = await axios.post("https://harsha-store.onrender.com/api/generate-design", {
        shirtName: shirt ? shirt.name : "",
        fabric: shirt ? shirt.fabric : "",
        features: selected.map(s => s.feature),
        prompt,
      });
      setAiResult(data);
    } catch (err) {
      setAiResult({
        designName: "Your Signature Piece",
        visualDescription: "A refined custom shirt with your selected elements elegantly applied.",
        appliedElements: selected.map(s => s.feature),
        colorPalette: ["#1a2e4a", "#D4A853", "#f0ece4"],
        style: "Smart-Casual",
        occasion: "Office",
        complexityScore: 7,
        uniquenessScore: 9,
        manufacturingDays: 8,
        designerNote: "A timeless design combination.",
      });
    }
    setAiLoading(false);
  }

  function getLivePrice() {
    setStep(4);
    setPricing(null);
    setPriceMsg("");
    setPricePct(0);
    calculatePrice(
      { shirtPrice: shirt ? shirt.price : 999, featureCount: selected.length },
      d => { setPriceMsg(d.msg); setPricePct(d.pct); },
      r => setPricing(r)
    );
  }

  // UPDATED PLACE ORDER FUNCTION
  async function placeOrder() {

  if (!pricing) return;

  try {

    const response = await axios.post(
      "https://harsha-store.onrender.com/api/orders",
      {
        shirtName: shirt ? shirt.name : "",
        designName: aiResult ? aiResult.designName : "Custom Design",
        size: size,
        features: selected.map(s => s.feature),
        total: pricing.total
      }
    );

    const data = response.data;

    setOrder(data);
    setTrackSteps(data.trackingSteps);
    setStep(5);

    const poll = setInterval(async () => {

      try {

        const res = await axios.get(
          "https://harsha-store.onrender.com/api/orders/" + data.id
        );

        setTrackSteps(res.data.trackingSteps);

        if (res.data.trackingSteps.every(s => s.done)) {
          clearInterval(poll);
        }

      } catch (err) {
        console.error(err);
        clearInterval(poll);
      }

    }, 2500);

  } catch (error) {

    console.error(error);
    alert("Order failed");

  }

}
  

  function canNext() {
    if (step === 0) return !!shirt;
    if (step === 1) return selected.length > 0;
    if (step === 2) return !!images[0];
    if (step === 3) return !!aiResult;
    if (step === 4) return !!pricing;
    return true;
  }

  function reset() {
    setStep(0); setShirt(null); setSelected([]); setImages([null,null,null,null]);
    setPrompt(""); setAiResult(null); setPricing(null); setOrder(null); setTrackSteps([]);
  }

  const total = pricing ? pricing.total : 0;
  const trackingSteps = trackSteps.length ? trackSteps : (order ? order.trackingSteps : []);
  const stepIcons = ["✅","🎨","🏭","🚚","🎉"];

  return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"36px 20px 80px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .page { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* Step bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:40, flexWrap:"wrap" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:i<step?"#f59e0b":i===step?"#111":"#1a1a1a", border:i<=step?"2px solid #f59e0b":"2px solid #222", display:"flex", alignItems:"center", justifyContent:"center", color:i<step?"#111":i===step?"#f59e0b":"#333", fontWeight:800, fontSize:12, transition:"all 0.3s", boxShadow:i===step?"0 0 0 3px rgba(245,158,11,0.15)":"none" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize:9, color:i===step?"#f59e0b":"#333", whiteSpace:"nowrap", fontWeight:i===step?800:400 }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width:26, height:1.5, background:i<step?"#f59e0b":"#1a1a1a", margin:"0 2px", marginBottom:18 }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 0 - Select Shirt */}
      {step === 0 && (
        <div className="page">
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:8 }}>STEP 1</div>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:38, fontWeight:900 }}>Choose Your <span style={{ color:"#f59e0b" }}>Base Shirt</span></h1>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
            {SHIRTS.map(s => (
              <div key={s.id} onClick={() => setShirt(s)}
                style={{ border:shirt && shirt.id===s.id?"1.5px solid #f59e0b":"1.5px solid #141414", borderRadius:18, padding:20, cursor:"pointer", background:shirt && shirt.id===s.id?"rgba(245,158,11,0.06)":"#0c0c0c", transition:"all 0.2s", position:"relative" }}>
                {s.badge && <span style={{ position:"absolute", top:10, right:10, background:"#111", color:"#f59e0b", fontSize:9, padding:"3px 9px", borderRadius:20, fontWeight:800, border:"1px solid #2a1a00" }}>{s.badge}</span>}
                <div style={{ height:120, background:`linear-gradient(145deg,${s.color}88,${s.color}33)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, marginBottom:14 }}>👔</div>
                <div style={{ color:"#ccc", fontWeight:700, fontSize:14, marginBottom:2 }}>{s.name}</div>
                <div style={{ color:"#444", fontSize:12, marginBottom:8 }}>{s.fabric}</div>
                <div style={{ color:"#fff", fontWeight:900, fontSize:18 }}>₹{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1 - Features */}
      {step === 1 && (
        <div className="page">
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:8 }}>STEP 2</div>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:38, fontWeight:900 }}>Pick <span style={{ color:"#f59e0b" }}>Design Features</span></h1>
            <p style={{ color:"#444", marginTop:8 }}>Select up to 4 elements</p>
          </div>
          {shirt && (
            <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:14, padding:"12px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:shirt.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👔</div>
              <div>
                <div style={{ fontSize:9, color:"#f59e0b", fontWeight:800, letterSpacing:1 }}>BASE SHIRT</div>
                <div style={{ color:"#ccc", fontWeight:700 }}>{shirt.name}</div>
              </div>
              <span style={{ marginLeft:"auto", color:"#f59e0b", fontWeight:900, fontSize:18 }}>₹{shirt.price}</span>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {FEATURES.map(f => {
              const sel = !!selected.find(x => x.id === f.id);
              return (
                <div key={f.id} onClick={() => toggleFeat(f)}
                  style={{ border:sel?"1.5px solid #f59e0b":"1.5px solid #141414", borderRadius:14, padding:18, cursor:"pointer", background:sel?"rgba(245,158,11,0.07)":"#0c0c0c", transition:"all 0.2s" }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>{f.emoji}</div>
                  <div style={{ color:"#ccc", fontWeight:700, fontSize:13, marginBottom:4 }}>{f.feature}</div>
                  <div style={{ color:"#444", fontSize:11, lineHeight:1.5 }}>{f.desc}</div>
                  {sel && <div style={{ color:"#f59e0b", fontWeight:800, fontSize:11, marginTop:8 }}>Selected</div>}
                </div>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div style={{ marginTop:16, display:"flex", gap:8, flexWrap:"wrap" }}>
              {selected.map(s => (
                <span key={s.id} style={{ background:"#f59e0b", color:"#111", padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:800 }}>{s.emoji} {s.feature}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2 - Upload */}
      {step === 2 && (
        <div className="page">
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:8 }}>STEP 3</div>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:38, fontWeight:900 }}>Upload <span style={{ color:"#f59e0b" }}>Reference Shirts</span></h1>
          </div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:20 }}>
            <UploadBox label="BASE SHIRT" preview={images[0]} onUpload={v => setImages([v, images[1], images[2], images[3]])} required />
            <UploadBox label="DESIGN REF 1" preview={images[1]} onUpload={v => setImages([images[0], v, images[2], images[3]])} />
            <UploadBox label="DESIGN REF 2" preview={images[2]} onUpload={v => setImages([images[0], images[1], v, images[3]])} />
            <UploadBox label="DESIGN REF 3" preview={images[3]} onUpload={v => setImages([images[0], images[1], images[2], v])} />
          </div>
          <div style={{ background:"#0c0c0c", border:"1px solid #141414", borderRadius:12, padding:16, color:"#444", fontSize:13, lineHeight:1.8 }}>
            Tip: Upload front-facing, well-lit photos on plain backgrounds. PNG or JPG up to 10MB.
          </div>
        </div>
      )}

      {/* STEP 3 - AI Design */}
      {step === 3 && (
        <div className="page">
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:8 }}>STEP 4 · AI</div>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:38, fontWeight:900 }}>Describe Your <span style={{ color:"#f59e0b" }}>Vision</span></h1>
          </div>

          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:160, background:"#0c0c0c", border:"1px solid #141414", borderRadius:12, padding:14 }}>
              <div style={{ fontSize:9, color:"#f59e0b", fontWeight:800, letterSpacing:1, marginBottom:6 }}>BASE</div>
              <div style={{ color:"#ccc", fontWeight:700 }}>{shirt ? shirt.name : ""}</div>
            </div>
            <div style={{ flex:2, minWidth:200, background:"#0c0c0c", border:"1px solid #141414", borderRadius:12, padding:14 }}>
              <div style={{ fontSize:9, color:"#f59e0b", fontWeight:800, letterSpacing:1, marginBottom:8 }}>SELECTED FEATURES</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {selected.map(s => (
                  <span key={s.id} style={{ background:"rgba(245,158,11,0.1)", color:"#f59e0b", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>{s.emoji} {s.feature}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <div style={{ color:"#333", fontSize:11, marginBottom:10, letterSpacing:0.5 }}>QUICK PROMPTS</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[
                "Add pocket logo on left chest, keep it subtle",
                "Apply side stripes on both sides for athletic look",
                "Combine all elements for a premium formal look",
              ].map((s, i) => (
                <button key={i} onClick={() => setPrompt(s)}
                  style={{ background:"#0c0c0c", border:"1px solid #1a1a1a", color:"#444", padding:"7px 14px", borderRadius:20, cursor:"pointer", fontSize:11 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            maxLength={600}
            placeholder='e.g. "Apply pocket logo on left chest. Add side stripes on both sides. Keep it clean for office wear."'
            style={{ width:"100%", minHeight:120, padding:18, borderRadius:14, background:"#0c0c0c", border:"1.5px solid #1a1a1a", color:"#ccc", fontSize:14, resize:"vertical", lineHeight:1.7, outline:"none" }}
            onFocus={e => { e.target.style.borderColor="#f59e0b"; }}
            onBlur={e => { e.target.style.borderColor="#1a1a1a"; }}
          />
          <div style={{ color:"#222", fontSize:11, textAlign:"right", marginTop:4 }}>{prompt.length}/600</div>

          <button
            onClick={runAI}
            disabled={!prompt.trim() || aiLoading}
            style={{ marginTop:14, width:"100%", padding:16, background:(!prompt.trim() || aiLoading)?"#111":"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", borderRadius:14, color:(!prompt.trim() || aiLoading)?"#333":"#111", fontWeight:900, fontSize:16, cursor:(!prompt.trim() || aiLoading)?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            {aiLoading ? (
              <span>Generating AI Design...</span>
            ) : (
              <span>Generate AI Design</span>
            )}
          </button>

          {aiResult && (
            <div style={{ marginTop:20, background:"#0c0c0c", border:"1.5px solid rgba(245,158,11,0.25)", borderRadius:18, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:10, color:"#f59e0b", fontWeight:800, letterSpacing:1, marginBottom:4 }}>AI DESIGN COMPLETE</div>
                  <div style={{ fontFamily:"Cormorant Garamond,serif", color:"#fff", fontWeight:900, fontSize:22 }}>"{aiResult.designName}"</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:9, color:"#333", letterSpacing:1 }}>UNIQUENESS</div>
                  <div style={{ color:"#f59e0b", fontWeight:900, fontSize:24 }}>{aiResult.uniquenessScore}/10</div>
                </div>
              </div>
              <p style={{ color:"#555", fontSize:14, lineHeight:1.7, marginBottom:14 }}>{aiResult.visualDescription}</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                {(aiResult.appliedElements || []).map((e, i) => (
                  <span key={i} style={{ background:"rgba(245,158,11,0.1)", color:"#f59e0b", padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:700 }}>
                    {e}
                  </span>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {[["Style", aiResult.style], ["Occasion", aiResult.occasion], ["Delivery", aiResult.manufacturingDays + " days"]].map(([l, v]) => (
                  <div key={l} style={{ background:"#111", borderRadius:10, padding:"8px 14px" }}>
                    <div style={{ fontSize:9, color:"#333", letterSpacing:1 }}>{l}</div>
                    <div style={{ color:"#aaa", fontWeight:700, fontSize:13, marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 - Live Pricing */}
      {step === 4 && (
        <div className="page">
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, letterSpacing:3, marginBottom:8 }}>STEP 5 · REAL-TIME</div>
            <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:38, fontWeight:900 }}>Live <span style={{ color:"#f59e0b" }}>Factory Price</span></h1>
          </div>

          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {/* Preview panel */}
            <div style={{ flex:"1 1 240px", background:"#0c0c0c", border:"1.5px solid rgba(245,158,11,0.2)", borderRadius:18, padding:28, textAlign:"center" }}>
              <div style={{ fontSize:80, marginBottom:12 }}>👔</div>
              <div style={{ fontFamily:"Cormorant Garamond,serif", color:"#f59e0b", fontWeight:900, fontSize:18 }}>
                "{aiResult ? aiResult.designName : "Custom Design"}"
              </div>
              <div style={{ color:"#444", fontSize:12, marginTop:4 }}>{shirt ? shirt.name : ""}</div>
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:11, color:"#444", marginBottom:10 }}>SELECT SIZE</div>
                <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                  {["S","M","L","XL","XXL"].map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      style={{ width:40, height:40, borderRadius:10, fontWeight:800, fontSize:12, background:size===s?"#f59e0b":"#111", border:size===s?"none":"1px solid #1a1a1a", color:size===s?"#111":"#444", cursor:"pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing panel */}
            <div style={{ flex:"1 1 300px", background:"#0a0a0a", border:"1.5px solid #1a1a1a", borderRadius:18, overflow:"hidden" }}>
              <div style={{ background:"#0f0900", borderBottom:"1px solid #2a1a00", padding:"14px 20px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>🏭</span>
                <span style={{ color:"#f59e0b", fontWeight:800, fontSize:13 }}>LIVE MANUFACTURER PRICING</span>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:pricing?"#4ade80":"#f59e0b", display:"inline-block", animation:"pulse 1s infinite" }} />
                  <span style={{ color:pricing?"#4ade80":"#f59e0b", fontSize:11, fontWeight:700 }}>{pricing ? "LOCKED" : "CALCULATING"}</span>
                </div>
              </div>

              {!pricing && (
                <div style={{ padding:"20px 20px 16px" }}>
                  <div style={{ height:4, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:12 }}>
                    <div style={{ height:"100%", width:`${pricePct}%`, background:"linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius:99, transition:"width 0.5s ease" }} />
                  </div>
                  <p style={{ color:"#555", fontSize:13, fontStyle:"italic" }}>{priceMsg || "Connecting to manufacturer..."}</p>
                </div>
              )}

              {pricing && (
                <div style={{ padding:20 }}>
                  {[
                    ["Base Shirt", "₹" + pricing.basePrice, "#aaa"],
                    ["Fabric & Material", "₹" + pricing.fabricCost, "#aaa"],
                    ["Print & Embroidery", "₹" + pricing.printCost, "#aaa"],
                    ["Labor & Stitching", "₹" + pricing.laborCost, "#aaa"],
                    ["GST (5%)", "₹" + pricing.gst, "#aaa"],
                    ["Delivery", "FREE", "#4ade80"],
                  ].map(([l, v, c], i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, paddingBottom:10, borderBottom:"1px solid #111" }}>
                      <span style={{ color:"#444", fontSize:13 }}>{l}</span>
                      <span style={{ color:c, fontWeight:700, fontSize:13 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
                    <div>
                      <div style={{ color:"#444", fontSize:10, letterSpacing:1, fontWeight:700 }}>LOCKED PRICE</div>
                      <div style={{ color:"#f59e0b", fontWeight:900, fontSize:34, fontFamily:"Cormorant Garamond,serif", lineHeight:1 }}>
                        ₹{pricing.total.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                      <div style={{ color:"#4ade80", fontSize:10, fontWeight:800 }}>PRICE LOCKED</div>
                      <div style={{ color:"#4ade80", fontSize:11 }}>Valid 15 min</div>
                    </div>
                  </div>
                  <button onClick={placeOrder}
                    style={{ marginTop:20, width:"100%", padding:16, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", borderRadius:14, color:"#111", fontWeight:900, fontSize:16, cursor:"pointer" }}>
                    Place Order — ₹{pricing.total.toLocaleString()}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 - Order Tracking */}
      {step === 5 && order && (
        <div className="page" style={{ textAlign:"center" }}>
          <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
          <h1 style={{ fontFamily:"Cormorant Garamond,serif", fontSize:42, fontWeight:900, marginBottom:8 }}>
            Order <span style={{ color:"#f59e0b" }}>Confirmed!</span>
          </h1>
          <p style={{ color:"#444", marginBottom:32 }}>
            Order <span style={{ color:"#f59e0b", fontWeight:800 }}>{order.id}</span> · ₹{order.total ? order.total.toLocaleString() : ""}
          </p>
          <div style={{ maxWidth:400, margin:"0 auto" }}>
            {trackingSteps.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:s.done?"rgba(245,158,11,0.12)":"#0f0f0f", border:s.done?"2px solid #f59e0b":"2px solid #1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"all 0.5s" }}>
                    {s.done ? stepIcons[i] : <span style={{ color:"#222" }}>{i + 1}</span>}
                  </div>
                  {i < trackingSteps.length - 1 && (
                    <div style={{ width:2, height:32, background:s.done?"#f59e0b":"#1a1a1a", transition:"background 0.5s" }} />
                  )}
                </div>
                <div style={{ paddingTop:10, textAlign:"left" }}>
                  <div style={{ color:s.done?"#ddd":"#2a2a2a", fontWeight:700, fontSize:14, transition:"color 0.5s" }}>{s.label}</div>
                  {s.done && s.time && <div style={{ color:"#444", fontSize:11, marginTop:2 }}>{new Date(s.time).toLocaleTimeString()}</div>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={reset}
            style={{ marginTop:40, padding:"14px 40px", background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", borderRadius:14, color:"#111", fontWeight:900, fontSize:15, cursor:"pointer" }}>
            Design Another Shirt
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 5 && (
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:44 }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              style={{ padding:"13px 26px", background:"#0c0c0c", border:"1px solid #1a1a1a", borderRadius:14, color:"#444", cursor:"pointer", fontSize:14, fontWeight:600 }}>
              Back
            </button>
          ) : <div />}

          {step < 3 && (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              style={{ padding:"13px 34px", background:canNext()?"linear-gradient(135deg,#f59e0b,#fbbf24)":"#0c0c0c", border:"none", borderRadius:14, color:canNext()?"#111":"#222", cursor:canNext()?"pointer":"not-allowed", fontWeight:900, fontSize:14 }}>
              Continue
            </button>
          )}

          {step === 3 && aiResult && (
            <button onClick={getLivePrice}
              style={{ padding:"13px 34px", background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", borderRadius:14, color:"#111", fontWeight:900, fontSize:14, cursor:"pointer" }}>
              Get Live Price
            </button>
          )}
        </div>
      )}
    </div>
  );
}