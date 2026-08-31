import React, { useEffect, useRef, useState } from 'react';
import CinematicLoader from './CinematicLoader';
import './CinematicScroll.css';

const FRAME_COUNT = 300;
const SCROLL_SPEED = 20; // Pixels per frame
const TOTAL_SCROLL_HEIGHT = FRAME_COUNT * SCROLL_SPEED;

const overlays = [
  { start: 0, end: 30, text: "YOUR CITY. YOUR VOICE." },
  { start: 40, end: 70, text: "EVERY PROBLEM STARTS WITH BEING SEEN." },
  { start: 80, end: 110, text: "REPORT IT." },
  { start: 120, end: 150, text: "LET YOUR COMMUNITY SPEAK." },
  { start: 160, end: 190, text: "PRIORITY IS BUILT TOGETHER." },
  { start: 200, end: 230, text: "ACTION STARTS HERE." },
  { start: 240, end: 270, text: "PROGRESS YOU CAN SEE." },
  { start: 280, end: 300, text: "BETTER CITIES START WITH BETTER REPORTING." }
];

const CinematicScroll = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeOverlay, setActiveOverlay] = useState(null);

  // Preload images
  useEffect(() => {
    let loaded = 0;
    const imgArray = [];
    
    // To not block the main thread completely, we can load images in chunks or just use Image objects.
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === FRAME_COUNT) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        // Fallback for missing frames
        loaded++;
        setLoadedCount(loaded);
        if (loaded === FRAME_COUNT) {
          setIsLoaded(true);
        }
      }
      imgArray.push(img);
    }
    setImages(imgArray);
  }, []);

  // Canvas drawing and Scroll handling
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const renderFrame = (frameIndex) => {
      const img = images[frameIndex];
      if (img && img.complete && img.naturalWidth !== 0) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratios to cover the canvas
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        );
      }
    };

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollPosition = window.scrollY;
      const maxScroll = window.innerHeight * 4; // Adjust scroll distance
      const scrollFraction = Math.min(scrollPosition / maxScroll, 1);
      
      let frameIndex = Math.floor(scrollFraction * (FRAME_COUNT - 1));
      
      // Ensure we stay within bounds
      frameIndex = Math.max(0, Math.min(frameIndex, FRAME_COUNT - 1));
      
      // Use requestAnimationFrame for smooth drawing
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        setCurrentFrame(frameIndex);
        renderFrame(frameIndex);
      });

      // Check for completion
      if (scrollFraction >= 1) {
        if (onComplete) onComplete();
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(currentFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial draw
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isLoaded, images, currentFrame, onComplete]);

  // Handle Overlays
  useEffect(() => {
    const overlay = overlays.find(o => currentFrame >= o.start && currentFrame <= o.end);
    setActiveOverlay(overlay ? overlay.text : null);
  }, [currentFrame]);

  if (!isLoaded) {
    const progress = (loadedCount / FRAME_COUNT) * 100;
    return <CinematicLoader progress={progress} />;
  }

  return (
    <div className="cinematic-container" ref={containerRef}>
      <div className="sticky-viewport">
        <canvas ref={canvasRef} className="cinematic-canvas"></canvas>
        <div className="overlay-container">
          {activeOverlay && <h1 className="cinematic-text fade-in-out">{activeOverlay}</h1>}
        </div>
        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <div className="mouse-icon">
            <div className="wheel"></div>
          </div>
        </div>
      </div>
      {/* Invisible element to create scroll space */}
      <div className="scroll-space"></div>
    </div>
  );
};

export default CinematicScroll;
