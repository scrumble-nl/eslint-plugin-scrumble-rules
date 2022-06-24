const {tsPaths} = require('./get-tsconfig-paths');

const TYPES = {
    REACT: 0,
    REACT_NATIVE: 1,
    EXTERNAL: 2,
    LOCAL: 3,
    CSS: 4,
    WHITESPACE: 5,
};

const getNodeType = node => {
    if (node.source.value === 'react') {
        return TYPES.REACT;
    }

    if (node.source.value === 'react-native') {
        return TYPES.REACT_NATIVE;
    }

    if (node.source.value.endsWith('css')) {
        return TYPES.CSS;
    }

    if (
        node.source.value.startsWith('.') ||
        tsPaths.some(path => node.source.value.startsWith(path))
    ) {
        return TYPES.LOCAL;
    }

    return TYPES.EXTERNAL;
};

const stringifyImports = imports => {
    let result = '';

    for (const importNode of imports) {
        if (importNode.importType === TYPES.WHITESPACE) {
            result += '\n';

            continue;
        }

        let importString = 'import';

        const defaultSpecifiers = [];
        const importSpecifiers = [];

        for (const specifier of importNode.node.specifiers) {
            if (specifier.type === 'ImportDefaultSpecifier') {
                defaultSpecifiers.push(specifier.local.name);
            } else if (specifier.type === 'ImportSpecifier') {
                const specifierName = specifier.local.name;
                const imported = specifier.imported?.name ?? specifierName;

                if (specifierName !== imported) {
                    importSpecifiers.push(`${imported} as ${specifierName}`);
                } else {
                    importSpecifiers.push(specifier.local.name);
                }
            }
        }

        if (defaultSpecifiers.length !== 0) {
            importString += ` ${defaultSpecifiers.join(', ')}`;
        }

        if (importSpecifiers.length !== 0) {
            if (defaultSpecifiers.length !== 0) {
                importString += ',';
            }

            importString += ` {${importSpecifiers.join(', ')}}`;
        }

        if (importSpecifiers.length !== 0 || defaultSpecifiers.length !== 0) {
            importString += ' from';
        }

        result += `${importString} ${importNode.node.source.raw};\n`;
    }

    return result.trim();
};

exports.formatImportNodes = programNode => {
    const range = [Infinity, 0];
    const importTypes = [[], [], [], [], []];
    let isNative = false;

    programNode.body
        .filter(node => node.type === 'ImportDeclaration')
        .forEach(node => {
            if (node.range[0] < range[0]) {
                range[0] = node.range[0];
            }

            if (node.range[1] > range[1]) {
                range[1] = node.range[1];
            }

            const importType = getNodeType(node);

            if (importType === TYPES.REACT_NATIVE) {
                isNative = true;
            }

            importTypes[importType].push({
                node,
                importType,
                startLine: node.loc.start.line,
                endLine: node.loc.end.line,
                source: node.source.value,
                length: node.range[1] - node.range[0],
            });
        });

    for (let i = 0; i < importTypes.length; i++) {
        if (i === TYPES.CSS) {
            continue;
        }

        importTypes[i].sort((nodeA, nodeB) => {
            const typeDiff = nodeA.importType - nodeB.importType;

            if (typeDiff !== 0) {
                return typeDiff;
            }

            return nodeA.length - nodeB.length;
        });
    }

    const imports = [];

    importTypes.forEach((importType, index) => {
        if (importType.length === 0) {
            return;
        }

        imports.push(...importType);

        if (index !== TYPES.CSS && !(index === TYPES.REACT && isNative)) {
            imports.push({
                importType: TYPES.WHITESPACE,
            });
        }
    });

    return {imports, range};
};

exports.validateImports = (imports, range, context) => {
    let offset = 0;

    for (let line = 0; line < imports.length; line++) {
        const currentImport = imports[line];

        if (currentImport.importType === TYPES.WHITESPACE) {
            continue;
        }

        if (currentImport.startLine !== line + 1 + offset) {
            context.report({
                messageId: 'sort',
                loc: {
                    start: currentImport.node.range[0],
                    end: currentImport.node.range[1],
                },

                fix: fixer => {
                    return fixer.replaceTextRange(
                        range,
                        stringifyImports(imports),
                    );
                },
            });

            return;
        }

        offset += currentImport.endLine - currentImport.startLine;
    }
};
