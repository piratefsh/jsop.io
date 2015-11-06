System.config({
  baseURL: "/assets/js",
  defaultJSExtensions: true,
  transpiler: "none",
  paths: {
    "github:*": "jspm/github/*",
    "npm:*": "jspm/npm/*"
  },

  map: {
    "json": "github:systemjs/plugin-json@0.1.0",
    "lodash": "github:lodash/lodash@3.10.1-amd"
  }
});
