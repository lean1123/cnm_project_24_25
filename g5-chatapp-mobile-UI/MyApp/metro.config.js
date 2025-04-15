// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add any custom config here
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'socket.io-client': require.resolve('socket.io-client'),
  'date-fns': require.resolve('date-fns'),
  '@react-native-community/datetimepicker': require.resolve('@react-native-community/datetimepicker'),
};

module.exports = config; 