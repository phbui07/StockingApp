import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width,
  height,
  color,
  strokeWidth = 1.5,
}) => {
  if (data.length < 2) {
    return <View style={{width, height}} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const usable = height - strokeWidth * 2;
  const path = data
    .map((value, i) => {
      const x = i * step;
      const y = strokeWidth + usable - ((value - min) / span) * usable;
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default Sparkline;
