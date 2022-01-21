module.exports = {
  env: {
    es6: true,
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: ["prettier", "eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    quotes: ["error", "double"],
    "no-var": "error",
    "no-multi-spaces": ["error", { ignoreEOLComments: true }],
    "prefer-const": "error",
    "no-use-before-define": "error"
  }
};
