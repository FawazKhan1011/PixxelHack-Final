'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import '../../styles/meditation.css';

const MeditationPage = () => {
  const [time, setTime] = useState<number>(5 * 60); // 5 minutes in seconds, typed
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [waveHeight, setWaveHeight] = useState<number>(50); // Inhale/exhale cue, typed

  // Initialize audio with error handling
  const [audio] = useState<HTMLAudioElement>(() => {
    const audioInstance = new Audio('/soothing-track.mp3');
    audioInstance.onerror = () => console.error('Audio file failed to load');
    return audioInstance;
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
        setWaveHeight((prev) => (prev === 50 ? 100 : 50)); // Wave animation
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      audio.pause();
    }
    return () => clearInterval(timer);
  }, [isRunning, time, audio]);

  const handlePlayPause = () => {
    if (isRunning) {
      setIsRunning(false);
      audio.pause();
    } else {
      setIsRunning(true);
      audio.play().catch((error) => console.error('Audio play failed:', error));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCustomTime = () => {
    const input = prompt('Enter minutes');
    const minutes = input ? parseInt(input, 10) : 5; // Default to 5 if invalid or null
    setTime(minutes * 60 || 5 * 60); // Fallback to 5 minutes if conversion fails
  };

  return (
    <div className="meditation-page">
      <motion.div
        className="meditation-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="meditation-card">
          <CardContent className="meditation-content">
            <h1 className="meditation-title">Meditation Session</h1>
            <div className="timer">{formatTime(time)}</div>
            <motion.div
              className="wave-animation"
              animate={{ height: waveHeight }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="controls">
              <Button onClick={() => setTime(5 * 60)}>5m</Button>
              <Button onClick={() => setTime(10 * 60)}>10m</Button>
              <Button onClick={handleCustomTime}>Custom</Button>
              <Button onClick={handlePlayPause}>{isRunning ? 'Pause' : 'Play'}</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MeditationPage;