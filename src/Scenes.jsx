import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Camera, PartyPopper } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

export function Welcome({ onNext }) {
  return (
    <motion.div className="scene-container glass-panel" {...fadeIn}>
      <h1>A Surprise for You!</h1>
      <p>Are you ready?</p>
      <button className="btn-primary" onClick={onNext}>Let's Go!</button>
    </motion.div>
  );
}

export function CakeScene({ onNext }) {
  const [blown, setBlown] = useState(false);
  const [attempt, setAttempt] = useState(0); // 0: init, 1: first fail, 2: success
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
      // Countdown finished
      if (attempt === 0) {
        setAttempt(1);
        setCountdown(null);
      } else if (attempt === 1) {
        setBlown(true);
        setAttempt(2);
        // Play song
        const audio = new Audio('/assets/song.mp3'); // We'll assume user puts it here, or just simulate
        audio.play().catch(e => console.log("Audio play blocked", e));
        setTimeout(onNext, 4000); // move to next scene after 4 seconds
      }
    }
  }, [countdown, attempt, onNext]);

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <div style={{ position: 'relative', width: '300px', height: '300px', marginBottom: '2rem' }}>
        <img src="/assets/cake.jpg" alt="Cake" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)' }}>
           {!blown && <div className="flame"></div>}
           {blown && <div className="smoke"></div>}
        </div>
      </div>
      
      {countdown === null && attempt === 0 && (
        <button className="btn-primary" onClick={startBlow}>Make a Wish & Blow (3s)</button>
      )}
      
      {countdown !== null && (
        <h2>Blowing in... {countdown}</h2>
      )}

      {attempt === 1 && countdown === null && (
        <motion.div {...fadeIn}>
          <h2 style={{ color: '#fca5a5' }}>Jor se Phukk damm nhi hai kya 😂</h2>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={startBlow}>Try Again</button>
        </motion.div>
      )}

      {attempt === 2 && (
        <motion.h2 {...fadeIn}>Yay! Happy Birthday! 🎉</motion.h2>
      )}
    </motion.div>
  );
}

export function EnvelopeScene({ onNext }) {
  const [opened, setOpened] = useState(false);

  return (
    <motion.div className="scene-container" {...fadeIn}>
      {!opened ? (
        <motion.div 
          onClick={() => setOpened(true)}
          style={{ cursor: 'pointer', background: '#e2e8f0', padding: '4rem', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <h2 style={{ color: '#333' }}>✉️ Tap to Open Envelope</h2>
        </motion.div>
      ) : (
        <motion.div 
          className="glass-panel"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{ background: '#fff', color: '#333', maxWidth: '400px' }}
        >
          <h2 style={{ color: '#ec4899' }}>Happy Birthday Akansha!</h2>
          <p style={{ color: '#555', textAlign: 'left', marginTop: '1rem', fontStyle: 'italic' }}>
            Wishing you the happiest of birthdays! May this year bring you as much joy and laughter as you bring to everyone around you. Keep shining and never stop being the amazing person you are.
          </p>
          <p style={{ color: '#555', textAlign: 'left', fontWeight: 'bold' }}>With lots of love,</p>
          <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={onNext}>Thanks A Lot</button>
        </motion.div>
      )}
    </motion.div>
  );
}

export function MemoryBookScene({ onNext }) {
  const [page, setPage] = useState(0);

  const pages = [
    "Book Cover - Our Memories",
    "Pic 1",
    "Pic 2",
    "Lets take a memory picture!"
  ];

  const nextPage = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    } else {
      onNext();
    }
  };

  return (
    <motion.div className="scene-container" {...fadeIn}>
      <motion.div 
        className="glass-panel"
        style={{ width: '300px', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#3b0764' }}
        onClick={nextPage}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {page === 0 && <h2>📖 Memorial Book</h2>}
        {(page === 1 || page === 2) && (
          <img src="/assets/photo.jpg" alt="Memory" style={{ width: '90%', borderRadius: '10px' }} />
        )}
        {page === 3 && (
          <div>
            <Camera size={48} style={{ margin: '0 auto 1rem' }} />
            <h2>Let's take a memory picture</h2>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>(Tap to open camera)</p>
          </div>
        )}
      </motion.div>
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
      <h2>Smile! 📸</h2>
      {error ? (
        <div className="glass-panel">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => { setCapturedImage("/assets/photo.jpg"); onNext(); }}>Skip / Use Placeholder</button>
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', margin: '1rem 0' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '400px' }}></video>
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
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`
    });
    setNoCount(noCount + 1);
  };

  const handleYes = () => {
    setYesClicked(true);
    setTimeout(onNext, 4000);
  };

  if (yesClicked) {
    return (
      <motion.div className="scene-container glass-panel" {...fadeIn}>
        <PartyPopper size={64} style={{ color: '#ec4899', margin: '0 auto 1rem' }} />
        <h2>yay its party bas bill mujh par mat fadna</h2>
        <motion.p 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, type: 'spring' }}
          style={{ fontSize: '2rem', color: '#fbbf24', marginTop: '2rem', fontWeight: 'bold' }}
        >
          "Bohot pitega tu"
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div className="scene-container glass-panel" style={{ position: 'relative', width: '100%', height: '500px' }} {...fadeIn}>
      <h2 style={{ marginTop: '2rem' }}>Party toh deni padegi</h2>
      
      <motion.button 
        className="btn-primary" 
        onClick={handleYes}
        style={{ position: 'absolute', top: '50%', left: '30%', transform: `translate(-50%, -50%) scale(${1 + noCount * 0.2})` }}
      >
        Yes
      </motion.button>

      {noCount < 3 && (
        <button 
          className="btn-primary evasive-btn" 
          style={{ top: noPos.top, left: noPos.left, transform: 'translate(-50%, -50%)', background: '#475569' }}
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
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ec4899', '#8b5cf6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#8b5cf6']
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
        className="glass-panel"
        initial={{ y: 50, rotate: -5 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: 'spring' }}
      >
        {capturedImage && (
          <img src={capturedImage} alt="Memory" style={{ width: '100%', maxWidth: '300px', borderRadius: '10px', border: '5px solid white' }} />
        )}
        <h1 style={{ marginTop: '2rem', fontSize: '3rem', color: '#ec4899' }}>Happy Birthday Akansha!</h1>
      </motion.div>
    </motion.div>
  );
}
