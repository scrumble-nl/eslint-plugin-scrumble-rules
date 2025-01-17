# Eslint plugin scrumble rules

Eslint plugin for custom rules used by Scrumble. Currently only import sorting is included

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `@scrumble-nl/eslint-plugin-scrumble-rules`:

```sh
npm i@scrumble-nl/eslint-plugin-scrumble-rules --save-dev
```

## Usage

Add `@scrumble-nl/scrumble-rules` to the plugins section of your `.eslintrc` or `eslint.config.mjs` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@scrumble-nl/scrumble-rules"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@scrumble-nl/scrumble-rules/sort-imports": "warn",
        "@scrumble-nl/scrumble-rules/ignore-comment": "warn"
    }
}
```

## Supported Rules

- sort-imports
- ignore-comment


