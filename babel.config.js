module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    env: {
      production: {
        // Strip debug logging from release bundles; keep warn/error so real
        // failures still reach the device log for support/diagnosis.
        plugins: [["transform-remove-console", { exclude: ["error", "warn"] }]],
      },
    },
  };
};
