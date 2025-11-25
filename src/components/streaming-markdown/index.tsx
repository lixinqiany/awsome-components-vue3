import { defineComponent } from 'vue';
import markdownIt from 'markdown-it';
import KatexPlugin from './markdown-it-katex/index.ts';
import { shallowRef } from 'vue';
import katex from 'katex';

export default defineComponent({
  name: 'StreamingMarkdown',
  setup() {
    const md = markdownIt({
      html: false,
      linkify: true,
      typographer: true,
    });

    md.use(KatexPlugin, {
      katexRef: shallowRef(katex),
      /**
       * Add block delimiters (like $$, \[) to inline delimiters so that invalid block LaTeX falls back to inline rendering.
       * $$ must be listed before $ to prevent mis-parsing as inline math.
       * Otherwise, invalid block $$a^2+b^2$$ would be wrongly split by $ rule.
       *
       * This configuration completely replaces default delimiters; include all original inline options to avoid losing inline math detection.
       */
      inlineDelimiters: [
        { open: '$$', close: '$$' },
        { open: '$', close: '$' },
        { open: '\\[', close: '\\]' },
        { open: '\\(', close: '\\)' },
      ],
    });
    const sample = `
- **嵌入行内数学:** $E = mc^2$ 和 \\(E = mc^2\\)
- 矩阵 $ \\mathbf{A} = \\begin{bmatrix}1 & 0\\\\ 0 & 1\\end{bmatrix} $
- 未换行的行间公式语法，降级渲染成行内: $$F_{n} = F_{n-1} + F_{n-2}, \\quad F_{0}=0, F_{1}=1$$
- **行间公式**
$$
\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}
$$

\\[
\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}
\\]

- 积分示例: $\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}$
`;
    return () => <div innerHTML={md.render(sample)}></div>;
  },
});
