import { defineComponent, toRefs, type PropType, type VNode } from 'vue';
import styles from './style.module.css';

interface MinibarProps {
  headerIcons?: VNode[];
  footerIcons?: VNode[];
}

export const Minibar = defineComponent({
  name: 'MiniBar',
  props: {
    headerIcons: {
      type: Array as PropType<VNode[]>,
      required: false,
      default: () => [],
    },
    footerIcons: {
      type: Array as PropType<VNode[]>,
      required: false,
      default: () => [],
    },
  },
  setup(props: MinibarProps) {
    const { headerIcons, footerIcons } = toRefs(props);

    return () => (
      <div class={styles.container}>
        <div class={styles.topSection}>
          {headerIcons?.value?.map((icon, i) => (
            <div key={`top-${i}`} class={styles.item}>
              {icon}
            </div>
          ))}
        </div>

        <div class={styles.bottomSection}>
          {footerIcons?.value?.map((icon, i) => (
            <div key={`bottom-${i}`} class={styles.item}>
              {icon}
            </div>
          ))}
        </div>
      </div>
    );
  },
});
