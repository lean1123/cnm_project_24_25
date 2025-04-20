module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    ["@babel/plugin-transform-class-properties", { loose: false }],
    ["@babel/plugin-transform-private-methods", { loose: false }],
    ["@babel/plugin-transform-private-property-in-object", { loose: false }],
<<<<<<< HEAD
    "react-native-reanimated/plugin",
=======
    "react-native-reanimated/plugin" // LUÔN để cuối cùng theo hướng dẫn của Reanimated
>>>>>>> 366bb9ff7a776c3be9f712bf0806204cd635b047
  ],
};
