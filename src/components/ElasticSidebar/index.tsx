import { defineComponent } from 'vue';
import { NSplit } from 'naive-ui';
import styles from './style.module.css';

interface ElasticSidebarProps {
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
}

export default defineComponent({
  name: 'ElasticSidebar',
  props: {
    size: {
      type: [Number, String],
      default: 0.1,
    },
    minSize: {
      type: [Number, String],
      default: 0.05,
    },
    maxSize: {
      type: [Number, String],
      default: 0.15,
    },
  },
  emits: {
    'update:size': (size: number | string) => size,
  },
  setup(props: ElasticSidebarProps, { slots, emit }) {
    const handleUpdateSize = (size: number | string) => {
      emit('update:size', size);
    };

    return () => (
      <div class={styles.splitContainer}>
        <NSplit
          direction="horizontal"
          size={props.size}
          min={props.minSize}
          max={props.maxSize}
          onUpdateSize={handleUpdateSize}
        >
          {{
            '1': () => (
              <div class={styles.sidebar}>
                <header class={styles.sidebarHeader}>{slots.sidebarHeader?.()}</header>
                <main class={styles.sidebarMain}>{slots.sidebarMain?.()}</main>
                <footer class={styles.sidebarFooter}>{slots.sidebarFooter?.()}</footer>
              </div>
            ),
            '2': () => slots.default?.() ?? <div>Content Area (Empty)</div>,
          }}
        </NSplit>
      </div>
    );
  },
});
