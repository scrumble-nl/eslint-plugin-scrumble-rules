const {formatImportNodes, validateImports} = require('../helpers/sort-imports');

module.exports = {
    meta: {
        type: 'layout',
        docs: {
            description: 'Sort imports',
            category: 'Fill me in',
            recommended: true,
            url: null,
        },
        fixable: 'code',
        schema: [],
        messages: {
            sort: 'Pls sort',
        },
    },

    create: context => {
        return {
            Program: programNode => {
                const {imports, range} = formatImportNodes(programNode);

                validateImports(imports, range, context);
            },
        };
    },
};
