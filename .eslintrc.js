module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': 'standard',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'rules': {
    'curly': ['error', 'multi-or-nest'],
    'indent': ['error', 2],
    'key-spacing': ['error', { 'align': 'value' }],
    'no-multi-spaces': [
      'error', {
        'exceptions': {
          'Property': true,
          'VariableDeclarator': true
        }
      }
    ],
    'no-return-assign': ['off'],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never']
  }
};
