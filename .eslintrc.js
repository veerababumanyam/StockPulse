module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
    'prettier',
    'folders',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // Base ESLint rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': 'off', // Handled by TypeScript
    'no-duplicate-imports': 'error',
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_', 
    }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/naming-convention': [
      'error',
      // Interface names should be PascalCase
      {
        selector: 'interface',
        format: ['PascalCase'],
      },
      // Type aliases should be PascalCase
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      // Enum names should be PascalCase
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      // Variables should be camelCase
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
      // Functions should be camelCase
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      // Class names should be PascalCase
      {
        selector: 'class',
        format: ['PascalCase'],
      },
    ],
    
    // React rules
    'react/prop-types': 'off', // We're using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
    
    // Import rules
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',
    
    // Folder structure rules
    'folders/match-regex': [
      'warn',
      {
        'src/components/': '^([a-z0-9]+(?:-[a-z0-9]+)*)$', // kebab-case folder names for components
        'src/hooks/': '^use[A-Z][a-zA-Z0-9]*$', // camelCase starting with 'use' for hooks
        'src/contexts/': '^[A-Z][a-zA-Z0-9]*Context$', // PascalCase ending with 'Context'
        'src/lib/': '^[a-z0-9]+(?:-[a-z0-9]+)*$', // kebab-case for utility files
        'src/utils/': '^[a-z0-9]+(?:-[a-z0-9]+)*$', // kebab-case for utility files
      }
    ],
    
    // Prettier integration
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
    {
      // Test files can have different rules
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}; 