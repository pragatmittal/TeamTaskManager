import globals from 'globals';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const reactJsxRuntime = react.configs.flat['jsx-runtime'];

export default [
  { ignores: ['**/node_modules/**', 'client/dist', 'dist'] },
  {
    ...js.configs.recommended,
    files: ['server/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['client/**/*.{js,jsx}'],
    ...js.configs.recommended,
    ...reactJsxRuntime,
    plugins: {
      ...reactJsxRuntime.plugins,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ...reactJsxRuntime.languageOptions,
      globals: { ...globals.browser },
    },
    rules: {
      ...reactJsxRuntime.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
];
