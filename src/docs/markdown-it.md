# Markdown-it: From Stuck to Started

**markdown-it** has 3 presets to achieve your preferred combinations of active rules and options rapidly. The `zero` mode disables all rules in markdown-it and allow you to enable everything you need. The `commonmark` is oriented to the strict commonmark regulation for markdown syntax, which enables paragraph, list and more basic markdown elements but disables tables and more platform-flavored markdown syntax. It's recommended to use `default` mode that is similar to GFM (GitHub Flavored Markdown), enabling all available rules, but still without html, typographer & autolinker. The full option list is shown as bellows:

```typescript
const md = markdownit(
  // disables user to directly write HTML. e.g. <div class="box"> xxx </div> -> &lt;div class="box"&gt; xxx &lt;/div&gt;
  html: false,

  // Use '/' to close single tags (<br />).
  // In XML syntax, all tags need to be closed explicitly.
  xhtmlOut: false,

  // Convert '\n' in paragraphs into <br>
  // Normally, only '\n\n' will be converted to <br>
  breaks: false,

  // CSS language prefix for fenced blocks. Can be useful for external highlighters.
  // the class name in <code class="langPrefix-js"> is influenced
  langPrefix: 'language-',

  // Autoconvert URL-like text to links
  linkify: false,

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
  typographer: false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre... internal wrapper is skipped.
  // recommended to use with highlight.js
  highlight: function (/*str, lang*/) {
    return '';
  },
});
```
