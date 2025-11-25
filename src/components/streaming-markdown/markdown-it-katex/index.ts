/**
 * 源码来自https://github.com/imzbf/md-editor-v3/tree/6833f7cdaad1154f8fd0877e4f2ca49a13c35b1d/packages/MdEditor/layouts/Content/markdownIt/katex
 *
 */
import markdownit from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';
import type { RuleInline } from 'markdown-it/lib/parser_inline.mjs';
import type { RuleBlock } from 'markdown-it/lib/parser_block.mjs';
import { type ShallowRef } from 'vue';

interface CreateOptions {
  delimiters: Array<{
    open: string;
    close: string;
  }>;
}

interface KatexOptions {
  katexRef: ShallowRef;
  inlineDelimiters?: Array<{
    open: string;
    close: string;
  }>;
  blockDelimiters?: Array<{
    open: string;
    close: string;
  }>;
}

// 这个字符串没有实际意义，修改不会影响katex公式渲染，比如这个代码是xyz写的我也可以改成prefix="xyz"
export const prefix = 'michael';

const mergeAttrs = (token: Token, addAttrs: [string, string][]) => {
  const tmpAttrs = token.attrs ? token.attrs.slice() : [];

  addAttrs.forEach((addAttr) => {
    const i = token.attrIndex(addAttr[0]);
    const attr = i >= 0 ? tmpAttrs[i] : undefined;
    if (i < 0 || !attr) {
      tmpAttrs.push(addAttr);
    } else {
      const clonedAttr = attr.slice() as [string, string];
      clonedAttr[1] += ` ${addAttr[1]}`;
      tmpAttrs[i] = clonedAttr;
    }
  });

  return tmpAttrs;
};

// 此处是KatexOptions中inlineDelimiters和blockDelimiters的默认值
const delimiters = {
  block: [
    { open: '$$', close: '$$' },
    { open: '\\[', close: '\\]' },
  ],
  inline: [
    { open: '$', close: '$' },
    { open: '\\(', close: '\\)' },
  ],
};

const create_math_inline =
  (options: CreateOptions): RuleInline =>
  (state, silent) => {
    const delimiters = options.delimiters;
    let match, token, pos;

    for (const delim of delimiters) {
      if (state.src.startsWith(delim.open, state.pos)) {
        const start = state.pos + delim.open.length;
        match = start;

        while ((match = state.src.indexOf(delim.close, match)) !== -1) {
          pos = match - 1;
          while (state.src[pos] === '\\') {
            pos -= 1;
          }
          if ((match - pos) % 2 === 1) {
            break;
          }
          match += delim.close.length;
        }

        if (match === -1) {
          if (!silent) {
            state.pending += delim.open;
          }
          state.pos = start;
          return true;
        }

        if (match - start === 0) {
          if (!silent) {
            state.pending += delim.open + delim.close;
          }
          state.pos = start + delim.close.length;
          return true;
        }

        if (!silent) {
          const inlineContent = state.src.slice(start, match);

          // 创建数学公式 token
          token = state.push('math_inline', 'math', 0);
          token.markup = delim.open;
          token.content = inlineContent;
        }

        state.pos = match + delim.close.length;
        return true;
      }
    }
    return false;
  };

const create_math_block =
  (options: CreateOptions): RuleBlock =>
  (state, start, end, silent) => {
    const delimiters = options.delimiters;

    let firstLine: string | undefined;
    let lastLine: string | undefined;
    let next = start;
    let lastPos: number | undefined;
    let found = false;

    const baseBMark = state.bMarks[start];
    const baseShift = state.tShift[start];
    const baseEMark = state.eMarks[start];

    if (baseBMark === undefined || baseShift === undefined || baseEMark === undefined) {
      return false;
    }

    let pos = baseBMark + baseShift;
    let max = baseEMark;

    for (const delim of delimiters) {
      // 仅当 $$ 符号在行首且是单独一行时，才作为块级公式处理
      if (
        state.src.slice(pos, pos + delim.open.length) === delim.open &&
        (state.src.slice(max - delim.close.length, max) === delim.close ||
          state.src.slice(max - delim.close.length, max) === delim.open)
      ) {
        pos += delim.open.length;
        firstLine = state.src.slice(pos, max);

        if (silent) {
          return true;
        }
        if (firstLine.trim().slice(-delim.close.length) === delim.close) {
          firstLine = firstLine.trim().slice(0, -delim.close.length);
          found = true;
        }

        for (next = start; !found; ) {
          next++;
          if (next >= end) {
            break;
          }

          const nextBMark = state.bMarks[next];
          const nextShift = state.tShift[next];
          const nextEMark = state.eMarks[next];

          if (nextBMark === undefined || nextShift === undefined || nextEMark === undefined) {
            break;
          }

          pos = nextBMark + nextShift;
          max = nextEMark;

          if (pos < max && nextShift < state.blkIndent) {
            break;
          }

          if (state.src.slice(pos, max).trim().slice(-delim.close.length) === delim.close) {
            lastPos = state.src.slice(0, max).lastIndexOf(delim.close);
            lastLine = state.src.slice(pos, lastPos);
            found = true;
          }
        }

        state.line = next + 1;

        const token = state.push('math_block', 'math', 0);
        token.block = true;
        const lines = state.getLines(start + 1, next, baseShift, true);
        const prefix = firstLine?.trim();
        const suffix = lastLine?.trim();

        token.content = (prefix ? `${prefix}\n` : '') + lines + (suffix ? suffix : '');
        token.map = [start, state.line];
        token.markup = delim.open;
        return true;
      }
    }
    return false;
  };

const KatexPlugin = (
  md: markdownit,
  { katexRef, inlineDelimiters, blockDelimiters }: KatexOptions,
) => {
  const katexInline: RenderRule = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    if (!token) {
      return '';
    }
    const tmpToken = {
      attrs: mergeAttrs(token, [['class', `${prefix}-katex-inline`]]),
    };

    if (katexRef.value) {
      const html = katexRef.value.renderToString(token.content, {
        throwOnError: false,
      });

      return `<span ${slf.renderAttrs(tmpToken as Token)} data-processed>${html}</span>`;
    } else {
      return `<span ${slf.renderAttrs(tmpToken as Token)}>${token.content}</span>`;
    }
  };

  const katexBlock: RenderRule = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    if (!token) {
      return '';
    }
    const tmpToken = {
      attrs: mergeAttrs(token, [['class', `${prefix}-katex-block`]]),
    };

    if (katexRef.value) {
      const html = katexRef.value.renderToString(token.content, {
        throwOnError: false,
        displayMode: true,
      });

      return `<p ${slf.renderAttrs(tmpToken as Token)} data-processed>${html}</p>`;
    } else {
      return `<p ${slf.renderAttrs(tmpToken as Token)}>${token.content}</p>`;
    }
  };

  md.inline.ruler.before(
    'escape',
    'math_inline',
    create_math_inline({
      delimiters: inlineDelimiters || delimiters.inline,
    }),
  );
  md.block.ruler.after(
    'blockquote',
    'math_block',
    create_math_block({
      delimiters: blockDelimiters || delimiters.block,
    }),
    {
      alt: ['paragraph', 'reference', 'blockquote', 'list'],
    },
  );

  md.renderer.rules.math_inline = katexInline;
  md.renderer.rules.math_block = katexBlock;
};

export default KatexPlugin;
