# Eslint plugin scrumble rules

Eslint plugin for custom rules used by Scrumble.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `@scrumble-nl/eslint-plugin-scrumble-rules`:

```sh
npm i @scrumble-nl/eslint-plugin-scrumble-rules --save-dev
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
        "@scrumble-nl/scrumble-rules/ignore-comment": "warn",
        "@scrumble-nl/scrumble-rules/enforce-whitespace-above-return": "warn"
    }
}
```

## Supported Rules

Part of `recommended`:

- sort-imports
- ignore-comment
- enforce-whitespace-above-return

Opt-in — correct only where the stated assumption holds, so enable them per
project rather than expecting them from `recommended`:

- **no-numbered-semantic-color** — for a semantic token set (Untitled UI, and
  most Tailwind setups that name roles rather than hues), where the role *is* the
  value: `text-primary`, not `text-primary-900`. The numbered form resolves to no
  CSS at all, so nothing errors and the element simply inherits — usually black
  on white, which is close enough to survive review. One project had forty of
  them. Real ramps (`text-brand-600`, `bg-gray-50`) are untouched.

  Configure `roles` and `properties` if your names differ, or leave it off in a
  project that genuinely defines `--color-primary-900`:

  ```json
  {
      "rules": {
          "@scrumble-nl/scrumble-rules/no-numbered-semantic-color": [
              "error",
              {"roles": ["primary", "secondary", "tertiary", "quaternary"]}
          ]
      }
  }
  ```

- **no-set-data-then-submit** — for Inertia. `setData` schedules React state; it
  does not mutate `data` synchronously, so a submit on the very next line sends
  the *previous* value. The usual symptom is a file upload that silently never
  arrives, and the code reads exactly like what it is meant to do. Pass the
  values to the submit — `router.post(url, data)` — or bind `useForm` data to the
  inputs. Deliberately narrow: only a `setData` statement directly followed by a
  submit, so there are no false positives to argue with.


