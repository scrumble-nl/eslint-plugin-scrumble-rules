const {RuleTester} = require('eslint');
const rule = require('../../../lib/rules/enforce-whitespace-above-return');

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        parserOptions: {ecmaFeatures: {jsx: true}},
    },
});

ruleTester.run('enforce-whitespace-above-return (react/jsx)', rule, {
    valid: [
        {
            filename: 'valid-hello-blank-line.jsx',
            code: `
function Hello() {
  const name = "World";

  return <div>Hello {name}</div>;
}
      `,
        },
        {
            filename: 'valid-hello-no-blank-line.jsx',
            code: `
function Hello() {
  return <div>Hello</div>;
}
      `,
        },
        {
            filename: 'valid-app-render-no-blank-line.jsx',
            code: `
class App extends React.Component {
  render() {
    return <main>Hi</main>;
  }
}
      `,
        },
        {
            filename: 'valid-hello-conditional-no-blank-line.jsx',
            code: `
function Hello({ show }) {
  if (show) {
    return <span/>;
  }
  return null;
}
      `,
        },
        {
            filename: 'valid-list-callback-no-blank-line.jsx',
            code: `
function List({ items }) {
  return items.map(item => {
    return <li key={item.id}>{item.label}</li>;
  });
}
      `,
        },
        {
            filename: 'valid-for-loop-no-blank-line.jsx',
            code: `
function findItem(items, targetId) {
  for (const item of items) {
    if (item.id === targetId) {
      return item;
    }
  }
  return null;
}
      `,
        },
    ],
    invalid: [
        {
            filename: 'invalid-hello-missing-blank-line.jsx',
            code: `
function Hello() {
  const name = "World";
  return <div>Hello {name}</div>;
}
      `,
            output: `
function Hello() {
  const name = "World";

  return <div>Hello {name}</div>;
}
      `,
            errors: [{messageId: 'missingWhitespace'}],
        },
        {
            filename: 'invalid-app-render-missing-blank-line.jsx',
            code: `
class App extends React.Component {
  render() {
    const x = 1;
    return <main>{x}</main>;
  }
}
      `,
            output: `
class App extends React.Component {
  render() {
    const x = 1;

    return <main>{x}</main>;
  }
}
      `,
            errors: [{messageId: 'missingWhitespace'}],
        },
        {
            filename: 'invalid-button-handle-missing-blank-line.jsx',
            code: `
function Button({ onClick }) {
  function handle() {
    const ok = true;
    return ok;
  }
  return <button onClick={handle}>Go</button>;
}
      `,
            output: `
function Button({ onClick }) {
  function handle() {
    const ok = true;

    return ok;
  }
  return <button onClick={handle}>Go</button>;
}
      `,
            errors: [{messageId: 'missingWhitespace'}],
        },
    ],
});
