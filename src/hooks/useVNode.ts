import { h, createTextVNode, type VNode } from 'vue';

/**
 * @description Support to convert HTML string to Vue VNodes
 */
export function useVNode() {
  /**
   * @description Strictly accept HTML-formatted string and convert it to Vue VNodes with keys.
   */
  const htmlToVNodes = (html: string): VNode[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const transform = (node: Node, index: number): VNode | null => {
      // base condition to exit recursion
      if (node.nodeType === Node.TEXT_NODE) {
        const vnode = createTextVNode(node.textContent || '');
        vnode.key = index;
        return vnode;
      }

      // element node
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const props: Record<string, unknown> = {
          key: index,
        };

        // copy attributes
        [...element.attributes].forEach((attr) => {
          props[attr.name] = attr.value;
        });

        // recursively process child nodes
        const children: VNode[] = [];
        element.childNodes.forEach((child, childIndex) => {
          const result = transform(child, childIndex);
          if (result !== null) {
            children.push(result);
          }
        });

        return h(element.tagName.toLowerCase(), props, children);
      }

      return null;
    };

    return Array.from(doc.body.childNodes)
      .map((node, i) => transform(node, i))
      .filter((n): n is VNode => n !== null);
  };

  return {
    htmlToVNodes,
  };
}
