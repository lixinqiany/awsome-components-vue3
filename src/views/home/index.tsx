import { defineComponent, onMounted, ref, shallowRef } from 'vue';
import StreamingMarkdown from '@/components/streaming-markdown/index.tsx';
import MessageView from '@/components/messages/Message.tsx';
import KatexPlugin from '@/components/streaming-markdown/markdown-it-katex/index.ts';
import katex from 'katex';
import mila from 'markdown-it-link-attributes';
import { useStream } from '@/hooks/useStream.ts';
import SvgIcon from '@/components/icons/index.tsx';
import ElasticSidebar from '@/components/ElasticSidebar/index.tsx';

export default defineComponent({
  name: 'HomePage',
  setup() {
    const sidebarWidth = ref<string | number>(0.1);

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
      <div style={{ width: '100wh', height: '100vh' }}>
        <ElasticSidebar v-model:size={sidebarWidth.value}>
          {{
            sidebarHeader: () => <div style={{ fontWeight: 'bold', fontSize: '18px' }}>My App</div>,
            sidebarMain: () => (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                  >
                    Sidebar Item {i + 1}
                  </li>
                ))}
              </ul>
            ),
            sidebarFooter: () => (
              <div style={{ color: '#666', fontSize: '12px' }}>© 2024 My Company</div>
            ),
            default: () => (
              <div style={{ padding: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <h3>Message Component Demo</h3>

                {/* Case 1: User message (Bubble, Right) */}
                <div
                  style={{
                    marginBottom: '20px',
                    border: '1px dashed #ccc',
                    padding: '10px',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Case 1: User Message (Bubble: true, Position: right)
                  </p>
                  <MessageView
                    isBubble={true}
                    position="right"
                    content="Vue 3 是一个用于构建用户界面的渐进式框架。它建立在标准 HTML、CSS 和 JavaScript 之上，并提供了一套声明式的、组件化的编程模型，帮助你高效地开发用户界面。Vue 3 引入了组合式 API (Composition API)，这使得代码组织和逻辑复用变得更加容易，特别是在大型项目中。此外，Vue 3 在性能方面也有显著提升，更小的包体积和更快的渲染速度。"
                  />
                </div>

                {/* Case 2: Bot message (Full Width, Left) */}
                <div
                  style={{
                    marginBottom: '20px',
                    border: '1px dashed #ccc',
                    padding: '10px',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Case 2: System Message (Bubble: false, Position: left - Default)
                  </p>
                  <MessageView
                    isBubble={false}
                    position="left"
                    content="Vue 3 是一个用于构建用户界面的渐进式框架。它建立在标准 HTML、CSS 和 JavaScript 之上，并提供了一套声明式的、组件化的编程模型，帮助你高效地开发用户界面。Vue 3 引入了组合式 API (Composition API)，这使得代码组织和逻辑复用变得更加容易，特别是在大型项目中。此外，Vue 3 在性能方面也有显著提升，更小的包体积和更快的渲染速度。"
                  />
                </div>

                {/* Case 3: Bot message (Bubble, Left) - Hypothetical */}
                <div
                  style={{
                    marginBottom: '20px',
                    border: '1px dashed #ccc',
                    padding: '10px',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Case 3: Bot Message (Bubble: true, Position: left)
                  </p>
                  <MessageView
                    isBubble={true}
                    position="left"
                    content="当然可以。这是一个气泡样式的左侧消息。"
                  />
                </div>

                <SvgIcon src="timer.svg" class="test-svg" style="color: red;" />

                <hr />
                <h3>Streaming Markdown Demo</h3>
                <StreamingMarkdown
                  content={sample}
                  plugins={plugins}
                  markdownOptions={markdownOptions}
                />
              </div>
            ),
          }}
        </ElasticSidebar>
      </div>
    );
  },
});
