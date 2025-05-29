module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:security/recommended",
    "plugin:@typescript-eslint/strict",
  ],
  ignorePatterns: ["dist", ".eslintrc.js", "vite.config.ts"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    "react",
    "react-hooks",
    "react-refresh",
    "@typescript-eslint",
    "security",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // React specific rules
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",

    // Security rules
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-possible-timing-attacks": "error",
    "security/detect-pseudoRandomBytes": "error",

    // General code quality rules
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "arrow-spacing": "error",
    "comma-dangle": ["error", "always-multiline"],
    semi: ["error", "always"],
    quotes: ["error", "single", { avoidEscape: true }],
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    "brace-style": ["error", "1tbs", { allowSingleLine: false }],
    indent: ["error", 2, { SwitchCase: 1 }],
    "max-len": ["warn", { code: 100, ignoreUrls: true }],
    "no-trailing-spaces": "error",
    "eol-last": "error",
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "security/detect-object-injection": "off",
      },
    },
  ],
};
