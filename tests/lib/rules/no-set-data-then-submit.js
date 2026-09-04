const rule = require('../../../lib/rules/no-set-data-then-submit');
const plugin = require('../../../lib/plugin');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    plugins: {
        'scrumble-rules': plugin,
    },
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

ruleTester.run('no-set-data-then-submit', rule, {
    valid: [
        // The fix: hand the data to the submit.
        {code: `router.post('/profile', {avatar: file});`},
        // A submit with no preceding set is fine.
        {code: `function save() { form.post('/profile'); }`},
        // setData on its own is fine — it is the pairing that is wrong.
        {code: `function change(v) { form.setData('avatar', v); }`},
        // Something in between means this narrow shape does not apply; the rule
        // is a guard for the obvious case, not dataflow analysis.
        {
            code: `function save() {
    form.setData('avatar', file);
    console.log('picked');
    form.post('/profile');
}`,
        },
        // A different method after setData.
        {
            code: `function save() {
    form.setData('avatar', file);
    form.reset();
}`,
        },
    ],
    invalid: [
        {
            code: `function save() {
    form.setData('avatar', file);
    form.post('/profile');
}`,
            errors: [{messageId: 'staleSubmit', data: {method: 'post'}}],
        },
        {
            code: `function save() {
    form.setData('name', name);
    form.put('/profile');
}`,
            errors: [{messageId: 'staleSubmit', data: {method: 'put'}}],
        },
        // `await` on the submit changes nothing: the stale read already happened.
        {
            code: `async function save() {
    form.setData('avatar', file);
    await form.submit('post', '/profile');
}`,
            errors: [{messageId: 'staleSubmit'}],
        },
        // At the top level of a module, not only inside a function.
        {
            code: `form.setData('a', 1);
form.patch('/x');`,
            errors: [{messageId: 'staleSubmit', data: {method: 'patch'}}],
        },
    ],
});
