const plugin = require('./plugin');

module.exports = {
    ...plugin,
    configs: {
        recommended: {
            plugins: {
                'scrumble-rules': plugin,
            },
            rules: {
                'scrumble-rules/sort-imports': 'warn',
                'scrumble-rules/ignore-comment': 'warn',
                'scrumble-rules/enforce-whitespace-above-return': 'warn',
            },
        },
    },
};
