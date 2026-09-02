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
        <h1>A Surprise for You!</h1>
        <p>Are you ready for something special?</p>
        <button className="btn-primary" onClick={onNext}>Let's Go!</button>
      </motion.div>
    </motion.div>
  );
}

export function CakeScene({ onNext }) {
  const [blown, setBlown] = useState(false);
  const [attempt, setAttempt] = useState(0); 
  const [countdown, setCountdown] = useState(null);
  
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
        audio.play().catch(e => console.log("Audio play blocked", e));
        setTimeout(onNext, 5000); 
      }
    }
  }, [countdown, attempt, onNext]);

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div style={{ position: 'relative', width: '350px', height: '350px', marginBottom: '3rem' }}>
        <motion.img 
          src="/assets/cake.jpg" 
          alt="Cake" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '4px solid rgba(255,255,255,0.1)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div className="flame-wrapper">
           {!blown && <div className="flame"></div>}
           {blown && <div className="smoke"></div>}
        </div>
      </div>
      
      {countdown === null && attempt === 0 && (
        <motion.button className="btn-primary" onClick={startBlow} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => {
      setLetterOut(true);
    }, 800); 
  };

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div className="envelope-container">
        
        {/* Envelope Side */}
        <motion.div 
          className="envelope-wrapper-2"
          onClick={handleOpen}
          animate={letterOut ? { x: -180, scale: 0.8, rotate: -5, opacity: 0.4 } : { x: 0, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ position: 'relative', zIndex: letterOut ? 1 : 10 }}
        >
          <div className="envelope">
            <div className="envelope-front"></div>
            <div className={`envelope-flap ${opened ? 'open' : ''}`}>
               {!opened && <div style={{ position: 'absolute', top: '-60px', left: '-50px', width: '100px', textAlign: 'center', color: '#fff', fontSize: '1.2rem' }}>Open Me</div>}
            </div>
          </div>
        </motion.div>

        {/* Letter Front */}
        <motion.div 
          className="letter"
          animate={
            !opened ? { y: 0, scale: 0.8, opacity: 0 } : 
            !letterOut ? { y: -150, scale: 0.8, opacity: 1, zIndex: 5 } : 
            { y: -30, x: 120, scale: 1.1, opacity: 1, zIndex: 20 }
          }
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ position: 'absolute', pointerEvents: letterOut ? 'auto' : 'none' }}
        >
          <h2 style={{ color: '#ec4899', fontSize: '1.8rem', marginBottom: '1rem' }}>Happy Birthday Akansha!</h2>
          <p style={{ color: '#555', textAlign: 'left', fontStyle: 'italic', fontSize: '1.1rem', flex: 1 }}>
            Wishing you the happiest of birthdays! May this year bring you as much joy and laughter as you bring to everyone around you. Keep shining and never stop being the amazing person you are.
          </p>
          <p style={{ color: '#555', textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem', width: '100%' }}>With lots of love,</p>
          
          {letterOut && (
            <button className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', fontSize: '1rem' }} onClick={onNext}>
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
  return (
    <motion.div className="scene-container" {...fadeIn}>
      <h2 className="title-gold" style={{ marginBottom: '2rem' }}>Flip the pages</h2>
      <HTMLFlipBook 
        width={320} 
        height={450} 
        size="stretch"
        minWidth={300}
        maxWidth={400}
        minHeight={450}
        maxHeight={500}
        showCover={true}
        className="book-container"
      >
        {/* Cover */}
        <Page density="hard">
           <div className="book-cover" style={{ width: '100%', height: '100%', position: 'relative', backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(/assets/cover.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
             <Star className="doodle" style={{ top: '10%', left: '10%', color: '#fbbf24', transform: 'rotate(-15deg)' }} size={32} />
             <Cake className="doodle" style={{ bottom: '15%', right: '15%', color: '#ec4899', transform: 'rotate(10deg)' }} size={40} />
             
             <h1 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Akansha's</h1>
             <h2 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Memories</h2>
             <Heart size={56} color="#ec4899" style={{ marginTop: '1rem', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' }} />
             <p style={{ marginTop: 'auto', fontSize: '0.9rem', opacity: 0.9, textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>Drag to open</p>
           </div>
        </Page>
        
        {/* Page 1 */}
        <Page>
          <Sparkles className="doodle" style={{ top: '5%', right: '10%', color: '#ec4899' }} size={24} />
          <Star className="doodle" style={{ bottom: '20%', left: '10%', color: '#fbbf24' }} size={24} />
          
          <div className="polaroid">
            <img src="/assets/photo.jpg" alt="Memory" />
            <p style={{ color: '#333', marginTop: '10px', fontFamily: "'Playfair Display', serif" }}>Late night talks & crazy laughs! ✨</p>
          </div>
        </Page>

        {/* Page 2 */}
        <Page>
          <Gift className="doodle" style={{ top: '15%', left: '5%', color: '#8b5cf6', transform: 'rotate(-10deg)' }} size={32} />
          <Heart className="doodle" style={{ bottom: '10%', right: '15%', color: '#ec4899' }} size={28} />

          <div className="polaroid" style={{ transform: 'rotate(2deg)' }}>
            <img src="/assets/photo.jpg" alt="Memory" />
            <p style={{ color: '#333', marginTop: '10px', fontFamily: "'Playfair Display', serif" }}>Forever my favorite person! ❤️</p>
          </div>
        </Page>

        {/* Page 3 - Camera prompt */}
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
      setCapturedImage(dataUrl);
      if (stream) stream.getTracks().forEach(track => track.stop());
      onNext();
    }
  };

  return (
    <motion.div className="scene-container" {...fadeIn}>
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
      <motion.div 
        initial={{ y: 100, rotate: -5, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
