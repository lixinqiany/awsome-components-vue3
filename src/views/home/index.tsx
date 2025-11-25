import { defineComponent } from 'vue';
import StreamingMarkdown from '@/components/streaming-markdown/index.tsx';

export default defineComponent({
  name: 'HomePage',
  setup() {
    return () => (
      <div>
        <StreamingMarkdown />
      </div>
    );
  },
});
