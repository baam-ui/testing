import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  pulse: number;
  trail: { x: number; y: number; opacity: number }[];
}

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  shape: 'triangle' | 'square' | 'hexagon' | 'circle';
  opacity: number;
}

const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingShapes, setFloatingShapes] = useState<FloatingShape[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const colors = [
    'var(--primary)',
    'rgba(255, 215, 0, 0.8)',
    'rgba(255, 255, 255, 0.6)',
    'rgba(135, 206, 235, 0.7)',
    'rgba(255, 182, 193, 0.6)'
  ];

  useEffect(() => {
    // Create initial particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 6 + 2,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        trail: []
      });
    }
    setParticles(initialParticles);

    // Create floating shapes
    const initialShapes: FloatingShape[] = [];
    for (let i = 0; i < 15; i++) {
      const shapes: FloatingShape['shape'][] = ['triangle', 'square', 'hexagon', 'circle'];
      initialShapes.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 40 + 20,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    setFloatingShapes(initialShapes);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(particle => {
        // Mouse interaction
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        let newSpeedX = particle.speedX;
        let newSpeedY = particle.speedY;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          newSpeedX += (dx / distance) * force * 0.5;
          newSpeedY += (dy / distance) * force * 0.5;
        }

        // Update position
        let newX = particle.x + newSpeedX;
        let newY = particle.y + newSpeedY;

        // Wrap around screen edges
        if (newX > window.innerWidth) newX = 0;
        if (newX < 0) newX = window.innerWidth;
        if (newY > window.innerHeight) newY = 0;
        if (newY < 0) newY = window.innerHeight;

        // Update trail
        const newTrail = [
          { x: particle.x, y: particle.y, opacity: 0.8 },
          ...particle.trail.slice(0, 4)
        ].map((point, index) => ({
          ...point,
          opacity: point.opacity * 0.8
        }));

        // Update pulse
        const newPulse = particle.pulse + 0.1;

        return {
          ...particle,
          x: newX,
          y: newY,
          speedX: newSpeedX * 0.98, // Friction
          speedY: newSpeedY * 0.98,
          pulse: newPulse,
          trail: newTrail,
          opacity: 0.3 + Math.sin(newPulse) * 0.3
        };
      }));

      setFloatingShapes(prev => prev.map(shape => {
        let newX = shape.x + shape.speedX;
        let newY = shape.y + shape.speedY;

        // Wrap around screen edges
        if (newX > window.innerWidth + shape.size) newX = -shape.size;
        if (newX < -shape.size) newX = window.innerWidth + shape.size;
        if (newY > window.innerHeight + shape.size) newY = -shape.size;
        if (newY < -shape.size) newY = window.innerHeight + shape.size;

        return {
          ...shape,
          x: newX,
          y: newY,
          rotation: shape.rotation + shape.rotationSpeed
        };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  const getShapePath = (shape: FloatingShape['shape'], size: number) => {
    const half = size / 2;
    switch (shape) {
      case 'triangle':
        return `M ${half} 0 L ${size} ${size} L 0 ${size} Z`;
      case 'square':
        return `M 0 0 L ${size} 0 L ${size} ${size} L 0 ${size} Z`;
      case 'hexagon':
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = half + half * Math.cos(angle);
          const y = half + half * Math.sin(angle);
          points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }
        return points.join(' ') + ' Z';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-primary/5 to-transparent" 
             style={{ animation: 'float 8s ease-in-out infinite' }} />
      </div>

      {/* Floating geometric shapes */}
      <svg className="absolute inset-0 w-full h-full">
        {floatingShapes.map(shape => (
          <g key={shape.id}>
            {shape.shape === 'circle' ? (
              <circle
                cx={shape.x}
                cy={shape.y}
                r={shape.size / 2}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                opacity={shape.opacity}
                transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}
              />
            ) : (
              <path
                d={getShapePath(shape.shape, shape.size)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                opacity={shape.opacity}
                transform={`translate(${shape.x - shape.size/2}, ${shape.y - shape.size/2}) rotate(${shape.rotation} ${shape.size/2} ${shape.size/2})`}
              />
            )}
          </g>
        ))}
      </svg>

      {/* Particles with trails */}
      {particles.map(particle => (
        <div key={particle.id}>
          {/* Particle trail */}
          {particle.trail.map((point, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                left: `${point.x}px`,
                top: `${point.y}px`,
                width: `${particle.size * (1 - index * 0.2)}px`,
                height: `${particle.size * (1 - index * 0.2)}px`,
                opacity: point.opacity * 0.5,
                background: `radial-gradient(circle, ${particle.color}, transparent)`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Main particle */}
          <div
            className="absolute rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              background: `radial-gradient(circle, ${particle.color}, transparent)`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(0.5px)'
            }}
          />
        </div>
      ))}

      {/* Interactive glow effect around mouse */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, var(--primary), transparent)`,
          opacity: 0.1,
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Hexagon pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, var(--primary) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 40px 40px',
            animation: 'float 15s ease-in-out infinite reverse'
          }}
        />
      </div>
    </div>
  );
};

export default ParticleBackground;