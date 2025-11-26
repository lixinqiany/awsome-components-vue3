import { defineComponent, type PropType } from 'vue';
import markdownIt, { type Options, type PluginWithParams } from 'markdown-it';
import { useVNode } from '@/hooks/useVNode.ts';

interface PluginConfig {
  plugin: PluginWithParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

export default defineComponent({
  name: 'StreamingMarkdown',
  props: {
    content: {
      type: String,
      required: true,
    },
    plugins: {
      type: Array as PropType<PluginConfig[]>,
      required: false,
      default: () => [],
    },
    markdownOptions: {
      type: Object as PropType<Options>,
      required: false,
      default: () => ({}),
    },
  },
  setup(props) {
    const { htmlToVNodes } = useVNode();
    const md = markdownIt(props.markdownOptions);

    props.plugins.forEach(({ plugin, options }) => {
      md.use(plugin, options);
    });

    return () => htmlToVNodes(md.render(props.content, {}));
  },
});
