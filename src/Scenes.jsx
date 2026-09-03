import React, { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Camera, PartyPopper, Heart, Sparkles, Star, Cake, Gift } from "lucide-react";
import HTMLFlipBook from "react-pageflip";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const STICKERS = ["❤️", "😍", "🔥", "✨", "👑"];
function StickerBar({ pageIndex }) {
  const [counts, setCounts] = useState({});
  const [active, setActive] = useState(null);
  const tap = (s) => {
    const isActive = active === s;
    setActive(isActive ? null : s);
    setCounts(c => ({ ...c, [s]: (c[s] || 0) + (isActive ? -1 : 1) }));
  };
  return (
    <div className="sticker-bar" onClick={e => e.stopPropagation()}>
      {STICKERS.map(s => (
        <button key={s} className={`sticker-btn ${active === s ? "active" : ""}`} onClick={() => tap(s)}>
          {s}{counts[s] ? <span className="sticker-count">{counts[s]}</span> : null}
        </button>
      ))}
    </div>
  );
}

function ScratchCard({ children, onRevealed }) {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawing = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 480; canvas.height = 480;
    ctx.fillStyle = "#cbd5e1"; ctx.fillRect(0, 0, 480, 480);
    ctx.font = "24px Outfit"; ctx.fillStyle = "#334155"; ctx.textAlign = "center";
    ctx.fillText("Scratch to Reveal!", 175, 175);
    ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.lineWidth = 40;
    ctx.globalCompositeOperation = "destination-out";
  }, []);
  const down = () => { isDrawing.current = true; };
  const up = () => { isDrawing.current = false; checkReveal(); };
  const move = (e) => {
    if (!isDrawing.current || isRevealed) return;
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(cx - rect.left, cy - rect.top); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - rect.left, cy - rect.top);
  };
  const checkReveal = () => {
    const canvas = canvasRef.current; const ctx = canvas.getContext("2d");
    const d = ctx.getImageData(0, 0, 480, 480).data; let t = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 10) t++;
    if (t / (d.length / 4) > 0.4 && !isRevealed) { setIsRevealed(true); onRevealed(); }
  };
  return (
    <div style={{ position:"relative", width:"480px", height:"480px", borderRadius:"50%", overflow:"hidden" }}>
      {children}
      <AnimatePresence>
        {!isRevealed && (
          <motion.canvas ref={canvasRef} className="scratch-overlay"
            onPointerDown={down} onPointerUp={up} onPointerMove={move}
            onTouchStart={down} onTouchEnd={up} onTouchMove={move}
            exit={{ opacity:0, scale:1.1 }} transition={{ duration:1 }} />
        )}
      </AnimatePresence>
    </div>
  );
}

export function CakeScene({ onNext }) {
  const [blown, setBlown] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const startBlow = () => setCountdown(3);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) { const t = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(t); }
    else {
      if (attempt === 0) { setAttempt(1); setCountdown(null); }
      else if (attempt === 1) {
        setBlown(true); setAttempt(2); setCountdown(null);
        const audio = new Audio("/assets/song.mp3"); audio.loop = true;
        audio.play().catch(e => console.log("blocked", e));
        setTimeout(onNext, 6000);
      }
    }
  }, [countdown, attempt, onNext]);
  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div style={{ marginBottom:"3rem" }}>
        <ScratchCard onRevealed={() => setIsRevealed(true)}>
          <div style={{ position:"relative", width:"100%", height:"100%" }}>
            <motion.img src="/assets/cake.jpg" alt="Cake" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%", border:"4px solid rgba(255,255,255,0.1)" }} />
            <div className="flame-wrapper">
              {!blown && <div className="flame"></div>}
              {blown && <div className="smoke"></div>}
            </div>
          </div>
        </ScratchCard>
      </div>
      {isRevealed && countdown === null && attempt === 0 && (
        <motion.button className="btn-primary" onClick={startBlow} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
          Make a Wish & Blow (3s)
        </motion.button>
      )}
      {countdown !== null && countdown > 0 && (
        <motion.h2 className="title-gold" animate={{ scale:[1,1.1,1] }} transition={{ duration:1, repeat:Infinity }}>Blowing in... {countdown}</motion.h2>
      )}
      {attempt === 1 && countdown === null && (
        <motion.div {...fadeIn}>
          <h2 style={{ color:"#fca5a5" }}>Jor se Phukk damm nhi hai kya 😂</h2>
          <button className="btn-primary" style={{ marginTop:"1rem" }} onClick={startBlow}>Try Again</button>
        </motion.div>
      )}
      {attempt === 2 && countdown === null && (
        <motion.h2 className="title-gold" {...fadeIn}>Yay! Happy Birthday! 🎉</motion.h2>
      )}
    </motion.div>
  );
}

export function EnvelopeScene({ onNext }) {
  const [opened, setOpened] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = `There are people who make the world brighter just by being in it — and you are absolutely one of them. 🌸\n\nEvery moment with you feels like a little magic. You make everyone feel special without even trying. That is rare. That is you.\n\nI wish you a year full of laughter, adventure, love, and every single thing that makes your heart happy. May every dream you carry close actually come true.\n\nYou deserve the absolute world, Akansha. And then some. 💖`;
  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => setLetterOut(true), 900);
  };
  useEffect(() => {
    if (!letterOut) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) { setTypedText(fullText.substring(0, i)); i++; }
      else clearInterval(interval);
    }, 24);
    return () => clearInterval(interval);
  }, [letterOut]);

  return (
    <motion.div className="scene-container" {...fadeIn} style={{ maxWidth:"1200px", flexDirection:"row", gap:"5rem", alignItems:"center", justifyContent:"center" }}>
      {/* Left — Envelope */}
      <motion.div
        style={{ flexShrink:0, cursor: opened ? "default" : "pointer" }}
        onClick={handleOpen}
        animate={opened ? { scale:0.88, rotateY:-12, opacity:0.75 } : { scale:1, rotateY:0, opacity:1 }}
        transition={{ duration:1, ease:"easeInOut" }}
        whileHover={!opened ? { scale:1.03, y:-6 } : {}}
      >
        <div className="envelope-wrapper-2">
          <div className="envelope">
            <div className="envelope-front"></div>
            <div className={`envelope-flap ${opened ? "open" : ""}`}>
              {!opened && (
                <motion.div
                  style={{ position:"absolute", top:"-70px", left:"-60px", width:"120px", textAlign:"center", color:"#fff", fontSize:"1.2rem", fontFamily:"'Kalam',cursive", pointerEvents:"none" }}
                  animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
                >
                  ✉️ Open Me
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right — Letter slides in */}
      <AnimatePresence>
        {letterOut && (
          <motion.div
            className="letter"
            initial={{ opacity:0, x:60, rotateY:10 }}
            animate={{ opacity:1, x:0, rotateY:0 }}
            transition={{ duration:1.0, ease:[0.16,1,0.3,1] }}
            style={{ flexShrink:0, position:"relative" }}
          >
            {/* Tape strip at top */}
            <div style={{ position:"absolute", top:"-16px", left:"50%", transform:"translateX(-50%) rotate(-2deg)", width:"100px", height:"24px", background:"rgba(255,240,180,0.7)", borderRadius:"2px", boxShadow:"0 2px 4px rgba(0,0,0,0.1)" }} />
            <h3>Dear Akansha, 🌸</h3>
            <p style={{ whiteSpace:"pre-line" }}>
              {typedText}{typedText.length < fullText.length && <span className="cursor-blink">|</span>}
            </p>
            {typedText.length >= fullText.length && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} style={{ marginTop:"2rem", textAlign:"right", width:"100%" }}>
                <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:"1.5rem", color:"#b45309", marginBottom:0 }}>With all my love,</p>
                <p className="signature">Vaibhav 💖</p>
              </motion.div>
            )}
            {typedText.length >= fullText.length && (
              <motion.button className="btn-primary" style={{ marginTop:"1.5rem", width:"100%" }} onClick={onNext} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}>
                See the memories 📸
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const Page = forwardRef((props, ref) => (
  <div className="book-page" ref={ref} data-density={props.density || "soft"} style={{ position:"relative" }}>
    {props.children}
  </div>
));

export function MemoryBookScene({ onNext }) {
  const memories = [
    { img:"/assets/memory1.jpg",  caption:"The day my world got a little brighter", doodle:<svg style={{position:"absolute",top:"6%",left:"8%",opacity:0.7}} width="60" height="50" viewBox="0 0 60 50"><text x="0" y="35" fontSize="28" fill="#fbbf24">star</text></svg> },
    { img:"/assets/memory2.jpg",  caption:"That smile I could look at forever" },
    { img:"/assets/memory3.jpg",  caption:"Effortlessly gorgeous, inside and out" },
    { img:"/assets/memory4.jpg",  caption:"You are the main character of my life" },
    { img:"/assets/memory5.jpg",  caption:"A moment I will keep in my heart always" },
    { img:"/assets/memory6.jpg",  caption:"Looking at you feels like magic" },
    { img:"/assets/memory7.jpg",  caption:"The best part of every single day" },
    { img:"/assets/memory8.jpg",  caption:"Just you being your absolute radiant self" },
    { img:"/assets/memory9.jpg",  caption:"God really took His time with you" },
    { img:"/assets/memory10.jpg", caption:"You make everything feel so special" },
    { img:"/assets/memory11.jpg", caption:"My favorite person in the entire universe" },
    { img:"/assets/memory12.jpg", caption:"You glow differently, you know that?" },
    { img:"/assets/memory13.jpg", caption:"The reason behind all my happy vibes" },
    { img:"/assets/memory14.jpg", caption:"I never want to forget this moment" },
    { img:"/assets/memory15.jpg", caption:"An absolute queen, today and always" },
    { img:"/assets/memory16.jpg", caption:"Stunning beyond words!" },
    { img:"/assets/memory17.jpg", caption:"Here is to you, the best thing ever" },
    { img:"/assets/memory18.jpg", caption:"Too gorgeous to handle" },
    { img:"/assets/memory19.jpg", caption:"An actual angel" },
  ];

  const doodleColors = ["#ec4899","#8b5cf6","#fbbf24","#22c55e","#3b82f6"];
  const doodleEmojis = ["🌸","💖","✨","🌟","🥰","💫","😍","🌷","💌","🎀","👑","🎵","🌈","⭐","🎂","🎉","🌙","💎","🌺"];

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <h2 className="title-gold" style={{ marginBottom:"1.5rem" }}>Flip the pages</h2>
      <div className="book-wrapper">
        <div className="book-spine"><span className="spine-title">AKANSHA MEMORIES</span></div>
        <HTMLFlipBook width={420} height={590} size="stretch" minWidth={400} maxWidth={500} minHeight={560} maxHeight={640} showCover={true} className="book-container">
          <Page density="hard">
            <div className="book-cover" style={{ width:"100%", height:"100%", position:"relative" }}>
              <div className="cover-frame">
                <div className="cover-content">
                  <h1 style={{ fontFamily:"'Kalam',cursive", textShadow:"0 2px 10px rgba(0,0,0,0.8)", fontSize:"2.8rem" }}>Akansha</h1>
                  <h2 style={{ fontFamily:"'Kalam',cursive", textShadow:"0 2px 10px rgba(0,0,0,0.8)", fontSize:"1.6rem" }}>Memories</h2>
                  <Heart size={56} color="#ec4899" style={{ marginTop:"1rem", filter:"drop-shadow(0 2px 5px rgba(0,0,0,0.5))" }} />
                  <p style={{ fontFamily:"'Kalam',cursive", marginTop:"1rem", fontSize:"0.9rem", opacity:0.9 }}>Drag to open</p>
                </div>
              </div>
            </div>
          </Page>
          {memories.map((mem, index) => {
            const rotate = index % 2 === 0 ? 2 : -2;
            const emoji1 = doodleEmojis[index % doodleEmojis.length];
            const emoji2 = doodleEmojis[(index + 7) % doodleEmojis.length];
            const color1 = doodleColors[index % doodleColors.length];
            const color2 = doodleColors[(index + 2) % doodleColors.length];
            const topPos = index % 2 === 0 ? "5%" : "8%";
            const sidePos = index % 2 === 0 ? { right:"8%" } : { left:"8%" };
            return (
              <Page key={index}>
                <span style={{ position:"absolute", top:topPos, ...sidePos, fontSize:"2rem", opacity:0.75, filter:`drop-shadow(0 2px 4px ${color1})` }}>{emoji1}</span>
                <span style={{ position:"absolute", bottom:"16%", left: index % 2 === 0 ? "8%" : "auto", right: index % 2 !== 0 ? "8%" : "auto", fontSize:"1.6rem", opacity:0.6, transform:"rotate(-10deg)" }}>{emoji2}</span>
                <svg style={{ position:"absolute", top:"12%", left: index%3===0?"6%":index%3===1?"auto":"50%", right:index%3===1?"6%":"auto", transform:index%3===2?"translateX(-50%)":"none", opacity:0.5 }} width="50" height="50" viewBox="0 0 50 50">
                  {index%4===0 && <path d="M25 0 L26.5 20 L46 25 L26.5 30 L25 50 L23.5 30 L4 25 L23.5 20 Z" fill={color1}/>}
                  {index%4===1 && <path d="M25 5 Q5 10 5 25 Q5 40 25 45 Q45 40 45 25 Q45 10 25 5Z" fill="none" stroke={color1} strokeWidth="2"/>}
                  {index%4===2 && <><circle cx="20" cy="15" r="10" fill={color1} opacity="0.7"/><circle cx="35" cy="20" r="8" fill={color2} opacity="0.7"/></>}
                  {index%4===3 && <path d="M5 25 Q15 5 25 15 Q35 5 45 25 Q35 45 25 38 Q15 45 5 25Z" fill={color1} opacity="0.8"/>}
                </svg>
                <motion.div className="polaroid" style={{ marginTop:"1.5rem", position:"relative", zIndex:1 }} initial={{ rotate }} whileHover={{ scale:1.05, rotate:0, zIndex:10 }} transition={{ type:"spring", stiffness:300 }}>
                  <img src={mem.img} alt={`Memory ${index+1}`} style={{ height:"320px", objectFit:"cover", objectPosition:"top center" }} />
                  <p style={{ color:"#5a3825", marginTop:"8px", fontFamily:"'Kalam',cursive", fontSize:"0.9rem", textAlign:"center" }}>{mem.caption}</p>
                </motion.div>
                <StickerBar pageIndex={index} />
              </Page>
            );
          })}
          <Page density="hard">
            <Star style={{ position:"absolute", top:"10%", right:"12%", color:"#fbbf24", transform:"rotate(20deg)" }} size={36} />
            <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center" }}>
              <Camera size={64} style={{ margin:"0 auto 2rem", color:"#8b5cf6" }} />
              <h2 style={{ color:"#5a3825", textAlign:"center", fontFamily:"'Kalam',cursive", fontSize:"1.6rem" }}>Take a memory picture</h2>
              <button className="btn-primary" style={{ marginTop:"2rem" }} onClick={onNext}>Open Camera</button>
            </div>
          </Page>
        </HTMLFlipBook>
      </div>
    </motion.div>
  );
}

export function CameraCaptureScene({ onNext, setCapturedImage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [imgData, setImgData] = useState(null);
  useEffect(() => {
    async function setup() {
      try {
        const str = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(str);
        if (videoRef.current) videoRef.current.srcObject = str;
      } catch { setError("Camera access denied."); }
    }
    setup();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);
  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setImgData(dataUrl); setCapturedImage(dataUrl); setHasCaptured(true);
      if (stream) stream.getTracks().forEach(t => t.stop());
      setTimeout(onNext, 3500);
    }
  };
  return (
    <motion.div className="scene-container" {...fadeIn} style={{ overflow:"hidden" }}>
      <AnimatePresence>
        {!hasCaptured ? (
          <motion.div exit={{ opacity:0, y:-50 }} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <h2 className="title-gold">Smile!</h2>
            {error ? (
              <div className="glass-panel" style={{ marginTop:"2rem" }}>
                <p>{error}</p>
                <button className="btn-ghost" style={{ padding:"0.8rem 1.5rem", borderRadius:"50px" }} onClick={() => { setCapturedImage("/assets/photo.jpg"); onNext(); }}>Skip</button>
              </div>
            ) : (
              <div className="polaroid" style={{ transform:"none", margin:"2rem 0", paddingBottom:"20px" }}>
                <video ref={videoRef} autoPlay playsInline style={{ width:"100%", maxWidth:"400px", borderRadius:"5px" }}></video>
                <canvas ref={canvasRef} style={{ display:"none" }}></canvas>
              </div>
            )}
            {!error && <button className="btn-primary" onClick={capture}>Capture Picture</button>}
          </motion.div>
        ) : (
          <motion.div initial={{ y:-300, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:1.5, ease:"easeOut" }} style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:"2rem" }}>
            <div className="polaroid" style={{ transform:"rotate(-2deg)" }}>
              <img src={imgData} alt="Memory" style={{ width:"100%", maxWidth:"300px" }} />
              <p style={{ color:"#333", marginTop:"10px", fontFamily:"'Kalam',cursive" }}>Perfect!</p>
            </div>
            <p style={{ marginTop:"2rem", fontFamily:"'Kalam',cursive", color:"#fbbf24" }}>Printing memory...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PartyQuestionScene({ onNext }) {
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState({ top:"50%", left:"60%" });
  const [yesClicked, setYesClicked] = useState(false);
  const handleNoHover = () => {
    if (noCount >= 3) return;
    setNoPos({ top:`${Math.random()*60+20}%`, left:`${Math.random()*60+20}%` });
    setNoCount(noCount + 1);
  };
  const handleYes = () => { setYesClicked(true); setTimeout(onNext, 4500); };
  if (yesClicked) return (
    <motion.div className="scene-container glass-panel" {...fadeIn}>
      <PartyPopper size={80} style={{ color:"#fbbf24", margin:"0 auto 1.5rem" }} />
      <h2>yay its party bas bill mujh par mat fadna</h2>
      <motion.p initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:2, type:"spring", damping:10 }} style={{ fontSize:"2.5rem", color:"#fbbf24", marginTop:"2rem", fontWeight:"bold", fontFamily:"'Playfair Display',serif" }}>"Bohot pitega tu"</motion.p>
    </motion.div>
  );
  return (
    <motion.div className="scene-container glass-panel" style={{ position:"relative", width:"100%", height:"500px", maxWidth:"600px" }} {...fadeIn}>
      <h2 style={{ marginTop:"3rem" }}>Party toh deni padegi</h2>
      <motion.button className="btn-primary" onClick={handleYes} style={{ position:"absolute", top:"50%", left:"30%", transform:"translate(-50%,-50%)" }} animate={{ scale:1+noCount*0.3 }}>Yes</motion.button>
      {noCount < 3 && <button className="btn-primary evasive-btn" style={{ top:noPos.top, left:noPos.left, transform:"translate(-50%,-50%)", background:"rgba(255,255,255,0.1)", boxShadow:"none", border:"1px solid rgba(255,255,255,0.3)" }} onMouseEnter={handleNoHover} onClick={handleNoHover} onTouchStart={handleNoHover}>No</button>}
    </motion.div>
  );
}

export function FinalScene({ capturedImage }) {
  useEffect(() => {
    const end = Date.now() + 5000;
    const frame = () => {
      confetti({ particleCount:8, angle:60, spread:70, origin:{ x:0 }, colors:["#ec4899","#8b5cf6","#fbbf24"] });
      confetti({ particleCount:8, angle:120, spread:70, origin:{ x:1 }, colors:["#ec4899","#8b5cf6","#fbbf24"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);
  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div className="balloon" style={{ left:"10%", animationDelay:"0s", background:"#ec4899" }}></div>
      <div className="balloon" style={{ left:"80%", animationDelay:"2s", background:"#8b5cf6" }}></div>
      <div className="balloon" style={{ left:"25%", animationDelay:"4s", background:"#fbbf24" }}></div>
      <div className="balloon" style={{ left:"70%", animationDelay:"1s", background:"#ec4899" }}></div>
      <motion.div initial={{ y:100, rotate:-5, opacity:0 }} animate={{ y:0, rotate:0, opacity:1 }} transition={{ type:"spring", damping:15, delay:0.5 }} style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:10 }}>
        {capturedImage && (
          <div className="polaroid" style={{ transform:"rotate(3deg)", marginBottom:"3rem" }}>
            <img src={capturedImage} alt="Memory" style={{ width:"100%", maxWidth:"350px" }} />
            <p style={{ color:"#333", marginTop:"10px", fontFamily:"'Kalam',cursive" }}>Beautiful Memory</p>
          </div>
        )}
        <motion.h1 className="title-gold" animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }} style={{ fontSize:"4rem", textShadow:"0 5px 15px rgba(251,191,36,0.4)" }}>Happy Birthday Akansha!</motion.h1>
      </motion.div>
    </motion.div>
  );
}

const LETTER_SEGS = {
  A: [[0,10],[2,0],[4,10],[1,6],[3,6]],
  K: [[0,0],[0,10],[0,5],[3,0],[0,5],[3,10]],
  N: [[0,10],[0,0],[3,10],[3,0]],
  S: [[3,0],[0,0],[0,5],[3,5],[3,10],[0,10]],
  H: [[0,0],[0,10],[0,5],[3,5],[3,0],[3,10]],
};

export function ConstellationScene({ onNext }) {
  const canvasRef = useRef(null);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const bgStars = Array.from({ length: 250 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.5+0.3, alpha: Math.random(),
      speed: Math.random()*0.006+0.002,
    }));

    const name = "AKANSHA";
    const scale = 30;
    let allStars = [], allConnections = [];
    let xOff = 0;
    name.split("").forEach((ch, li) => {
      const pts = LETTER_SEGS[ch] || LETTER_SEGS["A"];
      const ls = pts.map(([px,py], si) => ({ id:`${li}-${si}`, x:(xOff+px)*scale, y:py*scale }));
      for (let i=0; i<pts.length-1; i++) allConnections.push([`${li}-${i}`, `${li}-${i+1}`]);
      xOff += 5;
      allStars.push(...ls);
    });

    const minX = Math.min(...allStars.map(s=>s.x));
    const maxX = Math.max(...allStars.map(s=>s.x));
    const minY = Math.min(...allStars.map(s=>s.y));
    const maxY = Math.max(...allStars.map(s=>s.y));
    const offX = (W-(maxX-minX))/2 - minX;
    const offY = (H-(maxY-minY))/2 - minY;
    const cStars = allStars.map(s => ({ ...s, x:s.x+offX, y:s.y+offY }));
    const starMap = Object.fromEntries(cStars.map(s=>[s.id,s]));

    let phaseLocal = "stars";
    let connPhaseStart = null;
    let msgShown = false;

    const connectTimer = setTimeout(() => {
      phaseLocal = "connecting";
      connPhaseStart = performance.now();
    }, 2500);

    let raf;
    const draw = (ts) => {
      ctx.clearRect(0,0,W,H);
      bgStars.forEach(s => {
        s.alpha += s.speed*(Math.random()>0.5?1:-1);
        s.alpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
      });

      if (phaseLocal === "connecting" && connPhaseStart) {
        const elapsed = ts - connPhaseStart;
        const show = Math.min(Math.floor(elapsed/75), allConnections.length);
        for (let i=0; i<show; i++) {
          const [aId,bId] = allConnections[i];
          const a=starMap[aId], b=starMap[bId];
          if (!a||!b) continue;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle="rgba(251,191,36,0.65)"; ctx.lineWidth=1.8; ctx.stroke();
        }
        if (show < allConnections.length) {
          const prog = (elapsed%75)/75;
          const [aId,bId] = allConnections[show];
          const a=starMap[aId], b=starMap[bId];
          if (a&&b) {
            ctx.beginPath(); ctx.moveTo(a.x,a.y);
            ctx.lineTo(a.x+(b.x-a.x)*prog, a.y+(b.y-a.y)*prog);
            ctx.strokeStyle="rgba(251,191,36,0.95)"; ctx.lineWidth=2.5; ctx.stroke();
          }
        }
        if (show >= allConnections.length && !msgShown) { msgShown=true; setShowMsg(true); }
      }

      cStars.forEach(s => {
        const grd = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,10);
        grd.addColorStop(0,"rgba(255,240,160,1)");
        grd.addColorStop(0.4,"rgba(251,191,36,0.6)");
        grd.addColorStop(1,"rgba(251,191,36,0)");
        ctx.beginPath(); ctx.arc(s.x,s.y,10,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(s.x,s.y,3,0,Math.PI*2); ctx.fillStyle="white"; ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { clearTimeout(connectTimer); cancelAnimationFrame(raf); };
  }, []);

  return (
    <motion.div className="constellation-scene" {...fadeIn}>
      <canvas className="constellation-canvas" ref={canvasRef} />
      <AnimatePresence>
        {showMsg && (
          <motion.div className="constellation-message"
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:1.2, type:"spring" }}>
            <h1>Happy Birthday, Akansha!</h1>
            <p>Even the stars know your name</p>
            <motion.button className="btn-primary" style={{ marginTop:"2rem", pointerEvents:"auto" }}
              onClick={onNext} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}>
              Continue to your surprise
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {!showMsg && (
        <motion.div className="constellation-message"
          animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:2, repeat:Infinity }}>
          <p style={{ fontSize:"1rem" }}>Watch the stars connect...</p>
        </motion.div>
      )}
    </motion.div>
  );
}


export function Welcome({ onNext }) {
  return (
    <motion.div className="scene-container glass-panel" {...fadeIn} style={{ maxWidth:"780px", padding:"5rem 6rem" }}>
      <motion.div style={{ textAlign:"center" }}>
        {/* Floating sparkle */}
        <motion.div
          animate={{ y:[-10,10,-10], rotate:[0,15,-15,0] }}
          transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
          style={{ fontSize:"3rem", marginBottom:"1.5rem", display:"block" }}
        >✨</motion.div>

        <motion.h1
          animate={{ backgroundPosition:["0% 50%","100% 50%","0% 50%"] }}
          transition={{ duration:4, repeat:Infinity, ease:"linear" }}
          style={{ fontSize:"4.5rem", marginBottom:"1rem" }}
        >
          Hey Akansha...
        </motion.h1>

        <motion.p
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.6 }}
          style={{ fontSize:"1.4rem", color:"rgba(255,255,255,0.85)", lineHeight:"1.8", marginBottom:"2.5rem", maxWidth:"480px", margin:"0 auto 2.5rem" }}
        >
          Something special is waiting for you. 💌<br />Turn up the volume, sit back, and press the button below.
        </motion.p>

        <motion.button
          className="btn-primary"
          onClick={onNext}
          style={{ fontSize:"1.3rem", padding:"1.2rem 4rem" }}
          whileHover={{ scale:1.08 }}
          whileTap={{ scale:0.96 }}
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:1.0 }}
        >
          I'm Ready 🎉
        </motion.button>

        <motion.p
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:2 }}
          style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", marginTop:"2rem", marginBottom:0 }}
        >
          Made with ❤️ just for you
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

