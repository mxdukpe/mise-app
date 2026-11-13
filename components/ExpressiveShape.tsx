import React, { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

export type ShapeName = 'flower' | 'cookie' | 'clover' | 'sunny' | 'circle';

// Rayon polaire de chaque forme, mêmes formules que `shapePath` du design system.
const RADIUS: Record<ShapeName, (t: number) => number> = {
  flower: (t) => 1 + 0.16 * Math.cos(8 * t),
  cookie: (t) => 1 + 0.07 * Math.cos(9 * t),
  clover: (t) => 0.78 + 0.22 * Math.abs(Math.cos(2 * t)),
  sunny: (t) => 1 + 0.09 * Math.cos(12 * t),
  circle: () => 1,
};

export function shapePath(name: ShapeName, size: number) {
  const f = RADIUS[name];
  const R = size / 2 / 1.17;
  const c = size / 2;
  let d = '';
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    const r = R * f(t);
    d += (i ? 'L' : 'M') + (c + r * Math.cos(t)).toFixed(2) + ' ' + (c + r * Math.sin(t)).toFixed(2);
  }
  return d + 'Z';
}

export function ExpressiveShape({ name, size, color }: { name: ShapeName; size: number; color: string }) {
  const d = useMemo(() => shapePath(name, size), [name, size]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={d} fill={color} />
    </Svg>
  );
}
