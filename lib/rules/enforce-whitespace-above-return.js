'use strict';

module.exports = {
    meta: {
        type: 'layout',
        docs: {
            description: 'Enforce whitespace above return statements',
            category: 'Stylistic issues',
            recommended: false,
        },
        fixable: 'whitespace',
        schema: [],
        messages: {
            missingWhitespace:
                'Expected blank line before this return statement.',
        },
    },

    create: context => {
        const sourceCode = context.getSourceCode();

        const FUNCTION_TYPES = new Set([
            'FunctionDeclaration',
            'FunctionExpression',
            'ArrowFunctionExpression',
        ]);

        const LOOP_TYPES = new Set([
            'ForStatement',
            'ForInStatement',
            'ForOfStatement',
            'WhileStatement',
            'DoWhileStatement',
        ]);

        function isFunctionNode(node) {
            return node && FUNCTION_TYPES.has(node.type);
        }

        function isLoopNode(node) {
            return node && LOOP_TYPES.has(node.type);
        }

        function isFirstInBlock(node, block) {
            return !!(
                block &&
                block.type === 'BlockStatement' &&
                block.body[0] === node
            );
        }

        function isImmediatelyAfterAllowedBlockCloser(node) {
            const parentNode = node.parent;

            if (!parentNode || parentNode.type !== 'BlockStatement')
                return false;

            const index = parentNode.body.indexOf(node);
            if (index <= 0) return false;

            const previousStatement = parentNode.body[index - 1];
            if (!previousStatement) return false;

            const previousToken = sourceCode.getTokenBefore(node, {
                includeComments: false,
            });

            if (!previousToken || previousToken.value !== '}') return false;

            return (
                previousStatement.type === 'IfStatement' ||
                isLoopNode(previousStatement) ||
                previousStatement.type === 'FunctionDeclaration'
            );
        }

        function isFirstStatementInIf(node) {
            const parentNode = node.parent;

            if (!parentNode) return false;

            if (parentNode.type === 'IfStatement') {
                return (
                    parentNode.consequent === node ||
                    parentNode.alternate === node
                );
            }

            if (parentNode.type !== 'BlockStatement') return false;

            const grandparentNode = parentNode.parent;

            if (
                !grandparentNode ||
                grandparentNode.type !== 'IfStatement' ||
                (grandparentNode.consequent !== parentNode &&
                    grandparentNode.alternate !== parentNode)
            ) {
                return false;
            }

            return isFirstInBlock(node, parentNode);
        }

        function isFirstStatementInLoop(node) {
            const parentNode = node.parent;

            if (!parentNode) return false;

            if (isLoopNode(parentNode)) return parentNode.body === node;

            if (parentNode.type !== 'BlockStatement') return false;

            const grandparentNode = parentNode.parent;

            if (
                !grandparentNode ||
                !isLoopNode(grandparentNode) ||
                grandparentNode.body !== parentNode
            ) {
                return false;
            }

            return isFirstInBlock(node, parentNode);
        }

        function isFirstStatementInFunction(node) {
            const parentNode = node.parent;

            if (!parentNode || parentNode.type !== 'BlockStatement')
                return false;

            const grandparentNode = parentNode.parent;

            if (!isFunctionNode(grandparentNode)) return false;

            return isFirstInBlock(node, parentNode);
        }

        function isFirstStatementInAllowedContext(node) {
            return (
                isFirstStatementInFunction(node) ||
                isFirstStatementInIf(node) ||
                isFirstStatementInLoop(node)
            );
        }

        return {
            ReturnStatement(node) {
                if (
                    isFirstStatementInAllowedContext(node) ||
                    isImmediatelyAfterAllowedBlockCloser(node)
                ) {
                    return;
                }

                const previousToken = sourceCode.getTokenBefore(node, {
                    includeComments: false,
                });

                if (!previousToken) return;

                if (previousToken.loc.end.line === node.loc.start.line - 1) {
                    context.report({
                        node,
                        messageId: 'missingWhitespace',
                        fix(fixer) {
                            return fixer.insertTextAfter(previousToken, '\n');
                        },
                    });
                }
            },
        };
    },
};
