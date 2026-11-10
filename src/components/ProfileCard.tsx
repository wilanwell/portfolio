import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight, Braces, GraduationCap, RotateCw } from "lucide-react";
import { useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { profile, shortAvailability } from "../lib/content";
import {
  resolveGestureAxis,
  settleProfileTurn,
} from "../lib/profile-interaction";
import type { GestureAxis } from "../lib/profile-interaction";

interface CardGesture {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  width: number;
  baseTurn: number;
  axis: GestureAxis;
}

export default function ProfileCard() {
  const [flipped, setFlipped] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const gesture = useRef<CardGesture | null>(null);
  const turn = useRef(0);
  const suppressClick = useRef(false);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotation = useMotionValue(0);
  const lift = useMotionValue(1);
  const glare = useMotionValue(0);
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(35);
  const tiltX = useSpring(x, { stiffness: 240, damping: 25 });
  const tiltY = useSpring(y, { stiffness: 240, damping: 25 });
  const turnSpring = useSpring(rotation, { stiffness: 250, damping: 28 });
  const liftSpring = useSpring(lift, { stiffness: 280, damping: 24 });
  const glareSpring = useSpring(glare, { stiffness: 220, damping: 24 });
  const imageX = useTransform(tiltY, [-14, 14], [-5, 5]);
  const imageY = useTransform(tiltX, [-14, 14], [5, -5]);
  const reflection = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,.9), rgba(216,180,254,.35) 24%, transparent 64%)`;

  const poseAt = (event: PointerEvent<HTMLButtonElement>, down = false) => {
    if (reduce) return;
    // Measure the unrotated stage so the moving card does not chase its own bounds.
    const bounds = stage.current!.getBoundingClientRect();
    const px = Math.max(
      0,
      Math.min(
        1,
        (event.clientX - bounds.left) / event.currentTarget.offsetWidth,
      ),
    );
    const py = Math.max(
      0,
      Math.min(
        1,
        (event.clientY - bounds.top) / event.currentTarget.offsetHeight,
      ),
    );
    x.set((0.5 - py) * 26);
    y.set((px - 0.5) * 28);
    lightX.set(px * 100);
    lightY.set(py * 100);
    lift.set(down ? 1.025 : 1.015);
    glare.set(down ? 0.36 : 0.24);
  };
  const resetPose = () => {
    x.set(0);
    y.set(0);
    lift.set(1);
    glare.set(0);
  };
  const commitTurn = (next: number) => {
    turn.current = next;
    rotation.set(next * 180);
    setFlipped(Math.abs(next % 2) === 1);
  };
  const cancelGesture = () => {
    const active = gesture.current;
    if (active) suppressClick.current = true;
    gesture.current = null;
    if (active && card.current?.hasPointerCapture(active.pointerId)) {
      card.current.releasePointerCapture(active.pointerId);
    }
    rotation.set(turn.current * 180);
    setPressed(false);
    setDragging(false);
    resetPose();
  };
  const pointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      width: event.currentTarget.offsetWidth,
      baseTurn: turn.current,
      axis: "pending",
    };
    // Capture keeps mouse/stylus releases outside the card from getting lost.
    // touch-action: pan-y still lets the browser take over vertical scrolling.
    event.currentTarget.setPointerCapture(event.pointerId);
    setPressed(true);
    poseAt(event, true);
  };
  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const active = gesture.current;
    if (!active) {
      if (event.pointerType !== "touch") poseAt(event);
      return;
    }
    if (active.pointerId !== event.pointerId) return;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    if (active.axis === "pending") {
      active.axis = resolveGestureAxis(dx, dy);
      if (active.axis === "horizontal") {
        suppressClick.current = true;
        setDragging(true);
      }
    }
    if (active.axis === "vertical") {
      suppressClick.current = true;
      setPressed(false);
      resetPose();
      return;
    }
    const elapsed = Math.max(event.timeStamp - active.lastTime, 1);
    active.velocity = (event.clientX - active.lastX) / elapsed;
    active.lastX = event.clientX;
    active.lastTime = event.timeStamp;
    poseAt(event, true);
    if (active.axis === "horizontal") {
      event.preventDefault();
      if (!reduce)
        rotation.set(
          active.baseTurn * 180 +
            Math.max(-1.1, Math.min(1.1, dx / active.width)) * 180,
        );
    }
  };
  const pointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (active.axis === "horizontal") {
      const velocity =
        event.timeStamp - active.lastTime < 80 ? active.velocity : 0;
      commitTurn(
        settleProfileTurn(
          active.baseTurn,
          event.clientX - active.startX,
          active.width,
          velocity,
        ),
      );
    } else rotation.set(active.baseTurn * 180);
    setPressed(false);
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    resetPose();
  };
  const click = (event: MouseEvent<HTMLButtonElement>) => {
    // Drag release can also generate a click. Keyboard activation still works.
    if (suppressClick.current && event.detail !== 0) {
      suppressClick.current = false;
      return;
    }
    suppressClick.current = false;
    commitTurn(turn.current + 1);
  };

  const glareLayer = (
    <motion.div
      className="profile-glare"
      aria-hidden="true"
      style={{ background: reflection, opacity: reduce ? 0 : glareSpring }}
    />
  );
  return (
    <div className="portrait-stage" ref={stage}>
      <div className="portrait-aura" aria-hidden="true" />
      <motion.button
        ref={card}
        type="button"
        className="profile-card"
        aria-label={
          flipped
            ? "Turn profile card back to portrait"
            : "Turn profile card to see education and internship availability"
        }
        aria-describedby="profile-card-instructions"
        aria-pressed={flipped}
        data-pressed={pressed || undefined}
        data-dragging={dragging || undefined}
        style={{
          rotateX: reduce ? 0 : tiltX,
          rotateY: reduce ? 0 : tiltY,
          scale: reduce ? 1 : liftSpring,
        }}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") poseAt(event);
        }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={cancelGesture}
        onLostPointerCapture={() => {
          if (gesture.current) cancelGesture();
        }}
        onPointerLeave={() => {
          if (!gesture.current) resetPose();
        }}
        onBlur={cancelGesture}
        onDragStart={(event) => event.preventDefault()}
        onClick={click}
      >
        <motion.div
          className="profile-rotor"
          style={{ rotateY: reduce ? (flipped ? 180 : 0) : turnSpring }}
        >
          <div className="profile-face profile-front" aria-hidden={flipped}>
            <motion.img
              src={profile.portrait}
              alt={`Portrait of ${profile.name}`}
              width="413"
              height="590"
              fetchPriority="high"
              draggable={false}
              style={{
                x: reduce ? 0 : imageX,
                y: reduce ? 0 : imageY,
                scale: 1.045,
              }}
            />
            <div className="profile-card-top">
              <span>
                <span className="status-dot" />
                Software Engineering
              </span>
              <span>
                <RotateCw size={12} /> DRAG / TAP
              </span>
            </div>
            <div className="profile-caption">
              <div className="profile-caption-name">{profile.name}</div>
              <p>Software Engineering · UMS</p>
              <div className="profile-caption-bottom">
                <span>
                  <Braces size={13} /> Learning through practice
                </span>
                <ArrowUpRight size={17} />
              </div>
            </div>
            {glareLayer}
          </div>
          <div className="profile-face profile-back" aria-hidden={!flipped}>
            <span className="back-card-label">
              THE PERSON BEHIND THE PROJECTS
            </span>
            <GraduationCap size={40} />
            <h3>{profile.university}</h3>
            <p>{profile.programmeName}</p>
            <div className="back-card-availability">
              <span className="status-dot" />
              Internship availability<strong>{shortAvailability}</strong>
            </div>
            <span className="back-card-hint">
              <RotateCw size={13} /> Drag or tap to turn back
            </span>
            {glareLayer}
          </div>
        </motion.div>
      </motion.button>
      <span id="profile-card-instructions" className="sr-only">
        Drag left or right to turn the card, or tap to flip. Use Enter or Space
        with a keyboard. Vertical swipes scroll the page.
      </span>
    </div>
  );
}
