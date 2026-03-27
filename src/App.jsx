import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36);
const fmt = (n) => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(n);
const fmtDate = (d) => {try{return new Date(d).toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric"})}catch{return d}};
const fmtTime = (s) => {const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`};
const today = () => new Date().toISOString().slice(0,10);
const thisMonth = () => new Date().toISOString().slice(0,7);

/* ── localStorage with fallback ── */
function useStore(key, init) {
  const [val,setVal] = useState(() => {
    try { const s=localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key,JSON.stringify(val)); }
    catch(e) { console.warn("Storage full or unavailable",e); }
  },[key,val]);
  return [val,setVal];
}

/* ════════════════════════════════════════════
   DESIGN TOKENS
   ════════════════════════════════════════════ */
const C = {
  bg:"#0B0D10", surface:"#13161C", card:"#191D26", cardHover:"#1E222D",
  border:"#262A36", borderLight:"#2F3442",
  accent:"#7C6FFF", accentHover:"#6B5EEE", accentSoft:"rgba(124,111,255,.1)", accentGlow:"rgba(124,111,255,.25)",
  green:"#34D399", greenSoft:"rgba(52,211,153,.1)",
  amber:"#FBBF24", amberSoft:"rgba(251,191,36,.1)",
  red:"#F87171", redSoft:"rgba(248,113,113,.1)",
  text:"#E8EAEF", muted:"#878CA0", dim:"#4E536A", white:"#fff",
};

/* ════════════════════════════════════════════
   ICONS — lightweight SVG
   ════════════════════════════════════════════ */
const icons = {
  dashboard:"M4 13h6a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1zm0 8h6a1 1 0 001-1v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm10 0h6a1 1 0 001-1v-8a1 1 0 00-1-1h-6a1 1 0 00-1 1v8a1 1 0 001 1zm0-18v4a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1h-6a1 1 0 00-1 1z",
  clock:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  invoice:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h5v2H8v-2zm0-8h3v2H8V9z",
  users:"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z",
  quote:"M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 7V3.5L18.5 9H13zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16z",
  play:"M8 5v14l11-7z",
  stop:"M6 6h12v12H6z",
  plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  trash:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  menu:"M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z",
  close:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z",
  upload:"M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z",
  check:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
  arrow:"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z",
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  settings:"M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z",
};
const I = ({name,size=18,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d={icons[name]||icons.dashboard}/></svg>;

/* ════════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════════ */
const btnBase = {display:"inline-flex",alignItems:"center",gap:6,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,borderRadius:10,transition:"all .15s",fontFamily:"inherit"};
const Btn = ({children,variant="primary",onClick,style:st,...p}) => {
  const v = {
    primary:{...btnBase,background:C.accent,color:"#fff",padding:"10px 20px"},
    ghost:{...btnBase,background:C.accentSoft,color:C.accent,padding:"9px 16px"},
    danger:{...btnBase,background:C.redSoft,color:C.red,padding:"9px 16px"},
    success:{...btnBase,background:C.greenSoft,color:C.green,padding:"9px 16px"},
    outline:{...btnBase,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,padding:"9px 16px"},
  };
  return <button style={{...v[variant],...st}} onClick={onClick} {...p}>{children}</button>;
};

const inputStyle = {background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.text,fontSize:13.5,width:"100%",outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color .15s"};
const selectStyle = {...inputStyle,appearance:"none"};
const labelStyle = {fontSize:11,fontWeight:700,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.8px"};

const Field = ({label,children,style:st}) => <div style={{marginBottom:16,...st}}><label style={labelStyle}>{label}</label>{children}</div>;

const Badge = ({children,color,bg,onClick}) => {
  const s = {display:"inline-block",padding:"4px 12px",borderRadius:8,fontSize:11,fontWeight:700,background:bg,color,border:"none",fontFamily:"inherit"};
  return onClick ? <button style={{...s,cursor:"pointer"}} onClick={onClick}>{children}</button> : <span style={s}>{children}</span>;
};

/* ── Confirm dialog ── */
const Confirm = ({open,onClose,onConfirm,title,message}) => {
  if(!open) return null;
  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={{...modalBox,maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:36,marginBottom:12,opacity:.7}}>⚠️</div>
        <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 8px"}}>{title}</h3>
        <p style={{color:C.muted,fontSize:13.5,margin:"0 0 24px",lineHeight:1.5}}>{message}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <Btn variant="outline" onClick={onClose}>Annulla</Btn>
          <Btn variant="danger" onClick={()=>{onConfirm();onClose();}}>Elimina</Btn>
        </div>
      </div>
    </div>
  );
};

/* ── Modal ── */
const modalOverlay = {position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)",padding:16};
const modalBox = {background:C.card,borderRadius:18,border:`1px solid ${C.border}`,padding:"28px 30px",width:"100%",maxWidth:560,maxHeight:"88vh",overflowY:"auto"};
const Modal = ({open,onClose,title,children}) => {
  if(!open) return null;
  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{fontSize:17,fontWeight:700,margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4}}><I name="close" size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ── Empty state ── */
const Empty = ({icon,text,action}) => (
  <div style={{textAlign:"center",padding:"52px 20px",color:C.dim}}>
    <div style={{fontSize:44,marginBottom:14,opacity:.45}}>{icon}</div>
    <p style={{fontSize:14,lineHeight:1.6,marginBottom:action?20:0}}>{text}</p>
    {action}
  </div>
);

/* ════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════ */
function LandingPage({onEnter}) {
  const features = [
    {icon:"⏱",title:"Time Tracker",desc:"Timer live o inserimento manuale. Vedi dove va il tuo tempo."},
    {icon:"📄",title:"Fatture PDF",desc:"Crea fatture professionali con IVA e esportale in PDF."},
    {icon:"👥",title:"Gestione Clienti",desc:"Rubrica con storico ore, fatturato e tariffa per cliente."},
    {icon:"📝",title:"Preventivi",desc:"Invia stime professionali ai clienti con un click."},
    {icon:"📊",title:"Dashboard",desc:"Panoramica istantanea: fatturato, ore, pagamenti in sospeso."},
    {icon:"🔒",title:"100% Privato",desc:"I dati restano nel tuo browser. Nessun server, nessun account."},
  ];
  const faqs = [
    {q:"Devo registrarmi?",a:"No. Apri l'app e inizia a usarla subito. Nessuna email, nessun account."},
    {q:"I miei dati sono al sicuro?",a:"I dati restano nel tuo browser (localStorage). Non vengono mai inviati a nessun server. Puoi esportarli come backup in qualsiasi momento."},
    {q:"Costa qualcosa?",a:"FreelanceDash è gratuito. In futuro ci sarà un upgrade Pro opzionale a €19 (una tantum) per template premium e rimozione del watermark sulle fatture."},
    {q:"Funziona su mobile?",a:"Sì, l'interfaccia è completamente responsive e funziona su smartphone e tablet."},
  ];
  const [openFaq,setOpenFaq] = useState(null);

  return (
    <div style={{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      {/* Nav */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#9B8AFF)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff"}}>F</div>
          <span style={{fontSize:17,fontWeight:700,letterSpacing:"-.3px"}}>FreelanceDash</span>
        </div>
        <Btn onClick={onEnter}>Apri l'app <I name="arrow" size={14} color="#fff"/></Btn>
      </nav>

      {/* Hero */}
      <section style={{textAlign:"center",padding:"80px 24px 60px",maxWidth:720,margin:"0 auto"}}>
        <div style={{display:"inline-block",padding:"6px 16px",borderRadius:20,background:C.accentSoft,color:C.accent,fontSize:12,fontWeight:700,marginBottom:20,letterSpacing:".3px"}}>100% GRATUITO — NESSUNA REGISTRAZIONE</div>
        <h1 style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-1px",marginBottom:20}}>
          Tutto quello che ti serve<br/>da freelancer.{" "}
          <span style={{background:`linear-gradient(135deg,${C.accent},#B4A0FF)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>In un'unica app.</span>
        </h1>
        <p style={{fontSize:18,color:C.muted,lineHeight:1.6,marginBottom:36,maxWidth:520,margin:"0 auto 36px"}}>
          Timer, fatture, clienti e preventivi. Basta con 5 app diverse — gestisci tutto da una dashboard, gratis, senza creare un account.
        </p>
        <Btn onClick={onEnter} style={{padding:"14px 32px",fontSize:15,borderRadius:12}}>
          Inizia subito — è gratis <I name="arrow" size={16} color="#fff"/>
        </Btn>
        <p style={{fontSize:12,color:C.dim,marginTop:12}}>Nessuna carta di credito. Nessuna email. Pronto in 2 secondi.</p>
      </section>

      {/* Features */}
      <section style={{padding:"40px 24px 80px",maxWidth:1000,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {features.map((f,i) => (
            <div key={i} style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"24px 22px",transition:"border-color .2s"}}>
              <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:6}}>{f.title}</h3>
              <p style={{fontSize:13.5,color:C.muted,lineHeight:1.5,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:"0 24px 80px",maxWidth:640,margin:"0 auto"}}>
        <h2 style={{fontSize:24,fontWeight:800,textAlign:"center",marginBottom:32,letterSpacing:"-.5px"}}>Domande frequenti</h2>
        {faqs.map((f,i) => (
          <div key={i} style={{borderBottom:`1px solid ${C.border}`,padding:"16px 0"}}>
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{background:"none",border:"none",color:C.text,fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",padding:0,fontFamily:"inherit"}}>
              {f.q}
              <span style={{color:C.muted,fontSize:20,transform:openFaq===i?"rotate(45deg)":"none",transition:"transform .2s"}}>+</span>
            </button>
            {openFaq===i && <p style={{fontSize:13.5,color:C.muted,lineHeight:1.6,marginTop:10,paddingRight:20}}>{f.a}</p>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{textAlign:"center",padding:"60px 24px",margin:"0 24px 40px",borderRadius:20,background:`linear-gradient(135deg,${C.accent}15,#9B8AFF10)`,border:`1px solid ${C.accent}30`}}>
        <h2 style={{fontSize:26,fontWeight:800,marginBottom:12,letterSpacing:"-.5px"}}>Pronto a semplificare la tua vita da freelancer?</h2>
        <p style={{color:C.muted,fontSize:15,marginBottom:28}}>Zero costi, zero registrazione, zero scuse.</p>
        <Btn onClick={onEnter} style={{padding:"14px 32px",fontSize:15,borderRadius:12}}>
          Apri FreelanceDash <I name="arrow" size={16} color="#fff"/>
        </Btn>
      </section>

      {/* Footer */}
      <footer style={{textAlign:"center",padding:"24px",color:C.dim,fontSize:12,borderTop:`1px solid ${C.border}`}}>
        FreelanceDash — Open source, gratuito per sempre.
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
export default function App() {
  const [showLanding,setShowLanding] = useStore("fd_seen_landing",true);
  const [page,setPage] = useState("dashboard");
  const [menuOpen,setMenuOpen] = useState(false);
  const [clients,setClients] = useStore("fd_clients",[]);
  const [timeLogs,setTimeLogs] = useStore("fd_timelogs",[]);
  const [invoices,setInvoices] = useStore("fd_invoices",[]);
  const [quotes,setQuotes] = useStore("fd_quotes",[]);
  const [showSettings,setShowSettings] = useState(false);
  const [confirmDel,setConfirmDel] = useState(null);
  const isMobile = useIsMobile();

  // Timer
  const [timerOn,setTimerOn] = useState(false);
  const [timerSecs,setTimerSecs] = useState(0);
  const [timerClient,setTimerClient] = useState("");
  const [timerDesc,setTimerDesc] = useState("");
  const timerRef = useRef(null);
  useEffect(()=>{
    if(timerOn) timerRef.current=setInterval(()=>setTimerSecs(s=>s+1),1000);
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  },[timerOn]);

  const stopTimer = () => {
    if(timerSecs>=60){
      setTimeLogs(p=>[{id:uid(),clientId:timerClient,desc:timerDesc,seconds:timerSecs,date:today()},...p]);
    }
    setTimerOn(false);setTimerSecs(0);setTimerDesc("");
  };

  // Stats
  const mo = thisMonth();
  const moLogs = timeLogs.filter(l=>l.date?.startsWith(mo));
  const moSecs = moLogs.reduce((a,l)=>a+l.seconds,0);
  const moInv = invoices.filter(i=>i.date?.startsWith(mo));
  const moRev = moInv.reduce((a,i)=>a+(i.total||0),0);
  const pendingInv = invoices.filter(i=>i.status==="pending");
  const pendingTot = pendingInv.reduce((a,i)=>a+(i.total||0),0);

  // Export / Import
  const exportData = () => {
    const data = JSON.stringify({clients,timeLogs,invoices,quotes,exported:new Date().toISOString()},null,2);
    const blob = new Blob([data],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=`freelancedash-backup-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importData = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if(data.clients) setClients(data.clients);
        if(data.timeLogs) setTimeLogs(data.timeLogs);
        if(data.invoices) setInvoices(data.invoices);
        if(data.quotes) setQuotes(data.quotes);
        setShowSettings(false);
      } catch { alert("File non valido."); }
    };
    reader.readAsText(file);
  };

  // Nav
  const navItems = [
    {id:"dashboard",label:"Dashboard",icon:"dashboard"},
    {id:"timer",label:"Timer",icon:"clock"},
    {id:"clients",label:"Clienti",icon:"users"},
    {id:"invoices",label:"Fatture",icon:"invoice"},
    {id:"quotes",label:"Preventivi",icon:"quote"},
  ];
  const navigate = (id)=>{setPage(id);setMenuOpen(false);};

  if(showLanding) return <LandingPage onEnter={()=>setShowLanding(false)} />;

  const sideW = 230;
  const sideStyle = isMobile
    ? {position:"fixed",top:0,left:0,bottom:0,width:"80vw",maxWidth:300,background:C.surface,zIndex:200,transform:menuOpen?"translateX(0)":"translateX(-100%)",transition:"transform .25s ease",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}
    : {width:sideW,background:C.surface,borderRight:`1px solid ${C.border}`,position:"fixed",top:0,left:0,bottom:0,display:"flex",flexDirection:"column",zIndex:100};

  const mainPad = isMobile ? {padding:"16px"} : {marginLeft:sideW,padding:"32px 36px 48px",maxWidth:1120};

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans','Segoe UI',sans-serif",fontSize:14}}>
      {/* Mobile overlay */}
      {isMobile && menuOpen && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:150}} onClick={()=>setMenuOpen(false)}/>}

      {/* Sidebar */}
      <aside style={sideStyle}>
        <div style={{padding:"22px 20px 8px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#9B8AFF)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",flexShrink:0}}>F</div>
          <span style={{fontSize:17,fontWeight:700,letterSpacing:"-.3px"}}>FreelanceDash</span>
          {isMobile && <button style={{marginLeft:"auto",background:"none",border:"none",color:C.muted,cursor:"pointer"}} onClick={()=>setMenuOpen(false)}><I name="close" size={22}/></button>}
        </div>
        <nav style={{flex:1,padding:"18px 12px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{
              padding:"11px 14px",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,
              background:page===n.id?C.accentSoft:"transparent",color:page===n.id?C.accent:C.muted,
              fontWeight:page===n.id?600:400,fontSize:13.5,transition:"all .15s",border:"none",width:"100%",textAlign:"left",fontFamily:"inherit",
            }}>
              <I name={n.icon} size={17}/> {n.label}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={()=>{setShowSettings(true);setMenuOpen(false);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:13,padding:"8px 6px",fontFamily:"inherit"}}>
            <I name="settings" size={16}/> Impostazioni
          </button>
          <div style={{fontSize:11,color:C.dim,padding:"4px 6px"}}>Dati salvati nel browser</div>
        </div>
      </aside>

      {/* Mobile header */}
      {isMobile && (
        <header style={{position:"sticky",top:0,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"12px 16px",gap:12,zIndex:100}}>
          <button onClick={()=>setMenuOpen(true)} style={{background:"none",border:"none",color:C.text,cursor:"pointer"}}><I name="menu" size={24}/></button>
          <span style={{fontWeight:700,fontSize:15}}>FreelanceDash</span>
          {timerOn && <span style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:13,color:C.accent,fontWeight:600}}>{fmtTime(timerSecs)}</span>}
        </header>
      )}

      {/* Main */}
      <main style={mainPad}>
        {page==="dashboard" && <DashboardPage {...{moRev,moSecs,pendingTot,clients,invoices,timeLogs,navigate}} />}
        {page==="timer" && <TimerPage {...{timerOn,setTimerOn,timerSecs,timerClient,setTimerClient,timerDesc,setTimerDesc,stopTimer,clients,timeLogs,setTimeLogs,confirmDel,setConfirmDel}} />}
        {page==="clients" && <ClientsPage {...{clients,setClients,timeLogs,invoices,confirmDel,setConfirmDel}} />}
        {page==="invoices" && <InvoicesPage {...{invoices,setInvoices,clients,timeLogs,confirmDel,setConfirmDel}} />}
        {page==="quotes" && <QuotesPage {...{quotes,setQuotes,clients,confirmDel,setConfirmDel}} />}
      </main>

      {/* Settings Modal */}
      <Modal open={showSettings} onClose={()=>setShowSettings(false)} title="Impostazioni">
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Btn variant="ghost" onClick={exportData} style={{width:"100%",justifyContent:"center"}}><I name="download" size={15}/> Esporta tutti i dati (JSON)</Btn>
          <label style={{...btnBase,background:C.accentSoft,color:C.accent,padding:"10px 16px",justifyContent:"center",cursor:"pointer",width:"100%"}}>
            <I name="upload" size={15}/> Importa dati da backup
            <input type="file" accept=".json" onChange={importData} style={{display:"none"}} />
          </label>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,marginTop:8}}>
            <Btn variant="outline" onClick={()=>setShowLanding(true)} style={{width:"100%",justifyContent:"center"}}>Torna alla landing page</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Responsive hook ── */
function useIsMobile() {
  const [m,setM] = useState(()=>typeof window!=="undefined"?window.innerWidth<768:false);
  useEffect(()=>{
    const h=()=>setM(window.innerWidth<768);
    window.addEventListener("resize",h);return ()=>window.removeEventListener("resize",h);
  },[]);
  return m;
}

/* ════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════ */
function DashboardPage({moRev,moSecs,pendingTot,clients,invoices,timeLogs,navigate}) {
  const stats = [
    {label:"Fatturato mese",value:fmt(moRev),color:C.accent},
    {label:"Ore lavorate",value:`${Math.floor(moSecs/3600)}h ${Math.round((moSecs%3600)/60)}m`,color:C.green},
    {label:"In attesa",value:fmt(pendingTot),color:C.amber},
    {label:"Clienti",value:String(clients.length),color:C.text},
  ];
  const recent = invoices.slice(0,5);
  const recentLogs = timeLogs.slice(0,5);
  const hasData = clients.length>0||invoices.length>0||timeLogs.length>0;

  return <>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:4,letterSpacing:"-.3px"}}>Dashboard</h1>
    <p style={{color:C.muted,fontSize:13.5,marginBottom:24}}>Panoramica della tua attività</p>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
      {stats.map((s,i)=>(
        <div key={i} style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px",borderLeft:`3px solid ${s.color}`}}>
          <div style={labelStyle}>{s.label}</div>
          <div style={{fontSize:24,fontWeight:700,letterSpacing:"-.5px",color:s.color}}>{s.value}</div>
        </div>
      ))}
    </div>

    {!hasData ? (
      <div style={{...cardStyle,marginTop:24}}>
        <Empty icon="🚀" text="Benvenuto su FreelanceDash! Inizia aggiungendo il tuo primo cliente."
          action={<Btn onClick={()=>navigate("clients")}><I name="plus" size={14} color="#fff"/> Aggiungi cliente</Btn>}
        />
      </div>
    ) : (
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,marginTop:24}}>
        <div style={cardStyle}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:0}}>Ultime fatture</h3>
            <Btn variant="ghost" onClick={()=>navigate("invoices")} style={{padding:"5px 10px",fontSize:12}}>Tutte →</Btn>
          </div>
          {recent.length===0?<p style={{color:C.dim,fontSize:13}}>Nessuna fattura</p>:recent.map(inv=>(
            <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>#{inv.number}</div>
                <div style={{fontSize:12,color:C.muted}}>{inv.clientName}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:600,fontSize:13}}>{fmt(inv.total)}</div>
                <Badge color={inv.status==="paid"?C.green:C.amber} bg={inv.status==="paid"?C.greenSoft:C.amberSoft}>
                  {inv.status==="paid"?"Pagata":"In attesa"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:0}}>Attività recenti</h3>
            <Btn variant="ghost" onClick={()=>navigate("timer")} style={{padding:"5px 10px",fontSize:12}}>Tutte →</Btn>
          </div>
          {recentLogs.length===0?<p style={{color:C.dim,fontSize:13}}>Nessuna attività</p>:recentLogs.map(l=>(
            <div key={l.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontWeight:500,fontSize:13}}>{l.desc||"Sessione di lavoro"}</div>
                <div style={{fontSize:12,color:C.muted}}>{fmtDate(l.date)}</div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:600,fontSize:13}}>{fmtTime(l.seconds)}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>;
}

const cardStyle = {background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px 22px"};

/* ════════════════════════════════════════════
   TIMER
   ════════════════════════════════════════════ */
function TimerPage({timerOn,setTimerOn,timerSecs,timerClient,setTimerClient,timerDesc,setTimerDesc,stopTimer,clients,timeLogs,setTimeLogs,confirmDel,setConfirmDel}) {
  const [showManual,setShowManual] = useState(false);
  const [mH,setMH]=useState("");const [mM,setMM]=useState("");const [mC,setMC]=useState("");const [mD,setMD]=useState("");const [mDate,setMDate]=useState(today());
  const getClient = id => clients.find(c=>c.id===id)?.name||"—";

  const addManual = () => {
    const secs=(parseInt(mH||0)*3600)+(parseInt(mM||0)*60);
    if(secs<60) return;
    setTimeLogs(p=>[{id:uid(),clientId:mC,desc:mD,seconds:secs,date:mDate},...p]);
    setShowManual(false);setMH("");setMM("");setMD("");
  };

  return <>
    <h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Time Tracker</h1>
    <p style={{color:C.muted,fontSize:13.5,marginBottom:24}}>Traccia il tempo dedicato ai tuoi progetti</p>

    {/* Timer */}
    <div style={{...cardStyle,textAlign:"center",marginBottom:24,background:timerOn?`${C.accent}08`:C.card,border:timerOn?`1px solid ${C.accent}40`:`1px solid ${C.border}`}}>
      <div style={{fontSize:"clamp(40px,10vw,56px)",fontWeight:700,fontFamily:"'DM Mono',monospace",letterSpacing:2,margin:"16px 0"}}>{fmtTime(timerSecs)}</div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:18,flexWrap:"wrap"}}>
        <select style={{...selectStyle,width:"auto",minWidth:160}} value={timerClient} onChange={e=>setTimerClient(e.target.value)} disabled={timerOn}>
          <option value="">Seleziona cliente</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input style={{...inputStyle,width:"auto",minWidth:200,flex:1,maxWidth:300}} placeholder="Descrizione..." value={timerDesc} onChange={e=>setTimerDesc(e.target.value)}/>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        {!timerOn
          ? <Btn onClick={()=>setTimerOn(true)}><I name="play" size={14} color="#fff"/> Avvia</Btn>
          : <Btn variant="danger" onClick={stopTimer}><I name="stop" size={14} color={C.red}/> Ferma e salva</Btn>
        }
        <Btn variant="ghost" onClick={()=>setShowManual(true)}><I name="plus" size={14}/> Manuale</Btn>
      </div>
    </div>

    {/* Logs */}
    <div style={cardStyle}>
      <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 16px"}}>Registro ore</h3>
      {timeLogs.length===0 ? <Empty icon="⏱" text="Nessuna ora registrata. Avvia il timer o aggiungi manualmente."/> : (
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
            <thead><tr>{["Data","Cliente","Descrizione","Durata",""].map((h,i)=><th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>{timeLogs.map(l=>(
              <tr key={l.id}>
                <td style={tdStyle}>{fmtDate(l.date)}</td>
                <td style={tdStyle}>{getClient(l.clientId)}</td>
                <td style={tdStyle}>{l.desc||"—"}</td>
                <td style={{...tdStyle,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{fmtTime(l.seconds)}</td>
                <td style={tdStyle}><Btn variant="danger" style={{padding:"4px 8px"}} onClick={()=>setConfirmDel({type:"log",id:l.id})}><I name="trash" size={13} color={C.red}/></Btn></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>

    <Confirm open={confirmDel?.type==="log"} title="Eliminare questa voce?" message="L'operazione non può essere annullata."
      onClose={()=>setConfirmDel(null)} onConfirm={()=>setTimeLogs(p=>p.filter(l=>l.id!==confirmDel.id))} />

    <Modal open={showManual} onClose={()=>setShowManual(false)} title="Aggiungi ore">
      <Field label="Cliente"><select style={selectStyle} value={mC} onChange={e=>setMC(e.target.value)}><option value="">Seleziona</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Descrizione"><input style={inputStyle} value={mD} onChange={e=>setMD(e.target.value)} placeholder="Cosa hai fatto?"/></Field>
      <div style={{display:"flex",gap:12}}>
        <Field label="Ore" style={{flex:1}}><input style={inputStyle} type="number" min="0" value={mH} onChange={e=>setMH(e.target.value)} placeholder="0"/></Field>
        <Field label="Minuti" style={{flex:1}}><input style={inputStyle} type="number" min="0" max="59" value={mM} onChange={e=>setMM(e.target.value)} placeholder="0"/></Field>
        <Field label="Data" style={{flex:1}}><input style={inputStyle} type="date" value={mDate} onChange={e=>setMDate(e.target.value)}/></Field>
      </div>
      <Btn onClick={addManual} style={{width:"100%",justifyContent:"center",marginTop:8}}>Salva</Btn>
    </Modal>
  </>;
}

const thStyle = {textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".5px",borderBottom:`1px solid ${C.border}`};
const tdStyle = {padding:"12px",fontSize:13.5,borderBottom:`1px solid ${C.border}`,verticalAlign:"middle"};

/* ════════════════════════════════════════════
   CLIENTS
   ════════════════════════════════════════════ */
function ClientsPage({clients,setClients,timeLogs,invoices,confirmDel,setConfirmDel}) {
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({name:"",email:"",rate:"",note:""});
  const clientHours = id => timeLogs.filter(l=>l.clientId===id).reduce((a,l)=>a+l.seconds,0);
  const clientRev = id => invoices.filter(i=>i.clientId===id).reduce((a,i)=>a+(i.total||0),0);

  const add = () => {
    if(!form.name.trim()) return;
    setClients(p=>[...p,{id:uid(),...form,rate:parseFloat(form.rate)||0,created:today()}]);
    setForm({name:"",email:"",rate:"",note:""});setShowAdd(false);
  };

  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Clienti</h1><p style={{color:C.muted,fontSize:13.5,marginBottom:24}}>La tua rubrica</p></div>
      <Btn onClick={()=>setShowAdd(true)}><I name="plus" size={14} color="#fff"/> Nuovo cliente</Btn>
    </div>

    {clients.length===0 ? <div style={cardStyle}><Empty icon="👤" text="Nessun cliente. Aggiungine uno per iniziare!" action={<Btn onClick={()=>setShowAdd(true)}><I name="plus" size={14} color="#fff"/> Aggiungi</Btn>}/></div> : (
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {clients.map(c=>(
          <div key={c.id} style={cardStyle}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{width:40,height:40,borderRadius:12,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:C.accent}}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <Btn variant="danger" style={{padding:"5px 8px"}} onClick={()=>setConfirmDel({type:"client",id:c.id})}><I name="trash" size={13} color={C.red}/></Btn>
            </div>
            <h4 style={{fontSize:15,fontWeight:700,margin:"12px 0 4px"}}>{c.name}</h4>
            <p style={{fontSize:12,color:C.muted,margin:"0 0 14px"}}>{c.email||"Nessuna email"}</p>
            <div style={{display:"flex",gap:20,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              {[{l:"Tariffa/h",v:c.rate?fmt(c.rate):"—"},{l:"Ore",v:`${Math.round(clientHours(c.id)/3600)}h`},{l:"Fatturato",v:fmt(clientRev(c.id))}].map((s,i)=>(
                <div key={i}><div style={{fontSize:11,color:C.dim}}>{s.l}</div><div style={{fontSize:14,fontWeight:600}}>{s.v}</div></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}

    <Confirm open={confirmDel?.type==="client"} title="Eliminare questo cliente?" message="Le ore e le fatture collegate non verranno eliminate."
      onClose={()=>setConfirmDel(null)} onConfirm={()=>setClients(p=>p.filter(c=>c.id!==confirmDel.id))} />

    <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Nuovo cliente">
      <Field label="Nome *"><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Mario Rossi"/></Field>
      <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="mario@email.com"/></Field>
      <Field label="Tariffa oraria (€)"><input style={inputStyle} type="number" min="0" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} placeholder="50"/></Field>
      <Field label="Note"><input style={inputStyle} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Progetto, settore..."/></Field>
      <Btn onClick={add} style={{width:"100%",justifyContent:"center",marginTop:8}}>Salva cliente</Btn>
    </Modal>
  </>;
}

/* ════════════════════════════════════════════
   INVOICES
   ════════════════════════════════════════════ */
function InvoicesPage({invoices,setInvoices,clients,timeLogs,confirmDel,setConfirmDel}) {
  const [showCreate,setShowCreate] = useState(false);
  const [preview,setPreview] = useState(null);
  const init = {clientId:"",items:[{desc:"Servizio",qty:1,price:0}],note:"",tax:22};
  const [form,setForm] = useState(init);
  const nextNum = String(invoices.length+1).padStart(3,"0");

  const addItem = ()=>setForm({...form,items:[...form.items,{desc:"",qty:1,price:0}]});
  const rmItem = i=>setForm({...form,items:form.items.filter((_,j)=>j!==i)});
  const upItem = (i,f,v)=>{const items=[...form.items];items[i]={...items[i],[f]:f==="desc"?v:parseFloat(v)||0};setForm({...form,items});};

  const sub = form.items.reduce((a,it)=>a+it.qty*it.price,0);
  const tax = sub*((parseFloat(form.tax)||0)/100);
  const tot = sub+tax;

  const importHours = ()=>{
    if(!form.clientId) return;
    const c = clients.find(x=>x.id===form.clientId);
    const logs = timeLogs.filter(l=>l.clientId===form.clientId);
    const hrs = Math.round(logs.reduce((a,l)=>a+l.seconds,0)/3600*100)/100;
    if(hrs>0) setForm({...form,items:[{desc:`Ore di lavoro (${hrs}h)`,qty:hrs,price:c?.rate||0}]});
  };

  const create = ()=>{
    const c = clients.find(x=>x.id===form.clientId);
    const inv = {id:uid(),number:`FD-${nextNum}`,clientId:form.clientId,clientName:c?.name||"Cliente",clientEmail:c?.email||"",items:form.items,tax:parseFloat(form.tax)||0,subtotal:sub,taxAmount:tax,total:tot,note:form.note,date:today(),status:"pending"};
    setInvoices(p=>[inv,...p]);setForm(init);setShowCreate(false);
  };

  const toggle = id=>setInvoices(p=>p.map(i=>i.id===id?{...i,status:i.status==="paid"?"pending":"paid"}:i));

  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Fatture</h1><p style={{color:C.muted,fontSize:13.5,marginBottom:24}}>Crea e gestisci le tue fatture</p></div>
      <Btn onClick={()=>setShowCreate(true)}><I name="plus" size={14} color="#fff"/> Nuova fattura</Btn>
    </div>

    {invoices.length===0 ? <div style={cardStyle}><Empty icon="📄" text="Nessuna fattura. Creane una!" action={<Btn onClick={()=>setShowCreate(true)}><I name="plus" size={14} color="#fff"/> Crea fattura</Btn>}/></div> : (
      <div style={cardStyle}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:580}}>
            <thead><tr>{["N°","Cliente","Data","Totale","Stato",""].map((h,i)=><th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>{invoices.map(inv=>(
              <tr key={inv.id}>
                <td style={{...tdStyle,fontWeight:600}}>{inv.number}</td>
                <td style={tdStyle}>{inv.clientName}</td>
                <td style={tdStyle}>{fmtDate(inv.date)}</td>
                <td style={{...tdStyle,fontWeight:600}}>{fmt(inv.total)}</td>
                <td style={tdStyle}><Badge onClick={()=>toggle(inv.id)} color={inv.status==="paid"?C.green:C.amber} bg={inv.status==="paid"?C.greenSoft:C.amberSoft}>{inv.status==="paid"?"✓ Pagata":"⏳ In attesa"}</Badge></td>
                <td style={{...tdStyle,whiteSpace:"nowrap"}}>
                  <div style={{display:"flex",gap:6}}>
                    <Btn variant="ghost" style={{padding:"5px 8px"}} onClick={()=>setPreview(inv)}>👁</Btn>
                    <Btn variant="danger" style={{padding:"5px 8px"}} onClick={()=>setConfirmDel({type:"inv",id:inv.id})}><I name="trash" size={13} color={C.red}/></Btn>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )}

    <Confirm open={confirmDel?.type==="inv"} title="Eliminare questa fattura?" message="L'operazione non può essere annullata."
      onClose={()=>setConfirmDel(null)} onConfirm={()=>setInvoices(p=>p.filter(i=>i.id!==confirmDel.id))} />

    {/* Create */}
    <Modal open={showCreate} onClose={()=>setShowCreate(false)} title={`Nuova fattura #FD-${nextNum}`}>
      <Field label="Cliente">
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select style={{...selectStyle,flex:1,minWidth:160}} value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})}>
            <option value="">Seleziona</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Btn variant="ghost" onClick={importHours} style={{fontSize:12}}>⏱ Importa ore</Btn>
        </div>
      </Field>
      <div style={{marginBottom:16}}>
        <label style={labelStyle}>Voci</label>
        {form.items.map((it,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
            <input style={{...inputStyle,flex:"3 1 140px"}} placeholder="Descrizione" value={it.desc} onChange={e=>upItem(i,"desc",e.target.value)}/>
            <input style={{...inputStyle,flex:"1 1 60px",maxWidth:80}} type="number" placeholder="Qtà" value={it.qty||""} onChange={e=>upItem(i,"qty",e.target.value)}/>
            <input style={{...inputStyle,flex:"1 1 60px",maxWidth:90}} type="number" placeholder="€/u" value={it.price||""} onChange={e=>upItem(i,"price",e.target.value)}/>
            <span style={{fontSize:13,fontWeight:600,minWidth:65,textAlign:"right"}}>{fmt(it.qty*it.price)}</span>
            {form.items.length>1&&<button onClick={()=>rmItem(i)} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:16}}>✕</button>}
          </div>
        ))}
        <Btn variant="ghost" onClick={addItem} style={{fontSize:12,padding:"5px 12px"}}>+ Voce</Btn>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
        <Field label="IVA %" style={{flex:"1 1 80px",maxWidth:100,marginBottom:0}}><input style={inputStyle} type="number" value={form.tax} onChange={e=>setForm({...form,tax:e.target.value})}/></Field>
        <div style={{flex:1,textAlign:"right",paddingBottom:4}}>
          <div style={{fontSize:12,color:C.muted}}>Subtotale: {fmt(sub)}</div>
          <div style={{fontSize:12,color:C.muted}}>IVA: {fmt(tax)}</div>
          <div style={{fontSize:20,fontWeight:700,marginTop:4}}>Totale: {fmt(tot)}</div>
        </div>
      </div>
      <Field label="Note" style={{marginTop:16}}><input style={inputStyle} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Pagamento entro 30gg..."/></Field>
      <Btn onClick={create} style={{width:"100%",justifyContent:"center",marginTop:8}}>Crea fattura</Btn>
    </Modal>

    {/* Preview */}
    <Modal open={!!preview} onClose={()=>setPreview(null)} title="Anteprima fattura">
      {preview && <InvPreview inv={preview}/>}
    </Modal>
  </>;
}

function InvPreview({inv}) {
  const print = ()=>{
    const w=window.open("","_blank","width=800,height=900");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fattura ${inv.number}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Helvetica,sans-serif;padding:48px;color:#1a1a2e;max-width:800px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;margin-bottom:40px}.brand{font-size:28px;font-weight:800;color:#7C6FFF}
.sub{color:#888;font-size:12px;margin-top:2px}.dest{margin-bottom:28px}.dest-label{font-size:10px;text-transform:uppercase;color:#aaa;margin-bottom:3px}
.dest-name{font-size:16px;font-weight:600}table{width:100%;border-collapse:collapse;margin:20px 0}
th{text-align:left;padding:8px 10px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#999;border-bottom:2px solid #eee}
td{padding:10px;border-bottom:1px solid #f0f0f0;font-size:13px}.r{text-align:right}.b{font-weight:600}
.totals{text-align:right;margin-top:20px;padding-top:16px;border-top:2px solid #eee}
.total-big{font-size:24px;font-weight:800;margin-top:8px;color:#1a1a2e}
.note{margin-top:24px;padding:14px;background:#f8f8fc;border-radius:8px;font-size:13px;color:#666;line-height:1.5}
.footer{margin-top:48px;text-align:center;font-size:10px;color:#ccc}
@media print{body{padding:24px}.footer{margin-top:32px}}</style></head><body>
<div class="hdr"><div><div class="brand">FATTURA</div><div class="sub">${inv.number}</div></div>
<div style="text-align:right"><div style="font-weight:600">FreelanceDash</div><div class="sub">${fmtDate(inv.date)}</div></div></div>
<div class="dest"><div class="dest-label">Destinatario</div><div class="dest-name">${inv.clientName}</div>
${inv.clientEmail?`<div class="sub">${inv.clientEmail}</div>`:""}</div>
<table><thead><tr><th>Descrizione</th><th>Qtà</th><th>Prezzo</th><th class="r">Totale</th></tr></thead><tbody>
${inv.items.map(it=>`<tr><td>${it.desc}</td><td>${it.qty}</td><td>&euro;${Number(it.price).toFixed(2)}</td><td class="r b">&euro;${(it.qty*it.price).toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals"><div class="sub">Subtotale: &euro;${inv.subtotal.toFixed(2)}</div>
<div class="sub">IVA (${inv.tax}%): &euro;${inv.taxAmount.toFixed(2)}</div>
<div class="total-big">Totale: &euro;${inv.total.toFixed(2)}</div></div>
${inv.note?`<div class="note">${inv.note}</div>`:""}
<div class="footer">Generata con FreelanceDash &mdash; freelancedash.vercel.app</div>
</body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),300);
  };

  return <div>
    <div style={{background:"#fff",borderRadius:14,padding:28,color:"#1a1a2e",fontSize:13}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:22,fontWeight:800,color:C.accent}}>FATTURA</div><div style={{color:"#888",fontSize:12}}>{inv.number}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontWeight:600}}>FreelanceDash</div><div style={{color:"#888",fontSize:12}}>{fmtDate(inv.date)}</div></div>
      </div>
      <div style={{marginBottom:20}}><div style={{fontSize:10,textTransform:"uppercase",color:"#aaa"}}>Destinatario</div><div style={{fontWeight:600,fontSize:15}}>{inv.clientName}</div></div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Descrizione","Qtà","Prezzo","Totale"].map((h,i)=><th key={h} style={{textAlign:i===3?"right":"left",padding:"6px 8px",fontSize:10,textTransform:"uppercase",color:"#999",borderBottom:"2px solid #eee"}}>{h}</th>)}</tr></thead>
        <tbody>{inv.items.map((it,i)=>(
          <tr key={i}><td style={{padding:"8px",borderBottom:"1px solid #f0f0f0"}}>{it.desc}</td><td style={{padding:"8px",borderBottom:"1px solid #f0f0f0"}}>{it.qty}</td><td style={{padding:"8px",borderBottom:"1px solid #f0f0f0"}}>{fmt(it.price)}</td><td style={{padding:"8px",borderBottom:"1px solid #f0f0f0",textAlign:"right",fontWeight:600}}>{fmt(it.qty*it.price)}</td></tr>
        ))}</tbody>
      </table>
      <div style={{textAlign:"right",marginTop:16,paddingTop:12,borderTop:"2px solid #eee"}}>
        <div style={{color:"#888"}}>Subtotale: {fmt(inv.subtotal)}</div>
        <div style={{color:"#888"}}>IVA ({inv.tax}%): {fmt(inv.taxAmount)}</div>
        <div style={{fontSize:20,fontWeight:700,marginTop:6,color:"#1a1a2e"}}>Totale: {fmt(inv.total)}</div>
      </div>
      {inv.note&&<div style={{marginTop:16,padding:12,background:"#f8f8fc",borderRadius:8,fontSize:13,color:"#666"}}>{inv.note}</div>}
    </div>
    <Btn onClick={print} style={{width:"100%",justifyContent:"center",marginTop:16}}><I name="download" size={14} color="#fff"/> Stampa / Salva PDF</Btn>
  </div>;
}

/* ════════════════════════════════════════════
   QUOTES
   ════════════════════════════════════════════ */
function QuotesPage({quotes,setQuotes,clients,confirmDel,setConfirmDel}) {
  const [showCreate,setShowCreate] = useState(false);
  const init = {clientId:"",title:"",items:[{desc:"",price:0}],validDays:30,note:""};
  const [form,setForm] = useState(init);
  const nextNum = String(quotes.length+1).padStart(3,"0");
  const tot = form.items.reduce((a,it)=>a+(parseFloat(it.price)||0),0);

  const addItem = ()=>setForm({...form,items:[...form.items,{desc:"",price:0}]});
  const rmItem = i=>setForm({...form,items:form.items.filter((_,j)=>j!==i)});
  const upItem = (i,f,v)=>{const items=[...form.items];items[i]={...items[i],[f]:f==="price"?parseFloat(v)||0:v};setForm({...form,items});};

  const toggle = id=>setQuotes(p=>p.map(q=>q.id===id?{...q,status:q.status==="accepted"?"sent":"accepted"}:q));
  const create = ()=>{
    const c=clients.find(x=>x.id===form.clientId);
    setQuotes(p=>[{id:uid(),number:`PR-${nextNum}`,clientId:form.clientId,clientName:c?.name||"Cliente",title:form.title,items:form.items,total:tot,validDays:form.validDays,note:form.note,date:today(),status:"sent"},...p]);
    setForm(init);setShowCreate(false);
  };

  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Preventivi</h1><p style={{color:C.muted,fontSize:13.5,marginBottom:24}}>Invia stime ai tuoi clienti</p></div>
      <Btn onClick={()=>setShowCreate(true)}><I name="plus" size={14} color="#fff"/> Nuovo preventivo</Btn>
    </div>

    {quotes.length===0 ? <div style={cardStyle}><Empty icon="📝" text="Nessun preventivo. Inizia a vendere!" action={<Btn onClick={()=>setShowCreate(true)}><I name="plus" size={14} color="#fff"/> Crea</Btn>}/></div> : (
      <div style={cardStyle}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
            <thead><tr>{["N°","Titolo","Cliente","Data","Totale","Stato",""].map((h,i)=><th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>{quotes.map(q=>(
              <tr key={q.id}>
                <td style={{...tdStyle,fontWeight:600}}>{q.number}</td>
                <td style={tdStyle}>{q.title||"—"}</td>
                <td style={tdStyle}>{q.clientName}</td>
                <td style={tdStyle}>{fmtDate(q.date)}</td>
                <td style={{...tdStyle,fontWeight:600}}>{fmt(q.total)}</td>
                <td style={tdStyle}><Badge onClick={()=>toggle(q.id)} color={q.status==="accepted"?C.green:C.accent} bg={q.status==="accepted"?C.greenSoft:C.accentSoft}>{q.status==="accepted"?"✓ Accettato":"📩 Inviato"}</Badge></td>
                <td style={tdStyle}><Btn variant="danger" style={{padding:"5px 8px"}} onClick={()=>setConfirmDel({type:"quote",id:q.id})}><I name="trash" size={13} color={C.red}/></Btn></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )}

    <Confirm open={confirmDel?.type==="quote"} title="Eliminare questo preventivo?" message="L'operazione non può essere annullata."
      onClose={()=>setConfirmDel(null)} onConfirm={()=>setQuotes(p=>p.filter(q=>q.id!==confirmDel.id))} />

    <Modal open={showCreate} onClose={()=>setShowCreate(false)} title={`Preventivo #PR-${nextNum}`}>
      <Field label="Titolo progetto"><input style={inputStyle} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Redesign sito web"/></Field>
      <Field label="Cliente"><select style={selectStyle} value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})}><option value="">Seleziona</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <div style={{marginBottom:16}}>
        <label style={labelStyle}>Voci</label>
        {form.items.map((it,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
            <input style={{...inputStyle,flex:"3 1 140px"}} placeholder="Descrizione" value={it.desc} onChange={e=>upItem(i,"desc",e.target.value)}/>
            <input style={{...inputStyle,flex:"1 1 60px",maxWidth:100}} type="number" placeholder="€" value={it.price||""} onChange={e=>upItem(i,"price",e.target.value)}/>
            {form.items.length>1&&<button onClick={()=>rmItem(i)} style={{background:"none",border:"none",color:C.red,cursor:"pointer"}}>✕</button>}
          </div>
        ))}
        <Btn variant="ghost" onClick={addItem} style={{fontSize:12,padding:"5px 12px"}}>+ Voce</Btn>
      </div>
      <div style={{textAlign:"right",fontSize:20,fontWeight:700,margin:"8px 0 16px"}}>Totale: {fmt(tot)}</div>
      <Field label="Validità (giorni)"><input style={inputStyle} type="number" value={form.validDays} onChange={e=>setForm({...form,validDays:e.target.value})}/></Field>
      <Field label="Note"><input style={inputStyle} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Condizioni, tempistiche..."/></Field>
      <Btn onClick={create} style={{width:"100%",justifyContent:"center",marginTop:8}}>Crea preventivo</Btn>
    </Modal>
  </>;
}
