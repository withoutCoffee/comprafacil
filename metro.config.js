const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
  // configurações adicionais do metro podem vir aqui
});

module.exports = withNativeWind(config, { input: './global.css' });
