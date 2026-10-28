import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {logoUrl} from '../services/marketData';

const StockLogo: React.FC<{symbol: string; size?: number}> = ({
  symbol,
  size = 40,
}) => {
  const [failed, setFailed] = useState(false);
  const uri = logoUrl(symbol);
  const round = {width: size, height: size, borderRadius: size / 2};

  if (!uri || failed) {
    return (
      <View style={[styles.letterCircle, round]}>
        <Text style={[styles.letter, {fontSize: size * 0.42}]}>
          {symbol.replace(/[^A-Za-z0-9]/g, '').charAt(0)}
        </Text>
      </View>
    );
  }
  // White backing keeps dark logos visible on the dark theme.
  return (
    <View style={[styles.imageCircle, round]}>
      <Image
        source={{uri}}
        onError={() => setFailed(true)}
        style={{width: size * 0.7, height: size * 0.7}}
        resizeMode="contain"
      />
    </View>
  );
};

export default StockLogo;

const styles = StyleSheet.create({
  letterCircle: {
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: '#FFED4B',
    fontWeight: 'bold',
  },
  imageCircle: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
