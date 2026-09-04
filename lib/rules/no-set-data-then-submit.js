'use strict';

/**
 * Inertia's `setData` is React state, so a submit on the next line sends the
 * previous value.
 *
 *     form.setData('avatar', file);
 *     form.post('/profile');        // posts WITHOUT avatar
 *
 * `setData` schedules a re-render; it does not mutate `data` synchronously. The
 * submit that follows reads the render's `data`, which is still the old one. The
 * usual symptom is a file upload that silently never arrives, and it survives
 * review because the code reads exactly like what it is meant to do.
 *
 * Pass the values to the submit instead — `router.post(url, data)` — or bind
 * `useForm` data to the inputs so no imperative set is needed.
 *
 * Deliberately narrow: it flags a `setData` statement DIRECTLY followed by a
 * submit. A guard for the common shape, not dataflow analysis, so it has no
 * false positives to argue with.
 */
const SUBMIT_METHODS = new Set(['post', 'put', 'patch', 'delete', 'submit']);

/** The call expression a statement consists of, ignoring `await`. */
const callOf = statement => {
    if (statement?.type !== 'ExpressionStatement') {
        return null;
    }

    const expression =
        statement.expression.type === 'AwaitExpression'
            ? statement.expression.argument
            : statement.expression;

    return expression.type === 'CallExpression' ? expression : null;
};

const methodName = call =>
    call?.callee.type === 'MemberExpression' &&
    call.callee.property.type === 'Identifier'
        ? call.callee.property.name
        : null;

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow submitting an Inertia form on the line after setData, which sends stale data',
            category: 'Possible errors',
            recommended: false,
        },
        schema: [],
        messages: {
            staleSubmit:
                '`setData` is async React state, so `{{method}}` on the next line sends the previous value — the classic silently-missing-file-upload. Pass the data to the submit (`router.{{method}}(url, data)`), or bind useForm data to the inputs.',
        },
    },

    create: context => {
        const check = body => {
            body.forEach((statement, index) => {
                if (methodName(callOf(statement)) !== 'setData') {
                    return;
                }

                const next = callOf(body[index + 1]);
                const method = methodName(next);

                if (method && SUBMIT_METHODS.has(method)) {
                    context.report({
                        node: next,
                        messageId: 'staleSubmit',
                        data: {method},
                    });
                }
            });
        };

        return {
            BlockStatement: node => check(node.body),
            Program: node => check(node.body),
            SwitchCase: node => check(node.consequent),
        };
    },
};
