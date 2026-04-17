import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollSequence = ({ children }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  const frameCount = 281; // Total frames
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages = [];
      const promises = [];

      for (let i = 1; i <= frameCount; i++) {
        const promise = new Promise((resolve, reject) => {
          const img = new Image();
          // Format based on file names "ezgif-frame-001.jpg"
          const frameNumber = i.toString().padStart(3, '0');
          img.src = `/videoframes/ezgif-frame-${frameNumber}.jpg`;
          img.onload = () => {
            loadedImages[i - 1] = img;
            resolve();
          };
          img.onerror = (e) => {
            console.error(`Failed to load frame ${i}`, e);
            resolve(); // Resolve anyway to avoid blocking
          };
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoaded(true);
    };

    loadImages();
  }, []);

  // Update canvas on scroll
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || images.length === 0) return;

    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const render = (progress) => {
      const index = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(progress * (frameCount - 1)))
      );

      const img = images[index];
      if (img) {
        // Draw image keeping aspect ratio covering the screen
        const hRatio = canvasRef.current.width / img.width;
        const vRatio = canvasRef.current.height / img.height;
        const ratio = Math.max(hRatio, vRatio);

        const centerShift_x = (canvasRef.current.width - img.width * ratio) / 2;
        const centerShift_y = (canvasRef.current.height - img.height * ratio) / 2;

        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.drawImage(
          img,
          0, 0, img.width, img.height,
          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
      }
    };

    // Initial render
    render(scrollYProgress.get());

    // Subscribe to scroll changes
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      requestAnimationFrame(() => render(latest));
    });

    // Resize handler
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        render(scrollYProgress.get());
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded, scrollYProgress, images]);

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

        {/* Overlay for dark theme effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, transparent 40%, rgba(5,5,5,0.8) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        {/* Content Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
          {React.Children.map(children, child => {
            return React.cloneElement(child, { scrollYProgress });
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollSequence;
