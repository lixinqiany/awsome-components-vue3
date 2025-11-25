export class Stack<T> {
  private items: T[];

  constructor(initialValue?: T) {
    // initial push
    this.items = initialValue ? [initialValue] : [];
  }

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    // pop时候如果是空数组会返回undefined
    return this.items.pop();
  }

  /**
   * @description Get the top element of the stack without popping it
   */
  peek(): T | undefined {
    if (this.items.length === 0) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  get raw(): readonly T[] {
    return this.items;
  }
}
