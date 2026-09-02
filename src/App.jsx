import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Welcome, CakeScene, EnvelopeScene, MemoryBookScene, CameraCaptureScene, PartyQuestionScene, FinalScene } from './Scenes';
import './index.css';

function App() {
  const [scene, setScene] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);

  const nextScene = () => setScene(s => s + 1);

  return (
    <>
      <AnimatePresence mode="wait">
        {scene === 0 && <Welcome key="welcome" onNext={nextScene} />}
        {scene === 1 && <CakeScene key="cake" onNext={nextScene} />}
        {scene === 2 && <EnvelopeScene key="envelope" onNext={nextScene} />}
        {scene === 3 && <MemoryBookScene key="book" onNext={nextScene} />}
        {scene === 4 && <CameraCaptureScene key="camera" onNext={nextScene} setCapturedImage={setCapturedImage} />}
        {scene === 5 && <PartyQuestionScene key="party" onNext={nextScene} />}
        {scene === 6 && <FinalScene key="final" capturedImage={capturedImage} />}
      </AnimatePresence>
    </>
  );
}

export default App;
