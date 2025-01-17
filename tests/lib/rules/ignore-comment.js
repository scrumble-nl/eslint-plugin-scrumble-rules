const rule = require('../../../lib/rules/ignore-comment');
const plugin = require('../../../lib/plugin');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    plugins: {
        'scrumble-rules': plugin,
    },
});

ruleTester.run('ignore-comment', rule, {
    valid: [
        {
            code: `// @ts-ignore Typescript doesn't like this
const value = "string";`,
        },
        {
            code: `// @ts-expect-error This is for demonstration purposes
const value = "string";`,
        },
    ],
    invalid: [
        {
            code: `// @ts-ignore`,
            errors: [
                {
                    messageId: 'ignoreExplanation',
                    suggestions: [
                        {
                            messageId: 'addExplanation',
                            output: `// @ts-ignore Add a reason why this is ignored`,
                        },
                    ],
                },
            ],
        },
        {
            code: `// @ts-expect-error`,
            errors: [
                {
                    messageId: 'ignoreExplanation',
                    suggestions: [
                        {
                            messageId: 'addExplanation',
                            output: `// @ts-expect-error Add a reason why this is ignored`,
                        },
                    ],
                },
            ],
        },
    ],
});
