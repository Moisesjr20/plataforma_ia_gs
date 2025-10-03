module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'src/vite-env.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
}