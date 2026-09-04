const rule = require('../../../lib/rules/no-numbered-semantic-color');
const plugin = require('../../../lib/plugin');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    plugins: {
        'scrumble-rules': plugin,
    },
});

ruleTester.run('no-numbered-semantic-color', rule, {
    valid: [
        // The role on its own is the whole token.
        {code: `const c = 'text-primary';`},
        {code: `const c = 'bg-secondary hover:bg-tertiary';`},
        // Real ramps DO have a scale, and are the common case.
        {
            code: `const c = 'text-brand-600 bg-gray-50 border-utility-error-500';`,
        },
        // A role name inside a longer word is not a token.
        {code: `const c = 'text-primary-ish-900';`},
        {code: `const c = 'my-primary-900-thing';`},
        // The class must START here: these exercise the lookbehind, without
        // which `subtext-primary-900` reports a class that does not appear.
        {code: `const c = 'subtext-primary-900';`},
        {code: `const c = 'card-text-primary-900';`},
        // ...and END here: the lookahead, without which a longer token whose
        // prefix happens to match is reported.
        {code: `const c = 'text-primary-900px';`},
        {code: `const c = 'text-primary-900-alt';`},
        // A variant separator is not a word character, so this IS the class and
        // must still be caught — the lookbehind must not swallow it.
        {code: `const c = 'text-brand-600';`},
        // Not a colour property.
        {code: `const c = 'grid-primary-900';`},
        // Configurable: a project that really defines the scale opts out.
        {
            code: `const c = 'text-primary-900';`,
            options: [{roles: ['brandish']}],
        },
    ],
    invalid: [
        {
            code: `const c = 'text-primary-900';`,
            errors: [
                {
                    messageId: 'numberedRole',
                    data: {
                        className: 'text-primary-900',
                        role: 'primary',
                        suggestion: 'text-primary',
                    },
                },
            ],
        },
        // Variants still resolve to the same broken class.
        {
            code: `const c = 'hover:bg-secondary-50';`,
            errors: [{messageId: 'numberedRole'}],
        },
        // Template literals are where these hide in conditional class strings.
        {
            code: 'const c = `flex ${x} border-tertiary-300`;',
            errors: [{messageId: 'numberedRole'}],
        },
        // Several in one string are several problems.
        {
            code: `const c = 'text-primary-900 bg-quaternary-25';`,
            errors: [{messageId: 'numberedRole'}, {messageId: 'numberedRole'}],
        },
        {
            code: `const c = 'divide-quaternary-200';`,
            options: [{properties: ['divide'], roles: ['quaternary']}],
            errors: [{messageId: 'numberedRole'}],
        },
    ],
});
