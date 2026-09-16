export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function sectionProgress(top: number, height: number, viewport: number): number {
  return clamp(-top / Math.max(1, height - viewport));
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function ribbonPoint(angle: number, across: number): Point3D {
  const radius = 1.12 + across * Math.cos(angle / 2);
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle) * 1.23,
    z: across * Math.sin(angle / 2),
  };
}

export function projectPoint(point: Point3D, rotation: number, tilt: number, size: number): Point3D {
  const x = point.x * Math.cos(rotation) + point.z * Math.sin(rotation);
  const z = -point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
  const y = point.y * Math.cos(tilt) - z * Math.sin(tilt);
  const depth = point.y * Math.sin(tilt) + z * Math.cos(tilt);
  const perspective = 4.7 / (4.7 + depth);
  const lean = -0.3;
  return {
    x: (x * Math.cos(lean) - y * Math.sin(lean)) * size * perspective,
    y: (x * Math.sin(lean) + y * Math.cos(lean)) * size * perspective,
    z: depth,
  };
}
