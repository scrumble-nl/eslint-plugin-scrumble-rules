/**
 * @fileoverview Enforce whitespace above return statements
 */

"use strict";

module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce whitespace above return statements",
      category: "Stylistic issues",
      recommended: false,
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingWhitespace: "Expected blank line before this return statement.",
    },
  },

  create: context => {
    const sourceCode = context.sourceCode;

    // Helper functions

    // Check if a node is a function (declaration, expression, or arrow function)
    function isFunctionNode(node) {
      return (
        node &&
        (node.type === "FunctionDeclaration" ||
          node.type === "FunctionExpression" ||
          node.type === "ArrowFunctionExpression")
      );
    }

    // Check if a node is a loop statement
    function isLoopNode(node) {
      return (
        node &&
        (node.type === "ForStatement" ||
          node.type === "ForInStatement" ||
          node.type === "ForOfStatement" ||
          node.type === "WhileStatement" ||
          node.type === "DoWhileStatement")
      );
    }

    // Check if a node is the first statement in a given block
    function isFirstInBlock(node, block) {
      return !!(
        block &&
        block.type === "BlockStatement" &&
        block.body[0] === node
      );
    }

    // Check if the return statement is immediately after a block closer of certain types
    function isImmediatelyAfterAllowedBlockCloser(node) {
      const parentNode = node.parent;

      if (!parentNode || parentNode.type !== "BlockStatement") return false;

      const index = parentNode.body.indexOf(node);
      if (index <= 0) return false;

      const previousStatement = parentNode.body[index - 1];
      if (!previousStatement) return false;

      const previousToken = sourceCode.getTokenBefore(node, {
        includeComments: false,
      });

      if (!previousToken || previousToken.value !== "}") return false;

      return (
        previousStatement.type === "IfStatement" ||
        isLoopNode(previousStatement) ||
        previousStatement.type === "FunctionDeclaration"
      );
    }

    // Check if the return statement is the first statement in certain allowed contexts
    function isFirstStatementInAllowedContext(node) {
      const parentNode = node.parent;

      if (!parentNode) return false;

      // Unbraced single-statement bodies
      if (parentNode.type === "IfStatement")
        return parentNode.consequent === node || parentNode.alternate === node;

      if (isLoopNode(parentNode)) return parentNode.body === node;

      // Braced bodies
      if (parentNode.type === "BlockStatement") {
        const grandparentNode = parentNode.parent;

        if (!grandparentNode) return false;

        if (isFunctionNode(grandparentNode)) return isFirstInBlock(node, parentNode);

        if (
          grandparentNode.type === "IfStatement" &&
          (grandparentNode.consequent === parentNode || grandparentNode.alternate === parentNode)
        ) {
          return isFirstInBlock(node, parentNode);
        }

        if (isLoopNode(grandparentNode) && grandparentNode.body === parentNode) return isFirstInBlock(node, parentNode);

        return false;
      }

      return false;
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
            messageId: "missingWhitespace",
            fix(fixer) {
              return fixer.insertTextAfter(previousToken, "\n");
            },
          });
        }
      },
    };
  },
};
