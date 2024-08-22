const requireIndex = require('requireindex');

const plugin = {
    meta: {
        name: 'scrumble-rules',
    },

    rules: requireIndex(__dirname + '/rules'),
};

module.exports = plugin;
