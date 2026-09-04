'use strict';

/**
 * Semantic colour roles carry no numeric scale.
 *
 * In a semantic token set (Untitled UI, and most Tailwind setups that name roles
 * rather than hues) the role IS the value: `text-primary`, `bg-secondary`. There
 * is no `--color-primary-900`, so `text-primary-900` compiles to nothing at all.
 * Nothing errors, nothing is logged — the element simply inherits, which is
 * usually black on white and looks close enough to survive review. One project
 * had accumulated forty of them before anyone noticed.
 *
 * Numbered forms of real ramps (`text-brand-600`, `bg-gray-50`) are correct and
 * left alone; only the configured role names are flagged.
 *
 * Off by default: a project that genuinely defines `--color-primary-900` would
 * see false positives, so this is opt-in rather than part of `recommended`.
 */
const DEFAULT_ROLES = ['primary', 'secondary', 'tertiary', 'quaternary'];
const DEFAULT_PROPERTIES = [
    'text',
    'bg',
    'border',
    'ring',
    'fill',
    'stroke',
    'divide',
    'outline',
    'shadow',
    'decoration',
    'placeholder',
    'caret',
    'accent',
];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow a numeric scale on semantic colour roles, which compiles to nothing and silently inherits',
            category: 'Possible errors',
            recommended: false,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    roles: {
                        type: 'array',
                        items: {type: 'string'},
                        minItems: 1,
                    },
                    properties: {
                        type: 'array',
                        items: {type: 'string'},
                        minItems: 1,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            numberedRole:
                '`{{className}}` does not exist: `{{role}}` is a semantic role, not a ramp, so it has no numeric scale. This compiles to nothing and the element inherits its colour — usually black. Use `{{suggestion}}`.',
        },
    },

    create: context => {
        const options = context.options[0] ?? {};
        const roles = options.roles ?? DEFAULT_ROLES;
        const properties = options.properties ?? DEFAULT_PROPERTIES;

        // A leading `-` allows the negative/`!` and variant forms Tailwind
        // permits (`hover:text-primary-900`, `!bg-secondary-50`) without listing
        // every variant: the boundary is the class separator, not the string.
        const pattern = new RegExp(
            `(?<![\\w-])(${properties.join('|')})-(${roles.join('|')})-(\\d+)(?![\\w-])`,
            'g',
        );

        const report = (node, text) => {
            for (const match of text.matchAll(pattern)) {
                const [className, property, role] = match;

                context.report({
                    node,
                    messageId: 'numberedRole',
                    data: {
                        className,
                        role,
                        suggestion: `${property}-${role}`,
                    },
                });
            }
        };

        return {
            Literal: node => {
                if (typeof node.value === 'string') {
                    report(node, node.value);
                }
            },
            TemplateElement: node => {
                if (typeof node.value?.raw === 'string') {
                    report(node, node.value.raw);
                }
            },
        };
    },
};
