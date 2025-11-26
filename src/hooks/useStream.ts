import { type Ref } from 'vue';

export function useStream() {
  /**
   * @description Stream writer function that writes template content to targetRef character by character
   * It mimics the behavior of a text editor that displays the content as it is being written gradually.
   * @param template The content string to write
   * @param targetRef The reactive ref to update
   * @param speed Writing speed in milliseconds (default: 20ms)
   */
  const streamWriter = async (template: string, targetRef: Ref<string>, speed = 20) => {
    for (const char of template) {
      targetRef.value += char;
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
  };

  return {
    streamWriter,
  };
}
