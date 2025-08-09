"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import "../../styles/meditation.css";
import router from "next/router";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const Meditation = () => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(selectedMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [breathText, setBreathText] = useState<string>("Breathe in...");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const phaseRef = useRef<"in" | "out">("in");

  // SEO basics for SPA
  useEffect(() => {
    document.title = "Meditation Timer | Wellness Breathing";
    const descContent =
      "Guided meditation timer with breathing ring animation and soothing loop.";
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", descContent);

    let canonical = document.querySelector('link[rel="canonical"]') as
      | HTMLLinkElement
      | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);

  // Keep time in sync when preset changes
  useEffect(() => {
    if (!isRunning) setTimeLeft(selectedMinutes * 60);
  }, [selectedMinutes, isRunning]);

  // Prepare audio (looping)
  useEffect(() => {
    const a = new Audio("/breath.mp3");
    a.preload = "auto";
    a.loop = true;
    a.onerror = () => console.error("Audio file failed to load");
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);
  const exitToDashboard = () => {
    router.push('/dashboard');
  };
  // Timer + breathing phase
  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (phaseTimerRef.current) {
        clearInterval(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      return;
    }

    tickRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          audioRef.current?.pause();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    phaseTimerRef.current = window.setInterval(() => {
      phaseRef.current = phaseRef.current === "in" ? "out" : "in";
      setBreathText(
        phaseRef.current === "in" ? "Breathe in..." : "Breathe out..."
      );
    }, 6000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, [isRunning]);

  const start = () => {
    if (timeLeft === 0) setTimeLeft(selectedMinutes * 60);
    setIsRunning(true);
    audioRef.current
      ?.play()
      .catch((e) => console.error("Audio play failed:", e));
  };

  const stop = () => {
    setIsRunning(false);
    audioRef.current?.pause();
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    phaseRef.current = "in";
    setBreathText("Breathe in...");
  };

  return (
    <main className="meditation-page" role="main">
      <motion.section
        layout
        className="ya-card meditation-card"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="max-w-xl mx-auto text-center p-6 glass-card">
          <CardContent className="space-y-5">
            <header>
              <h1 className="meditation-title">Meditation Timer</h1>
            </header>

            <div className="timer" aria-live="polite" aria-atomic>
              {formatTime(timeLeft)}
            </div>

            <div
              className={`breath-container ${isRunning ? "is-playing" : ""}`}
              aria-label="Breathing animation"
              role="img"
            >
              <div className="breath-ring" />
              <div className="breath-text">{breathText}</div>
            </div>

            <section className="controls" aria-label="Timer presets">
              <div className="preset-row">
                <Button
                  variant={selectedMinutes === 2 ? "default" : "secondary"}
                  onClick={() => setSelectedMinutes(2)}
                >
                  2 min
                </Button>
                <Button
                  variant={selectedMinutes === 5 ? "default" : "secondary"}
                  onClick={() => setSelectedMinutes(5)}
                >
                  5 min
                </Button>
                <Button
                  variant={selectedMinutes === 10 ? "default" : "secondary"}
                  onClick={() => setSelectedMinutes(10)}
                >
                  10 min
                </Button>
              </div>

              <div className="action-row">
                <Button onClick={start} size="lg">
                  Start
                </Button>
                <Button onClick={stop} variant="secondary" size="lg">
                  Stop
                </Button>
                <Button onClick={reset} variant="outline" size="lg">
                  Reset
                </Button>
              </div>
            </section>
          </CardContent>
        </Card>
      </motion.section>
    </main>
  );
};

export default Meditation;