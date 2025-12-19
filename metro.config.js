// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Garantir que plataformas estão configuradas
if (!config.resolver) {
  config.resolver = {};
}
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;

