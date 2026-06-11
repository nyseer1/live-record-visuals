import { useRef, useEffect } from 'react';

export default function CanvasCursor() {
  //TODO FIND OUT HOW TO CROP THIS CANVAS INTO A DIV
    
  const ctxRef = useRef(null);
  const fRef = useRef(null);
  const linesRef = useRef([]);
  const posRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const animationFrameId = useRef(null);
  const spinRef = useRef({
    active: false,
    angle: 0,
    radius: 0,
    centerX: 0,
    centerY: 0,
    speed: 0.05,
    duration: 0,
    maxDuration: 120, // frames (about 2 seconds at 60fps)
  });

  const E = {
    friction: 0.5,
    trails: 20,
    size: 50,
    dampening: 0.25,
    tension: 0.98,
  };
  let painting = true; //

  function PhaseWave({ phase = 0, offset = 0, frequency = 0.001, amplitude = 1 }) {
    let _phase = phase;
    return {
      update() {
        _phase += frequency;
        return offset + Math.sin(_phase) * amplitude;
      },
    };
  }
  
  class Node {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
      this.vx = 0;
      this.vy = 0;
    }
  }

  class Line {
    constructor(spring) {
      this.spring = spring + 0.1 * Math.random() - 0.02;
      this.friction = E.friction + 0.01 * Math.random() - 0.002;
      this.nodes = [];
      for (let i = 0; i < E.size; i++) {
        this.nodes.push(new Node(posRef.current.x, posRef.current.y));
      }
    }

    update() {
      let spring = this.spring;
      let t = this.nodes[0];
      
      // Apply spinny effect if active
      if (spinRef.current.active && spinRef.current.duration > 0) {
        const spin = spinRef.current;
        const angle = spin.angle + (spin.duration * spin.speed);
        const targetX = spin.centerX + Math.cos(angle) * spin.radius;
        const targetY = spin.centerY + Math.sin(angle) * spin.radius;
        
        t.vx += (targetX - t.x) * spring * 1.5;
        t.vy += (targetY - t.y) * spring * 1.5;
        spin.duration--;
        
        if (spin.duration <= 0) {
          spin.active = false;
        }
      } else {
        t.vx += (posRef.current.x - t.x) * spring;
        t.vy += (posRef.current.y - t.y) * spring;
      }

      for (let i = 0; i < this.nodes.length; i++) {
        t = this.nodes[i];
        if (i > 0) {
          const prev = this.nodes[i - 1];
          t.vx += (prev.x - t.x) * spring;
          t.vy += (prev.y - t.y) * spring;
          t.vx += prev.vx * E.dampening;
          t.vy += prev.vy * E.dampening;
        }
        t.vx *= this.friction;
        t.vy *= this.friction;
        t.x += t.vx;
        t.y += t.vy;
        spring *= E.tension;
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

      for (let i = 1; i < this.nodes.length - 2; i++) {
        const c = this.nodes[i];
        const d = this.nodes[i + 1];
        const xc = (c.x + d.x) / 2;
        const yc = (c.y + d.y) / 2;
        ctx.quadraticCurveTo(c.x, c.y, xc, yc);
      }
      // curve through the last two points
      const secondLast = this.nodes[this.nodes.length - 2];
      const last = this.nodes[this.nodes.length - 1];
      ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
      ctx.stroke();
      ctx.closePath();
    }
  }

  const startSpinnyEffect = (x, y) => {
    spinRef.current.active = true;
    spinRef.current.centerX = x;
    spinRef.current.centerY = y;
    spinRef.current.radius = 150;
    spinRef.current.angle = 0;
    spinRef.current.speed = 0.05;
    spinRef.current.duration = spinRef.current.maxDuration;
  };

  const onPointerMove = (e) => {
    if(painting){
      const x = e.touches ? e.touches[0].pageX : e.clientX;
      const y = e.touches ? e.touches[0].pageY : e.clientY;
      
      // Check if this is a touch start event (single touch)
      if (e.type === 'touchstart' && e.touches.length === 1) {
        startSpinnyEffect(x, y);
      }
      
      posRef.current.x = x;
      posRef.current.y = y;
      
    }
    
    e.preventDefault();
  };
    const onPointerDown = (e) => {
    const x = e.touches ? e.touches[0].pageX : e.clientX;
    const y = e.touches ? e.touches[0].pageY : e.clientY;
    startSpinnyEffect(x, y);
    painting = true;
    posRef.current.x = x;
    posRef.current.y = y;
    e.preventDefault();
  };

  const onPointerUp = (e) => {
    painting = false;
    e.preventDefault();
  };

  const resizeCanvas = () => {
    if (!ctxRef.current) return;
    const canvas = ctxRef.current.canvas;
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight;
  };

  const render = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `hsla(${Math.round(fRef.current.update())}, 50%, 50%, 0.2)`;
    ctx.lineWidth = 1;

    for (let i = 0; i < E.trails; i++) {
      const line = linesRef.current[i];
      line.update();
      line.draw(ctx);
    }
    ctx.frame++;
    animationFrameId.current = window.requestAnimationFrame(render);
  };

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.running = true;
    ctxRef.current.frame = 1;

    fRef.current = PhaseWave({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    });

    linesRef.current = [];
    for (let i = 0; i < E.trails; i++) {
      linesRef.current.push(new Line(0.4 + (i / E.trails) * 0.025));
    }

    window.addEventListener("touchstart", onPointerDown);
    window.addEventListener("touchend", onPointerUp);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchmove", onPointerMove);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    resizeCanvas();
    animationFrameId.current = window.requestAnimationFrame(render);

    return () => {
      ctxRef.current.running = false;
      window.cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [E.trails]);

  return (
    <canvas
      id="canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 2,
        width: '100vw',
        height: '100vh',
      }}
    /> 
  );
}
