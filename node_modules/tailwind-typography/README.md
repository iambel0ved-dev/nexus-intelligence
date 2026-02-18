<p>
  <a href="https://tailwindcss.com/docs/typography-plugin#gh-light-mode-only" target="_blank">
    <img src="./.github/logo-light.svg" alt="Tailwind CSS Typography" width="450" height="70">
  </a>
  <a href="https://tailwindcss.com/docs/typography-plugin#gh-dark-mode-only" target="_blank">
    <img src="./.github/logo-dark.svg" alt="Tailwind CSS Typography" width="450" height="70">
  </a>
</p>

A plugin that provides a set of `prose` classes you can use to add beautiful typographic defaults to any vanilla HTML you don't control, like HTML rendered from Markdown, or pulled from a CMS.

This is a fork of the official [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography).

---

## Why

Undoing style by `not-prose` is not working with `target: legacy` in official plugin `@tailwindcss/typography`, See [this issue](https://github.com/tailwindlabs/tailwindcss-typography/issues/277) for more info. In order to use `not-prose` normally in lower version browsers, I fork it and add a new target: `legacy-not-prose`.

In target `legacy-not-prose`, the plugin will generate the code like this:

```css
.prose strong:not([class~="not-prose"] *) {
  color: var(--tw-prose-bold);
  font-weight: 600;
}
.prose ol[type='A']:not([class~="not-prose"] *) {
  list-style-type: upper-alpha;
}
.prose blockquote p:first-of-type:not([class~="not-prose"] *)::before {
  content: open-quote;
}
```

The above code works fine in lower version browsers, except the CSS weights will be a bit of a problem...

## Installation

```sh
npm install -D tailwind-typography
```

## Documentation

For full documentation, visit [tailwindcss.com/docs/typography-plugin](https://tailwindcss.com/docs/typography-plugin).

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discuss the Tailwind CSS Typography plugin on GitHub](https://github.com/tailwindlabs/tailwindcss/discussions)

For casual chit-chat with others using the framework:

[Join the Tailwind CSS Discord Server](https://tailwindcss.com/discord)
