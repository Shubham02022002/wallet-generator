import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import node from "eslint-plugin-node"; // Import eslint-plugin-node

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    env: {
      browser: true,
      node: true, // Add Node.js environment
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["**/*.js"], // Apply Node.js rules to all JavaScript files
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // Add Node.js globals
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    env: {
      node: true, // Add Node.js environment specifically for these files
    },
    plugins: {
      node, // Add Node.js plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...node.configs.recommended.rules, // Add recommended Node.js rules
    },
  },
];
