const {checkIgnores} = require('../helpers/ignore-explanations');

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Require an explanation for @ts-ignore and @ts-expect-error',
            category: 'Best practices',
            recommended: true,
        },
        hasSuggestions: true,
        schema: [],
        messages: {
            ignoreExplanation: 'Pls add why',
            addExplanation:
                "Add an explanation after the ignore, e.g: ' reason for ignoring'.",
        },
    },

    create: context => {
        return {
            Program: () => {
                checkIgnores(context);
            },
        };
    },
};
