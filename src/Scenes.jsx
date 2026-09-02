import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Camera, PartyPopper, Heart } from 'lucide-react';

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
      
      {countdown !== null && (
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

      {attempt === 2 && (
        <motion.h2 className="title-gold" {...fadeIn}>Yay! Happy Birthday! 🎉</motion.h2>
      )}
    </motion.div>
  );
}

export function EnvelopeScene({ onNext }) {
  const [opened, setOpened] = useState(false);

  return (
    <motion.div className="scene-container" {...fadeIn} style={{ perspective: '1000px' }}>
      <div style={{ position: 'relative', height: '400px', width: '300px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        
        <motion.div 
          className="envelope-wrapper"
          onClick={() => setOpened(true)}
          animate={opened ? { y: 150, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="envelope-flap"
            animate={opened ? { rotateX: 180, zIndex: 1 } : { rotateX: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="envelope-pocket" />
        </motion.div>

        <motion.div 
          className="letter"
          initial={{ y: 0, scale: 0.8, opacity: 0 }}
          animate={opened ? { y: -50, scale: 1, opacity: 1, zIndex: 10 } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 style={{ color: '#ec4899', fontSize: '1.8rem' }}>Happy Birthday Akansha!</h2>
          <p style={{ color: '#555', textAlign: 'left', marginTop: '1rem', fontStyle: 'italic', fontSize: '1rem' }}>
            Wishing you the happiest of birthdays! May this year bring you as much joy and laughter as you bring to everyone around you. Keep shining and never stop being the amazing person you are.
          </p>
          <p style={{ color: '#555', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem' }}>With lots of love,</p>
          
          <button className="btn-primary" style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', fontSize: '1rem' }} onClick={onNext}>
            Thanks A Lot
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function MemoryBookScene({ onNext }) {
  const [page, setPage] = useState(0);
  const totalPages = 4;

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    } else {
      onNext();
    }
  };

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div className="book-wrapper" onClick={nextPage}>
        
        {/* Pages under current */}
        <div className="page" style={{ zIndex: 1, background: '#f5f5f5' }}></div>
        
        {/* Current Page Content */}
        <AnimatePresence>
          {page === 0 && (
            <motion.div key="cover" className="page cover" exit={{ rotateY: -180, opacity: 0 }} transition={{ duration: 0.6 }}>
              <h1>Our Memories</h1>
              <Heart size={48} color="#ec4899" style={{ marginTop: '2rem' }} />
              <p style={{ marginTop: 'auto', fontSize: '0.9rem' }}>Tap to open</p>
            </motion.div>
          )}

          {page === 1 && (
            <motion.div key="page1" className="page" initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} exit={{ rotateY: -180, opacity: 0 }} transition={{ duration: 0.6 }}>
              <div className="polaroid">
                <img src="/assets/photo.jpg" alt="Memory" />
                <p style={{ color: '#333', marginTop: '10px', fontFamily: "'Playfair Display', serif" }}>Good Times</p>
              </div>
            </motion.div>
          )}

          {page === 2 && (
            <motion.div key="page2" className="page" initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} exit={{ rotateY: -180, opacity: 0 }} transition={{ duration: 0.6 }}>
              <div className="polaroid" style={{ transform: 'rotate(2deg)' }}>
                <img src="/assets/photo.jpg" alt="Memory" />
                <p style={{ color: '#333', marginTop: '10px', fontFamily: "'Playfair Display', serif" }}>Always smiling</p>
              </div>
            </motion.div>
          )}

          {page === 3 && (
            <motion.div key="page3" className="page" initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} exit={{ rotateY: -180, opacity: 0 }} transition={{ duration: 0.6 }}>
               <Camera size={64} style={{ margin: '0 auto 2rem', color: '#8b5cf6' }} />
               <h2 style={{ color: '#333' }}>Let's take a memory picture</h2>
               <p style={{ color: '#666' }}>(Tap to open camera)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
