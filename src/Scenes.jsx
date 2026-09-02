import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Camera, PartyPopper, Heart, Sparkles, Star, Cake, Gift } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

export function Welcome({ onNext }) {
  return (
    <motion.div className="scene-container glass-panel" {...fadeIn}>
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <h1 style={{ fontSize: '3.5rem' }}>Hey Akansha...</h1>
        <p style={{ fontSize: '1.4rem' }}>Turn up your volume, get comfortable, and tap the button when you're ready. 🤫💖</p>
        <button className="btn-primary" onClick={onNext} style={{ marginTop: '1rem' }}>I'm Ready</button>
      </motion.div>
    </motion.div>
  );
}

function ScratchCard({ children, onRevealed }) {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 350;
    canvas.height = 350;
    
    // Fill with frost layer
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Outfit';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to Reveal!', canvas.width / 2, canvas.height / 2);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 40;
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const handlePointerDown = () => { isDrawing.current = true; };
  const handlePointerUp = () => { isDrawing.current = false; checkReveal(); };
  
  const handlePointerMove = (e) => {
    if (!isDrawing.current || isRevealed) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 10) transparentCount++;
    }
    const percent = transparentCount / (pixels.length / 4);
    if (percent > 0.4 && !isRevealed) {
      setIsRevealed(true);
      onRevealed();
    }
  };

  return (
    <div style={{ position: 'relative', width: '350px', height: '350px', borderRadius: '50%', overflow: 'hidden' }}>
      {children}
      <AnimatePresence>
        {!isRevealed && (
          <motion.canvas
            ref={canvasRef}
            className="scratch-overlay"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onTouchMove={handlePointerMove}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          />
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
  
  const startBlow = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (attempt === 0) {
        setAttempt(1);
        setCountdown(null);
      } else if (attempt === 1) {
        setBlown(true);
        setAttempt(2);
        setCountdown(null);
        const audio = new Audio('/assets/song.mp3');
        audio.loop = true;
        audio.play().catch(e => console.log("Audio play blocked", e));
        setTimeout(onNext, 6000); 
      }
    }
  }, [countdown, attempt, onNext]);

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div style={{ marginBottom: '3rem' }}>
        <ScratchCard onRevealed={() => setIsRevealed(true)}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <motion.img 
              src="/assets/cake.jpg" 
              alt="Cake" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)' }}
            />
            <div className="flame-wrapper">
               {!blown && <div className="flame"></div>}
               {blown && <div className="smoke"></div>}
            </div>
          </div>
        </ScratchCard>
      </div>
      
      {isRevealed && countdown === null && attempt === 0 && (
        <motion.button className="btn-primary" onClick={startBlow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Make a Wish & Blow (3s)
        </motion.button>
      )}
      
      {countdown !== null && countdown > 0 && (
        <motion.h2 className="title-gold" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          Blowing in... {countdown}
        </motion.h2>
      )}

      {attempt === 1 && countdown === null && (
        <motion.div {...fadeIn}>
          <h2 style={{ color: '#fca5a5' }}>Jor se Phukk damm nhi hai kya 😂</h2>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startBlow}>Try Again</button>
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
  const isMobile = window.innerWidth < 600;

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => {
      setLetterOut(true);
    }, 800); 
  };

  // On mobile: letter appears below envelope (y-axis only)
  // On desktop: letter slides to the right
  const letterAnim = isMobile
    ? (!opened ? { y: 0, scale: 0.85, opacity: 0 } : !letterOut ? { y: -120, scale: 0.85, opacity: 1 } : { y: 0, x: 0, scale: 1, opacity: 1, zIndex: 20 })
    : (!opened ? { y: 0, scale: 0.8, opacity: 0 } : !letterOut ? { y: -150, scale: 0.8, opacity: 1, zIndex: 5 } : { y: -30, x: 120, scale: 1.1, opacity: 1, zIndex: 20 });

  const envelopeAnim = isMobile
    ? (letterOut ? { y: 80, scale: 0.7, opacity: 0.3 } : { y: 0, scale: 1, rotate: 0 })
    : (letterOut ? { x: -180, scale: 0.8, rotate: -5, opacity: 0.4 } : { x: 0, scale: 1, rotate: 0 });

  return (
    <motion.div className="scene-container" {...fadeIn} style={{ overflowY: 'auto', maxHeight: '100vh', padding: '1rem' }}>
      <h2 className="title-gold" style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: 'clamp(1.2rem,5vw,2rem)' }}>You've got mail! 💌</h2>
      <div className="envelope-scene-layout">
        
        {/* Envelope */}
        <motion.div 
          className="envelope-wrapper-2"
          onClick={handleOpen}
          animate={envelopeAnim}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ position: 'relative', zIndex: letterOut ? 1 : 10, flexShrink: 0 }}
        >
          <div className="envelope">
            <div className="envelope-front"></div>
            <div className={`envelope-lining ${opened ? 'visible' : ''}`}></div>
            <div className="envelope-stamp">
              <span style={{ fontSize: '1.1rem' }}>🦉</span>
              <span style={{ fontSize: '0.6rem' }}>⚡</span>
              <span className="stamp-label">HOGWARTS</span>
              <span className="stamp-label" style={{ fontSize: '0.38rem', letterSpacing: '0.02em' }}>OWL POST</span>
            </div>
            <div className="envelope-postmark">
              <span>Sent With</span><span>Love ♡</span>
            </div>
            <div className="envelope-address">
              <span className="to-label">To:</span>
              <span className="to-name">Akansha 💕</span>
            </div>
            <div className={`envelope-flap ${opened ? 'open' : ''}`}>
               {!opened && <div style={{ position: 'absolute', top: '-60px', left: '-50px', width: '100px', textAlign: 'center', color: '#fff', fontSize: '1.2rem' }}>Open Me</div>}
            </div>
          </div>
        </motion.div>

        {/* Letter */}
        <motion.div 
          className="letter"
          animate={letterAnim}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ position: isMobile ? 'relative' : 'absolute', pointerEvents: letterOut ? 'auto' : 'none', marginTop: isMobile && letterOut ? '1rem' : 0 }}
        >
          <h2 style={{ color: '#ec4899', fontSize: '1.8rem', marginBottom: '1rem' }}>Happy Birthday Akansha!</h2>
          <p style={{ color: '#555', textAlign: 'left', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '1rem' }}>
            There are some people in life that just make the world a little brighter just by being in it, and you are absolutely one of them.
          </p>
          <p style={{ color: '#555', textAlign: 'left', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Wishing you the happiest of birthdays today! May this coming year bring you all the love, success, and endless laughter that you bring to everyone around you. Keep shining and never stop being the incredibly amazing person you are. 
          </p>
          <p style={{ color: '#555', textAlign: 'left', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Enjoy your day to the absolute fullest!
          </p>
          <p style={{ color: '#555', textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem', width: '100%' }}>With lots of love,</p>
          <p className="signature" style={{ width: '100%', textAlign: 'right' }}>Your Friend</p>
          
          {letterOut && (
            <button className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', fontSize: '1rem', flexShrink: 0 }} onClick={onNext}>
              Thanks A Lot
            </button>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}

const Page = forwardRef((props, ref) => {
  return (
    <div className="book-page" ref={ref} data-density={props.density || 'hard'} style={{ position: 'relative' }}>
      {props.children}
    </div>
  );
});

export function MemoryBookScene({ onNext }) {
  const memories = [
    { img: "/assets/memory1.jpg",  caption: "The day my world got a little brighter ✨",         icon: Sparkles, iconProps: { top: '5%', right: '8%', color: '#ec4899', size: 30 },   washi: 'washi-pink',    washiPos: { top: '-8px', left: '18%' }, bubble: "omg look at her!! 🥹",            sticker: '✨', stickerPos: { bottom: '6%', right: '5%' } },
    { img: "/assets/memory2.jpg",  caption: "That smile I could look at forever ❤️",              icon: Heart,    iconProps: { bottom: '10%', right: '12%', color: '#ec4899', size: 35 }, washi: 'washi-lavender', washiPos: { top: '-8px', left: '28%' }, bubble: "favorite person 💖",             sticker: '💕', stickerPos: { bottom: '10%', left: '5%' } },
    { img: "/assets/memory3.jpg",  caption: "Effortlessly gorgeous, inside and out 🌸",          icon: Star,     iconProps: { top: '12%', left: '6%', color: '#fbbf24', size: 28 },    washi: 'washi-mint',    washiPos: { top: '-8px', left: '22%' }, bubble: "she's literally glowing!",        sticker: '🌸', stickerPos: { bottom: '8%', right: '5%' } },
    { img: "/assets/memory4.jpg",  caption: "You are the main character of my life 🌟",           icon: Sparkles, iconProps: { bottom: '8%', left: '8%', color: '#8b5cf6', size: 32 },  washi: 'washi-yellow',  washiPos: { top: '-8px', left: '20%' }, bubble: "main character energy ⭐",         sticker: '👑', stickerPos: { bottom: '8%', right: '6%' } },
    { img: "/assets/memory5.jpg",  caption: "A moment I'll keep in my heart always 💖",          icon: Heart,    iconProps: { top: '8%', right: '10%', color: '#ec4899', size: 28 },   washi: 'washi-stars',   washiPos: { top: '-8px', left: '30%' }, bubble: "this moment 🥺💕",               sticker: '💗', stickerPos: { bottom: '10%', right: '5%' } },
    { img: "/assets/memory6.jpg",  caption: "Looking at you feels like magic ✨",                 icon: Sparkles, iconProps: { bottom: '12%', left: '8%', color: '#fbbf24', size: 26 }, washi: 'washi-pink',    washiPos: { top: '-8px', left: '22%' }, bubble: "pure magic ✨",                   sticker: '🌟', stickerPos: { bottom: '8%', left: '6%' } },
    { img: "/assets/memory7.jpg",  caption: "The best part of every single day 🥰",               icon: Star,     iconProps: { top: '8%', left: '12%', color: '#8b5cf6', size: 30 },   washi: 'washi-lavender', washiPos: { top: '-8px', left: '26%' }, bubble: "best day ever 🥰",               sticker: '💜', stickerPos: { bottom: '10%', right: '6%' } },
    { img: "/assets/memory8.jpg",  caption: "Just you being your absolute radiant self 💫",       icon: Heart,    iconProps: { bottom: '8%', right: '8%', color: '#ec4899', size: 28 },  washi: 'washi-mint',    washiPos: { top: '-8px', left: '20%' }, bubble: "radiant as always 💫",           sticker: '✨', stickerPos: { bottom: '8%', left: '5%' } },
    { img: "/assets/memory9.jpg",  caption: "God really took His time with you ✨",               icon: Sparkles, iconProps: { top: '6%', right: '8%', color: '#fbbf24', size: 28 },   washi: 'washi-yellow',  washiPos: { top: '-8px', left: '24%' }, bubble: "a literal masterpiece 🎨",       sticker: '🌸', stickerPos: { bottom: '8%', right: '6%' } },
    { img: "/assets/memory10.jpg", caption: "You make everything feel so special 🌸",             icon: Star,     iconProps: { bottom: '10%', right: '12%', color: '#8b5cf6', size: 32 }, washi: 'washi-stars',   washiPos: { top: '-8px', left: '22%' }, bubble: "she just makes it special 🌸",    sticker: '💫', stickerPos: { bottom: '8%', left: '6%' } },
    { img: "/assets/memory11.jpg", caption: "My favorite person in the entire universe ❤️",        icon: Heart,    iconProps: { top: '8%', left: '5%', color: '#ec4899', size: 36 },    washi: 'washi-pink',    washiPos: { top: '-8px', left: '28%' }, bubble: "my absolute fav person 💝",      sticker: '❤️', stickerPos: { bottom: '10%', right: '6%' } },
    { img: "/assets/memory12.jpg", caption: "You glow differently, you know that? ✨",             icon: Sparkles, iconProps: { bottom: '12%', right: '8%', color: '#fbbf24', size: 26 }, washi: 'washi-mint',    washiPos: { top: '-8px', left: '24%' }, bubble: "she just glows different!!",     sticker: '⭐', stickerPos: { bottom: '8%', left: '5%' } },
    { img: "/assets/memory13.jpg", caption: "The reason behind all my happy vibes 😊",             icon: Star,     iconProps: { top: '12%', left: '12%', color: '#8b5cf6', size: 28 },  washi: 'washi-lavender', washiPos: { top: '-8px', left: '26%' }, bubble: "always spreading joy 😊",        sticker: '🎀', stickerPos: { bottom: '8%', right: '5%' } },
    { img: "/assets/memory14.jpg", caption: "I never want to forget this moment 💖",               icon: Heart,    iconProps: { bottom: '8%', left: '6%', color: '#ec4899', size: 30 },  washi: 'washi-yellow',  washiPos: { top: '-8px', left: '30%' }, bubble: "saving this forever 📸",         sticker: '💖', stickerPos: { bottom: '8%', right: '6%' } },
    { img: "/assets/memory15.jpg", caption: "An absolute queen, today and always 👑",              icon: Gift,     iconProps: { top: '8%', right: '8%', color: '#fbbf24', size: 32 },   washi: 'washi-stars',   washiPos: { top: '-8px', left: '22%' }, bubble: "the queen has arrived 👑",       sticker: '👑', stickerPos: { bottom: '10%', left: '5%' } },
    { img: "/assets/memory16.jpg", caption: "Stunning beyond words! 💫",                           icon: Sparkles, iconProps: { bottom: '12%', left: '12%', color: '#8b5cf6', size: 34 }, washi: 'washi-pink',    washiPos: { top: '-8px', left: '28%' }, bubble: "no words needed 💫",             sticker: '✨', stickerPos: { bottom: '8%', right: '6%' } },
    { img: "/assets/memory17.jpg", caption: "Here's to you, the best thing ever ❤️",              icon: Heart,    iconProps: { top: '5%', right: '5%', color: '#ec4899', size: 40 },   washi: 'washi-mint',    washiPos: { top: '-8px', left: '24%' }, bubble: "cheers to you! 🥂",             sticker: '💝', stickerPos: { bottom: '8%', left: '5%' } },
    { img: "/assets/memory18.jpg", caption: "Too gorgeous to handle 🔥",                           icon: Star,     iconProps: { top: '8%', left: '8%', color: '#fbbf24', size: 32 },    washi: 'washi-yellow',  washiPos: { top: '-8px', left: '26%' }, bubble: "literally too gorgeous 😍",     sticker: '🔥', stickerPos: { bottom: '8%', right: '5%' } },
    { img: "/assets/memory19.jpg", caption: "An actual angel ✨",                                   icon: Sparkles, iconProps: { bottom: '8%', right: '12%', color: '#ec4899', size: 30 }, washi: 'washi-lavender', washiPos: { top: '-8px', left: '30%' }, bubble: "sent from heaven 👼",           sticker: '😇', stickerPos: { bottom: '8%', left: '6%' } }
  ];

  const vw = Math.min(window.innerWidth, 500);
  const bookW = Math.max(Math.floor(vw * 0.44), 150);
  const bookH = Math.floor(bookW * 1.42);
  const isMobile = window.innerWidth < 600;

  return (
    <motion.div className="scene-container" {...fadeIn} style={{ overflowY: 'auto', maxHeight: '100vh', paddingBottom: '2rem' }}>
      <h2 className="title-gold" style={{ marginBottom: '1rem', fontSize: 'clamp(1rem,5vw,1.8rem)', textAlign: 'center' }}>Flip the pages</h2>
      <HTMLFlipBook 
        width={bookW}
        height={bookH}
        size="fixed"
        showCover={true}
        mobileScrollSupport={true}
        className="book-container"
        style={{ touchAction: 'pan-y' }}
        useMouseEvents={!isMobile}
      >
        {/* Cover */}
        <Page density="hard">
           <div className="book-cover" style={{ width: '100%', height: '100%', position: 'relative' }}>
             <div className="cover-frame">
               <div className="cover-content">
                 <h1 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Akansha's</h1>
                 <h2 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Memories</h2>
                 <Heart size={56} color="#ec4899" style={{ marginTop: '1rem', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' }} />
                 <p style={{ marginTop: 'auto', fontSize: '0.9rem', opacity: 0.9, textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>Drag to open</p>
               </div>
             </div>
           </div>
        </Page>
        
        {/* Dynamic Pages */}
        {memories.map((mem, index) => {
          const Icon1 = mem.icon;
          const rotate = index % 2 === 0 ? 2 : -2;
          const arrowDir = index % 2 === 0 ? 1 : -1;
          return (
            <Page key={index}>
              {/* Themed doodle icon */}
              <Icon1 className="doodle" style={{ ...mem.iconProps, position: 'absolute' }} size={mem.iconProps.size} />

              {/* Washi tape strip */}
              <div className={`washi-tape ${mem.washi}`} style={{ position: 'absolute', ...mem.washiPos }} />

              {/* Handwritten SVG arrow pointing at photo */}
              <svg style={{ position: 'absolute', top: '22%', left: arrowDir > 0 ? '5%' : '75%', opacity: 0.5, transform: arrowDir > 0 ? 'scaleX(1)' : 'scaleX(-1)' }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M5 35 Q15 10 35 5" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M30 2 L35 5 L31 9" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>

              {/* Speech bubble callout */}
              <div className="speech-bubble" style={{ position: 'absolute', top: '10%', left: arrowDir > 0 ? '5%' : 'auto', right: arrowDir < 0 ? '5%' : 'auto' }}>
                {mem.bubble}
              </div>

              {/* Sticker badge */}
              <div className="sticker-badge" style={{ position: 'absolute', fontSize: '1.4rem', ...mem.stickerPos, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                {mem.sticker}
              </div>

              {/* Photo polaroid */}
              <motion.div 
                className="polaroid" 
                style={{ marginTop: '1.5rem', position: 'relative', zIndex: 1 }}
                initial={{ rotate: rotate }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src={mem.img} alt={`Memory ${index + 1}`} style={{ height: '260px', objectFit: 'cover', objectPosition: 'top center' }} />
                <p style={{ color: '#333', marginTop: '8px', fontFamily: "'Dancing Script', cursive", fontSize: '1rem', textAlign: 'center' }}>{mem.caption}</p>
              </motion.div>
            </Page>
          );
        })}

        {/* Back Cover */}
        <Page density="hard">
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#1e1b4b,#4c1d95)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', padding: '2rem', boxSizing: 'border-box' }}>
            <div style={{ border: '2px double #fbbf24', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              <Heart size={40} color="#ec4899" style={{ marginBottom: '0.8rem' }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#fbbf24', marginBottom: '0.8rem' }}>The End…</h2>
              <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>But just the beginning of another beautiful year with you 🌸</p>
              <p style={{ marginTop: '1rem', fontFamily: "'Dancing Script', cursive", fontSize: '1.3rem', color: '#ec4899' }}>Happy Birthday Akansha ❤️</p>
            </div>
            <button className="btn-primary" style={{ marginTop: '1rem', fontSize: '0.9rem' }} onClick={onNext}>Let's celebrate! 🎉</button>
          </div>
        </Page>

        {/* Camera prompt */}
        <Page density="hard">
          <Star className="doodle" style={{ top: '15%', right: '15%', color: '#fbbf24', transform: 'rotate(20deg)' }} size={36} />
          
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Camera size={64} style={{ margin: '0 auto 2rem', color: '#8b5cf6' }} />
            <h2 style={{ color: '#333', textAlign: 'center', fontSize: '1.8rem' }}>Let's take a memory picture</h2>
            <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={onNext}>Open Camera</button>
          </div>
        </Page>
      </HTMLFlipBook>
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
    async function setupCamera() {
      try {
        const str = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(str);
        if (videoRef.current) {
          videoRef.current.srcObject = str;
        }
      } catch (err) {
        console.error("Error accessing camera", err);
        setError("Camera access denied or unavailable.");
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      
      setImgData(dataUrl);
      setCapturedImage(dataUrl);
      setHasCaptured(true);
      if (stream) stream.getTracks().forEach(track => track.stop());

      // Let the polaroid print animation play, then move on
      setTimeout(() => onNext(), 3500);
    }
  };

  return (
    <motion.div className="scene-container" {...fadeIn} style={{ overflow: 'hidden' }}>
      <AnimatePresence>
        {!hasCaptured ? (
          <motion.div exit={{ opacity: 0, y: -50 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="title-gold">Smile! 📸</h2>
            {error ? (
              <div className="glass-panel" style={{ marginTop: '2rem' }}>
                <p>{error}</p>
                <button className="btn-ghost" style={{ padding: '0.8rem 1.5rem', borderRadius: '50px' }} onClick={() => { setCapturedImage("/assets/photo.jpg"); onNext(); }}>Skip / Use Placeholder</button>
              </div>
            ) : (
              <div className="polaroid" style={{ transform: 'none', margin: '2rem 0', paddingBottom: '20px' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '400px', borderRadius: '5px' }}></video>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>
            )}
            {!error && <button className="btn-primary" onClick={capture}>Capture Picture</button>}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}
          >
            <div className="polaroid" style={{ transform: 'rotate(-2deg)' }}>
              <img src={imgData} alt="Memory" style={{ width: '100%', maxWidth: '300px' }} />
              <p style={{ color: '#333', marginTop: '10px', fontFamily: "'Playfair Display', serif" }}>Perfect!</p>
            </div>
            <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#fbbf24' }}>Printing memory...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PartyQuestionScene({ onNext }) {
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState({ top: '50%', left: '60%' });
  const [yesClicked, setYesClicked] = useState(false);

  const handleNoHover = () => {
    if (noCount >= 3) return;
    setNoPos({
      top: `${Math.random() * 60 + 20}%`,
      left: `${Math.random() * 60 + 20}%`
    });
    setNoCount(noCount + 1);
  };

  const handleYes = () => {
    setYesClicked(true);
    setTimeout(onNext, 4500);
  };

  if (yesClicked) {
    return (
      <motion.div className="scene-container glass-panel" {...fadeIn}>
        <PartyPopper size={80} style={{ color: '#fbbf24', margin: '0 auto 1.5rem' }} />
        <h2>yay its party bas bill mujh par mat fadna</h2>
        <motion.p 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, type: 'spring', damping: 10 }}
          style={{ fontSize: '2.5rem', color: '#fbbf24', marginTop: '2rem', fontWeight: 'bold', fontFamily: "'Playfair Display', serif" }}
        >
          "Bohot pitega tu"
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div className="scene-container glass-panel" style={{ position: 'relative', width: '100%', height: '500px', maxWidth: '600px' }} {...fadeIn}>
      <h2 style={{ marginTop: '3rem' }}>Party toh deni padegi</h2>
      
      <motion.button 
        className="btn-primary" 
        onClick={handleYes}
        style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)' }}
        animate={{ scale: 1 + noCount * 0.3 }}
      >
        Yes
      </motion.button>

      {noCount < 3 && (
        <button 
          className="btn-primary evasive-btn" 
          style={{ 
            top: noPos.top, left: noPos.left, 
            transform: 'translate(-50%, -50%)', 
            background: 'rgba(255,255,255,0.1)', 
            boxShadow: 'none',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
          onMouseEnter={handleNoHover}
          onClick={handleNoHover}
          onTouchStart={handleNoHover}
        >
          No
        </button>
      )}
    </motion.div>
  );
}

export function FinalScene({ capturedImage }) {
  useEffect(() => {
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors: ['#ec4899', '#8b5cf6', '#fbbf24']
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors: ['#ec4899', '#8b5cf6', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <motion.div className="scene-container" {...fadeIn}>
      
      {/* Floating Balloons */}
      <div className="balloon" style={{ left: '10%', animationDelay: '0s', background: '#ec4899' }}></div>
      <div className="balloon" style={{ left: '80%', animationDelay: '2s', background: '#8b5cf6' }}></div>
      <div className="balloon" style={{ left: '25%', animationDelay: '4s', background: '#fbbf24' }}></div>
      <div className="balloon" style={{ left: '70%', animationDelay: '1s', background: '#ec4899' }}></div>

      <motion.div 
        initial={{ y: 100, rotate: -5, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}
      >
        {capturedImage && (
          <div className="polaroid" style={{ transform: 'rotate(3deg)', marginBottom: '3rem' }}>
            <img src={capturedImage} alt="Memory" style={{ width: '100%', maxWidth: '350px' }} />
            <p style={{ color: '#333', marginTop: '10px', fontFamily: "'Playfair Display', serif" }}>Beautiful Memory</p>
          </div>
        )}
        <motion.h1 
          className="title-gold"
          animate={{ scale: [1, 1.05, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '4rem', textShadow: '0 5px 15px rgba(251, 191, 36, 0.4)' }}
        >
          Happy Birthday Akansha!
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
