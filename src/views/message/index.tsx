import { defineComponent } from 'vue';
import styles from './index.module.css';

const markdownExample = `

### Heading 3

普通段落文本，用来演示 **加粗**、*斜体*、~~删除线~~ 和 **_组合样式_**。

---

> 这是一段引用文字
>
> - 引用中的列表项 1
> - 引用中的列表项 2

- 无序列表项 A
- 无序列表项 B
  - 嵌套列表项 B-1

1. 有序列表项 1
2. 有序列表项 2

内联代码示例：\`npm run dev\`

代码块示例：

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('Markdown'));
\`\`\`

表格示例：

| Name     | Age | City      |
|----------|-----|-----------|
| Alice    | 25  | Shanghai  |
| Bob      | 30  | Beijing   |
| Charlie  | 28  | Shenzhen  |

链接示例：[Vue 官网](https://vuejs.org/)

图片语法示例（不会真的加载图片，只是展示语法）：

![示例图片](https://example.com/image.png "Image Title")

任务列表示例：

- [x] 已完成任务
- [ ] 未完成任务
`;

export default defineComponent({
  name: 'SingleMessage',
  setup() {
    return () => <div class={styles.container}>{markdownExample}</div>;
  },
});
