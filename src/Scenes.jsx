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
            <motion.img 
              src={blown ? "/assets/cake_unlit.jpg" : "/assets/cake.jpg"} 
              alt="Cake" 
              style={{ 
                width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%", 
                border:"4px solid rgba(255,255,255,0.1)", 
                transition: "all 0.5s ease" 
              }} 
            />
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
  const fullText = `Hey Shorty,\n\nHappy Birthday! 🎉 I just wanted to take a moment to tell you how awesome it is to have you as a friend. You bring so much fun and chaos into everyone's life, and honestly, we wouldn't survive without it.\n\nI wish you a year filled with crazy adventures, non-stop laughter, and all the great things you deserve. Keep being your incredible, dramatic self!\n\nIss garib insaan ki party mat bhulna 2 din se kuch khaya nhi hai ki tu khilayegi 😂`;
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
                  style={{ position:"absolute", top:"-40px", width:"100%", textAlign:"center", color:"#fff", fontSize:"1.2rem", fontWeight:"bold", textShadow:"0 2px 4px rgba(0,0,0,0.4)" }}
                  animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
                >
                  Open Me
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
            <h3>Dear Akansha,</h3>
            <p style={{ whiteSpace:"pre-line" }}>
              {typedText}{typedText.length < fullText.length && <span className="cursor-blink">|</span>}
            </p>
            {typedText.length >= fullText.length && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} style={{ marginTop:"2rem", textAlign:"right", width:"100%" }}>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:"1rem", color:"#555", marginBottom:0, fontWeight:"600", fontStyle:"italic" }}>Technical Head,</p>
                <p className="signature" style={{ fontSize:"1.6rem", color:"#333", marginTop:"0.2rem" }}>Vaibhav</p>
              </motion.div>
            )}
            {typedText.length >= fullText.length && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }} style={{ marginTop:"1.5rem", width:"100%", textAlign:"center" }}>
                <span onClick={onNext} style={{ cursor:"pointer", color:"#ec4899", fontWeight:"bold", borderBottom:"2px solid #ec4899", paddingBottom:"2px", fontSize:"1.2rem", fontFamily:"'Outfit',sans-serif" }}>
                  See the memories
                </span>
              </motion.div>
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
        <HTMLFlipBook
          width={430}
          height={580}
          size="fixed"
          minWidth={430}
          maxWidth={430}
          minHeight={580}
          maxHeight={580}
          showCover={true}
          usePortrait={false}
          flippingTime={800}
          className="book-container"
          style={{ boxShadow:"0 30px 70px rgba(0,0,0,0.7)" }}
        >
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
    <motion.div className="scene-container glass-panel" style={{ position:"relative", width:"100%", minHeight:"400px", maxWidth:"600px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }} {...fadeIn}>
      <h2 style={{ marginBottom:"3rem", textAlign:"center", zIndex:10 }}>Party toh deni padegi</h2>
      <div style={{ display:"flex", gap:"2rem", alignItems:"center" }}>
        <motion.button className="btn-primary" onClick={handleYes} animate={{ scale:1+noCount*0.2 }}>Yes</motion.button>
        {noCount < 3 && <button className="btn-primary evasive-btn" style={{ position: noCount === 0 ? "relative" : "absolute", top: noCount > 0 ? noPos.top : "auto", left: noCount > 0 ? noPos.left : "auto", transform: noCount > 0 ? "translate(-50%,-50%)" : "none", background:"rgba(255,255,255,0.1)", boxShadow:"none", border:"1px solid rgba(255,255,255,0.3)" }} onMouseEnter={handleNoHover} onClick={handleNoHover} onTouchStart={handleNoHover}>No</button>}
      </div>
    </motion.div>
  );
}

export function FinalScene({ capturedImage, onNext }) {
  useEffect(() => {
    const end = Date.now() + 6000;
    const frame = () => {
      confetti({ particleCount:8, angle:60, spread:70, origin:{ x:0 }, colors:["#ec4899","#8b5cf6","#fbbf24"] });
      confetti({ particleCount:8, angle:120, spread:70, origin:{ x:1 }, colors:["#ec4899","#8b5cf6","#fbbf24"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);
  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div className="balloon" style={{ left:"8%",  animationDelay:"0s",  background:"#ec4899" }}></div>
      <div className="balloon" style={{ left:"82%", animationDelay:"2s",  background:"#8b5cf6" }}></div>
      <div className="balloon" style={{ left:"22%", animationDelay:"4s",  background:"#fbbf24" }}></div>
      <div className="balloon" style={{ left:"72%", animationDelay:"1s",  background:"#ec4899" }}></div>
      <div className="balloon" style={{ left:"50%", animationDelay:"3s",  background:"#8b5cf6" }}></div>

      <motion.div
        initial={{ y:100, rotate:-5, opacity:0 }}
        animate={{ y:0, rotate:0, opacity:1 }}
        transition={{ type:"spring", damping:15, delay:0.5 }}
        style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:10, textAlign:"center" }}
      >
        {capturedImage && (
          <div className="polaroid" style={{ transform:"rotate(3deg)", marginBottom:"2.5rem" }}>
            <img src={capturedImage} alt="Memory" style={{ width:"100%", maxWidth:"300px" }} />
            <p style={{ color:"#333", marginTop:"10px", fontFamily:"'Kalam',cursive" }}>Beautiful Memory 📸</p>
          </div>
        )}

        <motion.h1
          className="title-gold"
          animate={{ scale:[1,1.06,1] }}
          transition={{ duration:2.5, repeat:Infinity }}
          style={{ fontSize:"4.5rem", textShadow:"0 5px 20px rgba(251,191,36,0.5)" }}
        >
          Happy Birthday Akansha! 🎂
        </motion.h1>

        <motion.p
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:1.5 }}
          style={{ fontSize:"1.3rem", color:"rgba(255,255,255,0.8)", marginTop:"0.5rem" }}
        >
          Wishing you a year as magical as you are ✨
        </motion.p>

        {/* Button to go to constellation finale */}
        <motion.button
          className="btn-primary"
          onClick={onNext}
          initial={{ opacity:0, scale:0.8 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ delay:3, type:"spring" }}
          style={{ marginTop:"2.5rem", fontSize:"1.2rem", padding:"1.1rem 3rem" }}
          whileHover={{ scale:1.08 }}
        >
          ✨ One Last Magic Moment
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function ConstellationScene({ onNext }) {
  const canvasRef = useRef(null);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf;
    let cancel = false;

    // Ensure the cursive font is loaded before sampling
    document.fonts.ready.then(() => {
      if (cancel) return;

      // ── Offscreen Canvas for Text Sampling ──
      const offCanvas = document.createElement('canvas');
      offCanvas.width = W; offCanvas.height = H;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      offCtx.font = "italic 160px 'Dancing Script', cursive";
      offCtx.fillStyle = "white";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText("Akansha", W/2, H/2 - 40);

      // Sample pixels to find star targets
      const imgData = offCtx.getImageData(0, 0, W, H).data;
      const rawStars = [];
      for (let y = 0; y < H; y += 7) {
        for (let x = 0; x < W; x += 7) {
          const i = (y * W + x) * 4;
          if (imgData[i+3] > 128) {
            // Add a little randomness so they don't look like a strict grid
            rawStars.push({ tx: x + (Math.random()*4-2), ty: y + (Math.random()*4-2) });
          }
        }
      }

      // ── 1. Twinkling background stars ──
      const bgStars = Array.from({ length: 300 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.6 + 0.2,
        alpha: Math.random(),
        dAlpha: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      }));

      // ── 2. Background Meteor Shower ──
      const bgMeteors = [];
      const addBgMeteor = () => {
        bgMeteors.push({
          x: Math.random() * W * 1.5,
          y: -100,
          len: 100 + Math.random() * 200,
          speed: 15 + Math.random() * 15,
          angle: Math.PI / 4 + (Math.random()*0.1-0.05), // roughly 45 degrees
        });
      };

      // ── 3. Shooting stars for the name ──
      // Sort points roughly left to right so they land nicely
      rawStars.sort((a,b) => a.tx - b.tx);
      const shooters = rawStars.map((s, i) => {
        const edge = Math.floor(Math.random() * 4);
        let sx, sy;
        if (edge === 0) { sx = Math.random() * W; sy = -100; }
        else if (edge === 1) { sx = W + 100; sy = Math.random() * H; }
        else if (edge === 2) { sx = Math.random() * W; sy = H + 100; }
        else { sx = -100; sy = Math.random() * H; }
        return {
          sx, sy, tx: s.tx, ty: s.ty,
          cx: sx, cy: sy,
          trail: [],
          delay: i * 15 + Math.random() * 500, // Left-to-right sweep timing
          duration: 1000 + Math.random() * 400,
          landed: false,
          startTime: null,
        };
      });

      let allLanded = false;
      let drawPhaseStart = null;
      let msgShown = false;
      let startTime = null;

      // Offscreen canvas for glowing text reveal
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = W; glowCanvas.height = H;
      const glowCtx = glowCanvas.getContext('2d');
      glowCtx.font = "italic 160px 'Dancing Script', cursive";
      glowCtx.textAlign = "center";
      glowCtx.textBaseline = "middle";
      glowCtx.shadowColor = "#fbbf24";
      glowCtx.shadowBlur = 20;
      glowCtx.fillStyle = "#fff9c4";
      glowCtx.fillText("Akansha", W/2, H/2 - 40);
      glowCtx.shadowBlur = 40;
      glowCtx.fillText("Akansha", W/2, H/2 - 40);

      const draw = (ts) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;

        ctx.clearRect(0, 0, W, H);

        // Draw Twinkling BG
        bgStars.forEach(s => {
          s.alpha += s.dAlpha;
          if (s.alpha > 1 || s.alpha < 0.05) s.dAlpha *= -1;
          s.alpha = Math.max(0.05, Math.min(1, s.alpha));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
          ctx.fill();
        });

        // Draw BG Meteors
        if (Math.random() < 0.03) addBgMeteor();
        for (let i = bgMeteors.length - 1; i >= 0; i--) {
          const m = bgMeteors[i];
          m.x -= m.speed * Math.cos(m.angle);
          m.y += m.speed * Math.sin(m.angle);
          const g = ctx.createLinearGradient(m.x, m.y, m.x + m.len * Math.cos(m.angle), m.y - m.len * Math.sin(m.angle));
          g.addColorStop(0, 'rgba(255,255,255,1)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.len * Math.cos(m.angle), m.y - m.len * Math.sin(m.angle));
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          if (m.y > H + m.len || m.x < -m.len) bgMeteors.splice(i, 1);
        }

        let landedCount = 0;
        shooters.forEach(s => {
          if (elapsed < s.delay) return;
          if (s.landed) { landedCount++; return; }
          if (!s.startTime) s.startTime = ts;

          const t = Math.min((ts - s.startTime) / s.duration, 1);
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          s.cx = s.sx + (s.tx - s.sx) * ease;
          s.cy = s.sy + (s.ty - s.sy) * ease;

          s.trail.push({ x: s.cx, y: s.cy });
          if (s.trail.length > 15) s.trail.shift();

          // Draw trail
          for (let i = 1; i < s.trail.length; i++) {
            const alpha = (i / s.trail.length) * 0.8;
            ctx.beginPath();
            ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
            ctx.lineTo(s.trail[i].x, s.trail[i].y);
            ctx.strokeStyle = `rgba(255,230,100,${alpha})`;
            ctx.lineWidth = (i / s.trail.length) * 3;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          // Head glow
          ctx.beginPath();
          ctx.arc(s.cx, s.cy, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (t >= 1) { s.landed = true; s.cx = s.tx; s.cy = s.ty; s.trail = []; }
        });

        if (landedCount >= shooters.length && !allLanded) {
          allLanded = true;
          drawPhaseStart = ts;
        }

        // Draw landed stars
        shooters.forEach(s => {
          if (!s.landed && elapsed < s.delay) return;
          ctx.beginPath();
          ctx.arc(s.tx, s.ty, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Cursive wipe reveal
        if (allLanded && drawPhaseStart) {
          const cElapsed = ts - drawPhaseStart;
          // Wipe from left to right over 3 seconds
          const prog = Math.min(cElapsed / 3000, 1);
          const revealW = W * prog;
          
          ctx.drawImage(glowCanvas, 0, 0, revealW, H, 0, 0, revealW, H);

          if (prog >= 1 && !msgShown) {
            msgShown = true;
            setShowMsg(true);
          }
        }

        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    });

    return () => { cancel = true; cancelAnimationFrame(raf); };
  }, []);

  return (
    <motion.div className="constellation-scene" {...fadeIn}>
      <canvas className="constellation-canvas" ref={canvasRef} />
      {/* Let the name shine on its own */}
      {!showMsg && (
        <motion.div
          className="constellation-message"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <p style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>A sky full of stars, just for you...</p>
        </motion.div>
      )}
    </motion.div>
  );
}


export function Welcome({ onNext }) {
  return (
    <motion.div className="scene-container glass-panel" {...fadeIn} style={{ maxWidth:"780px", padding:"5rem 6rem" }}>
      <motion.div style={{ textAlign:"center" }}>

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
          Something special is waiting for you.<br />Turn up the volume, sit back, and press the button below.
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
          I'm Ready
        </motion.button>

        <motion.p
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:2 }}
          style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", marginTop:"2rem", marginBottom:0 }}
        >
          Made just for you
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

