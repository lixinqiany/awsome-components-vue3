import { Stack } from '@/utils/stack.ts';

export function useStack<T>(initialValue?: T) {
  const stack = new Stack<T>(initialValue);

  return {
    stack: stack.raw,
    // 使用 bind 确保方法在解构使用时，this 指向 stack 实例，
    // 防止因 this 上下文丢失导致无法访问 stack.items
    push: stack.push.bind(stack),
    pop: stack.pop.bind(stack),
    peek: stack.peek.bind(stack),
    isEmpty: stack.isEmpty.bind(stack),
    size: stack.size.bind(stack),
    clear: stack.clear.bind(stack),
  };
}
