const fs = require('fs');
const path = require('path');

const find = fileName => {
    const found = findStartingWith(
        path.dirname(require.main.filename),
        fileName,
    );

    if (found) {
        return found;
    }

    return findStartingWith(
        process.cwd(),
        fileName,
    );
};


const findStartingWith = (start, fileName) => {
    const file = path.join(start, fileName);
    try {
        fs.statSync(file);
        return file;
    } catch (err) {
        if (path.dirname(start) !== start) {
            return findStartingWith(path.dirname(start), fileName);
        }
    }
};

const file = file => {
    try {
        return fs.readFileSync(file, 'utf-8');
    } catch (err) {
        return undefined;
    }
};

const json = filePath => {
    const content = file(filePath);
    return content ? JSON.parse(content) : null;
};

const getTsConfigPaths = tsConfig => {
    return tsConfig?.compilerOptions?.paths
        ? Object.keys(tsConfig?.compilerOptions?.paths).map(
              path => path.split('*')[0],
          )
        : [];
};

const tsConfigPath = find('tsconfig.json');
const tsConfig = json(tsConfigPath);

exports.tsPaths = getTsConfigPaths(tsConfig);
