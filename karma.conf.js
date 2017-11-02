/* eslint indent: ["error", 2] */
module.exports = function (config) {
  config.set({
    frameworks: [
      "jasmine",
      "fixture"
    ],

    files: [
      "glsl-utilities.js",
      "vector.js",
      "matrix.js",
      "tres.js",
      "mesh-maker.js",
      "test/mesh-test.js",
      "test/matrix-test.js",
      "test/vector-test.js",
      "test/tres-test.js",
      "test/*.html"
    ],

    preprocessors: {
      "test/**/*.html": ["html2js"],
      "*.js": ["coverage"]
    },

    browsers: [
      "Chrome", "Firefox"
    ],

    reporters: [
      "dots",
      "coverage"
    ]
  });
};
