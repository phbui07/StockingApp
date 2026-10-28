import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import type {ChartPoint} from '../services/marketData';

interface PriceChartProps {
  points: ChartPoint[];
  width: number;
  height?: number;
  color: string;
  formatValue: (value: number) => string;
  formatTime: (t: number) => string;
}

// Area chart with a press-and-drag tooltip. Values are shifted so the y-axis
// spans the data's own range instead of starting at zero.
const PriceChart: React.FC<PriceChartProps> = ({
  points,
  width,
  height = 180,
  color,
  formatValue,
  formatTime,
}) => {
  const {data, maxValue} = useMemo(() => {
    const values = points.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.1 || Math.abs(max) * 0.01 || 1;
    const base = min - pad;
    return {
      data: points.map(p => ({value: p.value - base, price: p.value, t: p.t})),
      maxValue: max + pad - base,
    };
  }, [points]);

  if (points.length < 2) {
    return <View style={{width, height}} />;
  }

  return (
    <LineChart
      areaChart
      data={data}
      width={width}
      height={height}
      maxValue={maxValue}
      noOfSections={4}
      spacing={width / (data.length - 1)}
      initialSpacing={0}
      endSpacing={0}
      disableScroll
      hideDataPoints
      hideRules
      hideYAxisText
      yAxisLabelWidth={0}
      yAxisThickness={0}
      xAxisThickness={0}
      color={color}
      thickness={2}
      startFillColor={color}
      endFillColor={color}
      startOpacity={0.25}
      endOpacity={0}
      pointerConfig={{
        pointerStripHeight: height,
        pointerStripColor: '#76787E',
        pointerStripWidth: 1,
        pointerColor: color,
        radius: 4,
        pointerLabelWidth: 120,
        pointerLabelHeight: 44,
        activatePointersOnLongPress: false,
        autoAdjustPointerLabelPosition: true,
        // gifted-charts calls this as a function, not as a component type.
        // eslint-disable-next-line react/no-unstable-nested-components
        pointerLabelComponent: (items: {price: number; t: number}[]) => (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipValue}>
              {formatValue(items[0].price)}
            </Text>
            <Text style={styles.tooltipTime}>{formatTime(items[0].t)}</Text>
          </View>
        ),
      }}
    />
  );
};

export default PriceChart;

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: '#2C2C2C',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  tooltipValue: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  tooltipTime: {
    color: '#76787E',
    fontSize: 11,
  },
});
