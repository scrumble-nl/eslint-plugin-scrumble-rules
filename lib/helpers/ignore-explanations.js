exports.checkIgnores = context => {
    ignoreCheck(context, '@ts-ignore');
    ignoreCheck(context, '@ts-expect-error');
};

const ignoreCheck = (context, ignoreType) => {
    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();

    comments.forEach(comment => {
        const {value, loc} = comment;
        let trimmedValue = value.trim();

        if (trimmedValue.startsWith('//')) {
            trimmedValue = trimmedValue.slice(2).trim();
        }

        if (trimmedValue.startsWith(ignoreType)) {
            const parts = trimmedValue.split(' ');

            if (parts.length <= 1 || parts[1].trim() === '') {
                context.report({
                    node: comment,
                    loc,
                    messageId: 'ignoreExplanation',
                    suggest: [
                        {
                            messageId: 'addExplanation',
                            fix: fixer => {
                                return fixer.insertTextAfter(
                                    comment,
                                    ' Add a reason why this is ignored',
                                );
                            },
                        },
                    ],
                });
            }
        }
    });
};
