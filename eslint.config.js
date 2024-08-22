const eslint = require('@eslint/js');
const prettierConfigsRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = [
    eslint.configs.recommended,
    prettierConfigsRecommended,
    {
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                ...globals.mocha,
                ...globals.node,
            },
        },
    },
];
