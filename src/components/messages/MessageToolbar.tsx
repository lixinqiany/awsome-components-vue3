import { defineComponent, ref, Transition } from 'vue';
import styles from './MessageToolbar.module.css';
import IconCopy from '@/components/icons/IconCopy.vue';
import IconCheck from '@/components/icons/IconCheck.vue';

interface ToolbarProps {
  copy?: boolean;
}

export default defineComponent({
  name: 'MessageToolbar',
  props: {
    copy: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: {
    copy: () => true,
  },
  setup(props: ToolbarProps, { emit }) {
    const isCopied = ref(false);

    const handleCopy = () => {
      emit('copy');
      isCopied.value = true;
      // re-render the copy icon after 2 seconds
      setTimeout(() => {
        isCopied.value = false;
      }, 600);
    };

    return () => (
      <div class={styles.toolbar}>
        {props.copy && (
          <button
            class={styles.btn}
            onClick={handleCopy}
            data-tooltip={isCopied.value ? '' : '复制'}
          >
            <Transition name="icon-fade" mode="out-in">
              {isCopied.value ? <IconCheck key="check" /> : <IconCopy key="copy" />}
            </Transition>
          </button>
        )}
      </div>
    );
  },
});
