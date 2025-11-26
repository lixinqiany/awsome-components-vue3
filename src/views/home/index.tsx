import { defineComponent, onMounted, ref, shallowRef } from 'vue';
import StreamingMarkdown from '@/components/streaming-markdown/index.tsx';
import KatexPlugin from '@/components/streaming-markdown/markdown-it-katex/index.ts';
import katex from 'katex';
import mila from 'markdown-it-link-attributes';
import { useStream } from '@/hooks/useStream.ts';

export default defineComponent({
  name: 'HomePage',
  setup() {
    const sample = `
- **嵌入行内数学:** $E = mc^2$ 和 \\(E = mc^2\\)
- 矩阵 $ \\mathbf{A} = \\begin{bmatrix}1 & 0\\\\ 0 & 1\\end{bmatrix} $
- **行间公式**
$$
\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}
$$

| 姓名   | 年龄 | 城市     |
|--------|------|----------|
| 张三   | 28   | 北京     |
| 李四   | 32   | 上海     |
| 王五   | 24   | 广州     |
`;

    const markdownOptions = {
      html: false,
      linkify: true,
      typographer: true,
    };

    const plugins = [
      {
        plugin: KatexPlugin,
        options: {
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
        },
      },
      {
        plugin: mila,
        options: {
          attrs: {
            // open all links in a new tab
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      },
    ];

    const { streamWriter } = useStream();
    const typewriter = ref<string>('');
    onMounted(() => {
      streamWriter(sample, typewriter);
    });

    return () => (
      <div>
        <StreamingMarkdown
          content={typewriter.value}
          plugins={plugins}
          markdownOptions={markdownOptions}
        />
      </div>
    );
  },
});
