import { useEffect, useRef } from 'react';
import { useMotion } from './Motion';
import { clamp, projectPoint, ribbonPoint } from './motionMath';

const ribbons = Array.from({ length: 52 }, (_, line) =>
  Array.from({ length: 145 }, (_, step) => ribbonPoint(step / 144 * Math.PI * 4, (line / 51 - 0.5) * 0.92)),
);

export default function SignatureScene() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { paused } = useMotion();
  const elapsed = useRef(0);

  useEffect(() => {
    const element = host.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    const context = surface.getContext('2d', { alpha: true });
    if (!context) {
      console.warn('Decorative canvas is unavailable; showing the local static sculpture instead.');
      element.dataset.renderer = 'static';
      return;
    }
    element.dataset.renderer = 'canvas';
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const hero = element.closest<HTMLElement>('.hero');
    let width = 0;
    let height = 0;
    let visible = true;
    let frame = 0;
    let previousTime = 0;
    let lastDraw = 0;
    let scroll = 0;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const size = Math.min(width * 0.27, height * 0.205);
      const rotation = -0.45 + elapsed.current * 0.045 + pointer.x * 0.16 + scroll * 0.65;
      const tilt = 0.16 + Math.sin(elapsed.current * 0.12) * 0.06 + pointer.y * 0.13;
      const paths = ribbons.map((ribbon, index) => {
        const points = ribbon.map((point) => projectPoint(point, rotation, tilt, size));
        return { points, index, depth: points.reduce((sum, point) => sum + point.z, 0) / points.length };
      }).sort((a, b) => b.depth - a.depth);
      const centerX = width * 0.5;
      const centerY = height * 0.48 + Math.sin(elapsed.current * 0.35) * 5;

      context.save();
      context.translate(centerX, centerY);
      for (const path of paths) {
        const gradient = context.createLinearGradient(-size, -size * 1.5, size, size * 1.3);
        const edge = Math.abs(path.index / 51 - 0.5) * 2;
        gradient.addColorStop(0, `rgba(225, 232, 251, ${0.6 + edge * 0.2})`);
        gradient.addColorStop(0.28, 'rgba(111, 135, 196, 0.3)');
        gradient.addColorStop(0.53, `rgba(174, 197, 255, ${0.48 + edge * 0.2})`);
        gradient.addColorStop(0.76, 'rgba(84, 115, 191, 0.35)');
        gradient.addColorStop(1, 'rgba(226, 233, 253, 0.8)');
        context.strokeStyle = gradient;
        context.lineWidth = edge > 0.95 ? 1.35 : 0.72;
        context.beginPath();
        path.points.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.stroke();
      }
      context.restore();
    };

    const tick = (time: number) => {
      if (time - lastDraw >= 32) {
        if (previousTime) elapsed.current += Math.min((time - previousTime) / 1000, 0.08);
        previousTime = time;
        lastDraw = time;
        pointer.x += (pointer.targetX - pointer.x) * 0.08;
        pointer.y += (pointer.targetY - pointer.y) * 0.08;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      const running = visible && !document.hidden && !paused;
      element.dataset.state = paused ? 'paused' : running ? 'running' : 'offscreen';
      if (running) frame = requestAnimationFrame(tick);
      else if (visible && !document.hidden) draw();
    };
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    const onPointer = (event: PointerEvent) => {
      if (paused || !finePointer.matches || !hero) return;
      const bounds = hero.getBoundingClientRect();
      pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
      pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    };
    const resetPointer = () => { pointer.targetX = 0; pointer.targetY = 0; };
    const onScroll = () => {
      if (!paused && hero) scroll = clamp(-hero.getBoundingClientRect().top / hero.offsetHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe(element);
    hero?.addEventListener('pointermove', onPointer, { passive: true });
    hero?.addEventListener('pointerleave', resetPointer);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', sync);
    resize();
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      hero?.removeEventListener('pointermove', onPointer);
      hero?.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [paused]);

  return <div className="signature-scene" ref={host} data-renderer="static" aria-hidden="true">
    <div className="scene-halo" />
    <div className="scene-orbit scene-orbit-one" />
    <div className="scene-orbit scene-orbit-two" />
    <div className="scene-fallback"><span /><span /><span /></div>
    <canvas ref={canvas} />
    <div className="scene-floor" />
  </div>;
}
