import { isUndef } from '@/utils/type-checker';
import { defineComponent, h, ref, toRefs, useAttrs, watch } from 'vue';

/**
 * When typing the file path pattern, Starting with `/` indicates the root directory of the project, otherwise (`./`) it is relative to the current file.
 * Options:
 * `eager: true` means to load all the icons at once, and return a object with the key is the file name and the value is the icon component.
 * But by default, the icons are lazy loaded, so we need to use the value and manually load the icons.
 *
 *  `as: 'raw'` means to return the icon as a string, so we can use the `h` function to create the icon component.
 */
const icons = import.meta.glob('/src/assets/icons/*.svg', { query: '?raw', import: 'default' });
// This is the prefix of the icon path, acting as a base path for the icon path.
const prefix = '/src/assets/icons/';

interface IconProps {
  /** @description the path of the icon relative to the `src/assets/icons` directory */
  src: string;
}

export default defineComponent({
  name: 'SvgIcon',
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  setup(props: IconProps) {
    const { src } = toRefs(props);
    const userAttrs = useAttrs();
    const svgAttrs = ref<Record<string, string>>({});
    const svgInnerHtml = ref('');

    const loadIcon = async (path: string) => {
      const loader = icons[prefix + path];
      if (isUndef(loader)) {
        throw new Error(`Icon ${path} not found`);
      }
      const rawContent = (await loader()) as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawContent, 'image/svg+xml');

      const svg = doc.querySelector('svg');
      if (isUndef(svg)) {
        throw new Error(`Nothing SVG found in the icon ${path}`);
      }

      for (const attr of svg.attributes) {
        svgAttrs.value[attr.name] = attr.value;
      }
      if (isUndef(svgAttrs.value['width'])) {
        svgAttrs.value['width'] = '24';
      }
      if (isUndef(svgAttrs.value['height'])) {
        svgAttrs.value['height'] = '24';
      }
      svgAttrs.value['fill'] = 'currentColor';
      svgInnerHtml.value = svg.innerHTML;
    };

    watch(
      src,
      (value) => {
        if (isUndef(value)) {
          return;
        }
        loadIcon(value).catch((error) => {
          throw new Error(`Failed to load icon ${value}: ${error}`);
        });
      },
      // execute once immediately after the component is mounted
      { immediate: true },
    );

    return () =>
      h('svg', {
        ...svgAttrs.value,
        ...userAttrs,
        innerHTML: svgInnerHtml.value,
      });
  },
});
