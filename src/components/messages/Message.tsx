import { defineComponent, type PropType } from 'vue';
import styles from './Message.module.css';
import StreamingMarkdown from '@/components/streaming-markdown/index.tsx';
import MessageToolbar from './MessageToolbar';

interface MessageProps {
  content: string;
  isBubble?: boolean;
  position?: 'left' | 'right';
  isRaw?: boolean;
  showToolbar?: boolean;
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
    isRaw: {
      type: Boolean,
      required: false,
      default: false,
    },
    showToolbar: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props: MessageProps, { slots }) {
    const handleCopy = () => {
      navigator.clipboard.writeText(props.content);
    };

    return () => {
      const { isBubble, position, content, isRaw, showToolbar } = props;

      const textToDisplay = content;

      return (
        // Message container aligned left or right
        <div class={[styles.messageRow, position === 'right' ? styles.right : styles.left]}>
          {/* Vertical layout: message content on top, toolbar below */}
          <div class={styles.messageColumn}>
            <div class={[styles.content, isBubble ? styles.bubble : styles.fullWidth]}>
              {isRaw ? textToDisplay : <StreamingMarkdown content={textToDisplay} />}
            </div>

            {/* Use slot for custom toolbar; fallback to default toolbar when not provided */}
            {slots.toolbar ? (
              <div class={[styles.toolbarWrapper, isBubble ? styles.bubble : styles.fullWidth]}>
                {slots.toolbar({ content: textToDisplay })}
              </div>
            ) : showToolbar ? (
              <div class={[styles.toolbarWrapper, isBubble ? styles.bubble : styles.fullWidth]}>
                <MessageToolbar onCopy={handleCopy} />
              </div>
            ) : null}
          </div>
        </div>
      );
    };
  },
});
