import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {vh, vw} from '../services/styleSheet';

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Đang tải...',
  size = 'large',
  color = '#FFED4B',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size={size} color={color} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

const LoadingOverlay: React.FC<LoadingComponentProps> = ({
  message = 'Đang xử lý...',
  size = 'large',
  color = '#FFED4B',
}) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size={size} color={color} />
        <Text style={styles.overlayText}>{message}</Text>
      </View>
    </View>
  );
};

const SkeletonLoader: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map(item => (
        <View key={item} style={styles.skeletonItem}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
          </View>
          <View style={styles.skeletonPrice}>
            <View style={[styles.skeletonLine, styles.skeletonPrice80]} />
            <View style={[styles.skeletonLine, styles.skeletonPrice50]} />
          </View>
        </View>
      ))}
    </View>
  );
};

export {LoadingComponent, LoadingOverlay, SkeletonLoader};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingBox: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(6),
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: vh(2),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(6),
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: vh(2),
  },
  skeletonContainer: {
    paddingHorizontal: vw(5),
  },
  skeletonItem: {
    backgroundColor: '#2C2C2C',
    borderRadius: vw(3),
    padding: vw(4),
    marginBottom: vh(1.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: vw(12),
    height: vw(12),
    borderRadius: vw(6),
    backgroundColor: '#404040',
    marginRight: vw(3),
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#404040',
    borderRadius: 6,
    marginBottom: vh(0.5),
  },
  skeletonPrice: {
    alignItems: 'flex-end',
  },
  skeletonLineShort: {
    width: '60%',
  },
  skeletonPrice80: {
    width: 80,
  },
  skeletonPrice50: {
    width: 50,
  },
});