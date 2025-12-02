import { defineComponent, type PropType } from 'vue';
import styles from './Message.module.css';

interface MessageProps {
  content: string;
  isBubble?: boolean;
  position?: 'left' | 'right';
}

export default defineComponent({
  name: 'MessageView',
  props: {
    content: {
      type: String,
      required: true,
    },
    isBubble: {
      type: Boolean,
      required: false,
      default: true,
    },
    position: {
      type: String as PropType<'left' | 'right'>,
      required: false,
      default: 'left',
    },
  },
  setup(props: MessageProps) {
    return () => {
      const { isBubble, position, content } = props;

      // Default sample text if no content provided
      const textToDisplay =
        content ||
        '这是一个示例消息文本。This is a sample message text used for testing the layout.';

      return (
        <div class={[styles.messageRow, position === 'right' ? styles.right : styles.left]}>
          <div class={[styles.content, isBubble ? styles.bubble : styles.fullWidth]}>
            {textToDisplay}
          </div>
        </div>
      );
    };
  },
});
