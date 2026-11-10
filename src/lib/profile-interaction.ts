export type GestureAxis = "pending" | "horizontal" | "vertical";

export function resolveGestureAxis(dx: number, dy: number): GestureAxis {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return "pending";
  // A diagonal gesture favours normal page scrolling.
  return Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
}

export function settleProfileTurn(
  baseTurn: number,
  distance: number,
  width: number,
  velocity: number,
): number {
  if (Math.abs(distance) >= Math.max(width, 1) * 0.2) {
    return baseTurn + Math.sign(distance);
  }
  if (Math.abs(distance) >= 16 && Math.abs(velocity) >= 0.55) {
    return baseTurn + Math.sign(velocity);
  }
  return baseTurn;
}
