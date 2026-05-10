import React from 'react';
import { useCurrentFrame } from 'remotion';
import { GOLD, GOLD_DIM } from '../utils/colors';
import { seed } from '../utils/easings';

interface Props {
  width?: number;
  height?: number;
  opacity?: number;
  animated?: boolean;
}

const CANDLES = Array.from({ length: 28 }, (_, i) => {
  const isGreen = seed(i + 10) > 0.42;
  const bodyH = seed(i + 20) * 60 + 20;
  const wickTop = seed(i + 30) * 25 + 5;
  const wickBot = seed(i + 40) * 20 + 3;
  const yBase = 60 + seed(i + 50) * 30;
  return { isGreen, bodyH, wickTop, wickBot, yBase };
});

export const CandleChart: React.FC<Props> = ({
  width = 1080,
  height = 400,
  opacity = 0.18,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const candleW = width / CANDLES.length;

  return (
    <svg width={width} height={height} style={{ opacity }}>
      {CANDLES.map((c, i) => {
        const x = i * candleW + candleW / 2;
        const progress = animated
          ? Math.min(1, Math.max(0, (frame - i * 3) / 30))
          : 1;
        const bodyY = height - c.yBase - c.bodyH * progress;
        const bodyHeight = c.bodyH * progress;
        const wickX = x;
        const wickTopY = bodyY - c.wickTop * progress;
        const wickBotY = height - c.yBase + c.wickBot * progress;
        const color = c.isGreen ? GOLD : GOLD_DIM;

        return (
          <g key={i}>
            <line
              x1={wickX} y1={wickTopY}
              x2={wickX} y2={wickBotY}
              stroke={color} strokeWidth={1.5} strokeOpacity={0.7}
            />
            <rect
              x={x - candleW * 0.3}
              y={bodyY}
              width={candleW * 0.6}
              height={Math.max(bodyHeight, 1)}
              fill={color}
              rx={2}
            />
          </g>
        );
      })}
    </svg>
  );
};
