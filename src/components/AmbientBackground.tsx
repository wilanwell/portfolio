import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

export default function AmbientBackground({
  subtle = false,
}: {
  subtle?: boolean;
}) {
  const background = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const visibility = useMotionValue(0);
  const flowX = useMotionValue(0);
  const flowY = useMotionValue(0);
  const parallaxX = useSpring(flowX, { stiffness: 30, damping: 24 });
  const parallaxY = useSpring(flowY, { stiffness: 30, damping: 24 });
  const smoothX = useSpring(x, { stiffness: 45, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 45, damping: 22 });
  const opacity = useSpring(visibility, { stiffness: 35, damping: 18 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let generation = 0;
    let dispose: (() => void) | undefined;
    const sync = async () => {
      const token = ++generation;
      dispose?.();
      dispose = undefined;
      if (media.matches || !canvasHost.current) return;
      try {
        const { startWave } = await import("../effects/wave");
        if (token !== generation || !canvasHost.current) return;
        dispose = startWave(canvasHost.current);
      } catch { /* The original SVG and CSS composition remains visible. */ }
    };
    const timer = window.setTimeout(sync, 300);
    media.addEventListener("change", sync);
    return () => {
      generation++;
      window.clearTimeout(timer);
      media.removeEventListener("change", sync);
      dispose?.();
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const hide = () => {
      visibility.set(0);
      flowX.set(0);
      flowY.set(0);
    };
    const move = (event: PointerEvent) => {
      if (
        reducedMotion.matches || !finePointer.matches ||
        document.hidden || event.pointerType === "touch"
      ) return;
      x.set(event.clientX);
      y.set(event.clientY);
      flowX.set((event.clientX / window.innerWidth - 0.5) * 32);
      flowY.set((event.clientY / window.innerHeight - 0.5) * 24);
      visibility.set(1);
    };
    const syncVisibility = () => {
      background.current?.toggleAttribute("data-paused", document.hidden);
      if (document.hidden) hide();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", syncVisibility);
    reducedMotion.addEventListener("change", hide);
    finePointer.addEventListener("change", hide);
    syncVisibility();
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", syncVisibility);
      reducedMotion.removeEventListener("change", hide);
      finePointer.removeEventListener("change", hide);
    };
  }, [x, y, visibility, flowX, flowY]);

  return (
    <div
      ref={background}
      className={`ambient-background${subtle ? " ambient-subtle" : ""}`}
      aria-hidden="true"
    >
      <div className="ambient-glow" />
      <div className="ambient-aurora" />
      <motion.div
        className="ambient-flow"
        style={{ x: parallaxX, y: parallaxY }}
      >
        <svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <linearGradient id="ambient-flow-stroke" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="0.35" stopColor="#a78bfa" stopOpacity="0.28" />
              <stop offset="0.72" stopColor="#d8b4fe" stopOpacity="0.4" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ambient-flow-light" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#6d28d9" stopOpacity="0" />
              <stop offset="0.5" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="ambient-flow-lines" fill="none">
            <path className="ambient-flow-light" d="M-180 940 C250 620 580 1140 900 700 S1050 70 1660 230" stroke="url(#ambient-flow-light)" strokeWidth="110" />
            {Array.from({ length: 9 }, (_, index) => {
              const offset = index * 24;
              return (
                <path
                  key={index}
                  d={`M-180 ${840 + offset} C250 ${520 + offset} 580 ${1040 + offset} 900 ${600 + offset} S1050 ${-30 + offset} 1660 ${130 + offset}`}
                  stroke="url(#ambient-flow-stroke)"
                  strokeWidth={index === 4 ? 1.5 : 0.8}
                />
              );
            })}
          </g>
        </svg>
      </motion.div>
      <div className="ambient-canvas" ref={canvasHost} />
      <motion.div
        className="ambient-pointer"
        style={{ x: smoothX, y: smoothY, opacity }}
      />
    </div>
  );
}
