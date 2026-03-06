import { Link, useLocation } from 'react-router-dom'

const S = {
  nav: { position:'sticky', top:0, zIndex:200, background:'rgba(8,8,8,0.95)', backdropFilter:'blur(24px)', borderBottom:'1px solid #111', padding:'12px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:900, textDecoration:'none', color:'#fff', letterSpacing:'-0.5px' },
  link: { color:'#444', textDecoration:'none', fontSize:13, fontWeight:500, padding:'6px 14px', borderRadius:20, transition:'all 0.2s', fontFamily:"'Outfit',sans-serif" },
  linkActive: { color:'#f59e0b' },
  dot: { width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'livepulse 1.5s infinite', marginRight:6 },
}

export default function Navbar({ onlineUsers, liveOrders }) {
  const loc = useLocation()
  const links = [['/', 'Home'], ['/products', 'Products'], ['/customize', 'Customize'], ['/orders', 'My Orders']]
  return (
    <nav style={S.nav}>
      <Link to="/" style={S.logo}>Harsha<span style={{ color:'#f59e0b' }}>Store</span></Link>
      <div style={{ display:'flex', gap:4 }}>
        {links.map(([to, label]) => (
          <Link key={to} to={to} style={{ ...S.link, ...(loc.pathname===to ? S.linkActive : {}) }}
            onMouseEnter={e => { if(loc.pathname!==to) e.target.style.color='#f59e0b' }}
            onMouseLeave={e => { if(loc.pathname!==to) e.target.style.color='#444' }}
          >{label}</Link>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={S.dot} />
          <span style={{ color:'#4ade80', fontSize:12, fontWeight:700 }}>{onlineUsers?.toLocaleString()} online</span>
        </div>
        <span style={{ color:'#f59e0b', fontSize:12, fontWeight:700 }}>🛒 {liveOrders} orders/min</span>
        <Link to="/customize" style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', color:'#111', padding:'8px 20px', borderRadius:20, fontWeight:800, fontSize:13, textDecoration:'none' }}>
          ✨ Customize
        </Link>
      </div>
      <style>{`@keyframes livepulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}`}</style>
    </nav>
  )
}