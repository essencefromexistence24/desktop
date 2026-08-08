"use client";

import { useEffect, useMemo } from "react";
import { type Descendant, createEditor, Editor, Transforms } from "slate";
import {
  type RenderElementProps,
  type RenderLeafProps,
  Editable,
  ReactEditor,
  Slate,
  withReact,
} from "slate-react";
import { withHistory } from "slate-history";
import { deserializeMd } from "@udecode/plate-markdown";
import { cn } from "@/lib/friday/utils";

type Props = {
  markdown: string;
  className?: string;
};

type CustomElement = {
  type?: string;
  url?: string;
  lang?: string;
  children: CustomDescendant[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type CustomDescendant = CustomElement | CustomText;

const EMPTY_VALUE: Descendant[] = [
  { type: "p", children: [{ text: "" }] } as unknown as Descendant,
];

export function PlateMarkdown({ markdown, className }: Props) {
  const editor = useMemo(() => {
    const base = createEditor();
    const withReactEditor = withReact(base as unknown as ReactEditor);
    return withHistory(withReactEditor);
  }, []);

  useEffect(() => {
    if (!markdown) {
      Transforms.delete(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      });
      Transforms.insertNodes(editor, EMPTY_VALUE[0]);
      return;
    }

    let parsed: Descendant[] = [];
    try {
      parsed = deserializeMd(
        editor as unknown as Parameters<typeof deserializeMd>[0],
        markdown,
      ) as Descendant[];
    } catch {
      parsed = [
        {
          type: "p",
          children: [{ text: markdown }],
        } as unknown as Descendant,
      ];
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      parsed = [
        {
          type: "p",
          children: [{ text: markdown }],
        } as unknown as Descendant,
      ];
    }

    Editor.withoutNormalizing(editor, () => {
      const end = editor.children.length;
      for (let i = end - 1; i >= 0; i--) {
        Transforms.removeNodes(editor, { at: [i] });
      }
      Transforms.insertNodes(editor, parsed as unknown as Descendant[], {
        at: [0],
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  return (
    <Slate editor={editor as unknown as ReactEditor} initialValue={EMPTY_VALUE}>
      <Editable
        readOnly
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className={cn("prose-chat focus:outline-none", className)}
        spellCheck={false}
      />
    </Slate>
  );
}

function renderElement(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const el = element as CustomElement;
  switch (el.type) {
    case "h1":
      return (
        <h1
          {...attributes}
          className="text-[1.4rem] font-semibold mt-5 mb-2 tracking-tight text-foreground"
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          {...attributes}
          className="text-[1.2rem] font-semibold mt-5 mb-2 tracking-tight text-foreground"
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 {...attributes} className="text-[1.05rem] font-semibold mt-4 mb-1.5 text-foreground">
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 {...attributes} className="text-[1rem] font-semibold mt-3 mb-1 text-foreground">
          {children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote
          {...attributes}
          className="my-3 border-l-[3px] border-foreground/20 pl-4 italic text-foreground-muted"
        >
          {children}
        </blockquote>
      );
    case "ul":
      return (
        <ul {...attributes} className="my-2 list-disc pl-6 space-y-1">
          {children}
        </ul>
      );
    case "ol":
      return (
        <ol {...attributes} className="my-2 list-decimal pl-6 space-y-1">
          {children}
        </ol>
      );
    case "li":
      return (
        <li {...attributes} className="leading-relaxed">
          {children}
        </li>
      );
    case "code_block":
    case "code-block":
      return (
        <pre
          {...attributes}
          className="my-3 overflow-x-auto rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-[12.5px] leading-relaxed"
        >
          <code>{children}</code>
        </pre>
      );
    case "a":
      return (
        <a
          {...attributes}
          href={el.url}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline underline-offset-2"
        >
          {children}
        </a>
      );
    case "hr":
      return <hr {...attributes} className="my-4 border-border" />;
    case "p":
    default:
      return (
        <p {...attributes} className="my-2 leading-relaxed">
          {children}
        </p>
      );
  }
}

function renderLeaf(props: RenderLeafProps) {
  const { attributes, children, leaf } = props;
  const t = leaf as CustomText;
  if (t.code) {
    return (
      <code
        {...attributes}
        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
      >
        {children}
      </code>
    );
  }
  const cls: string[] = [];
  if (t.bold) cls.push("font-semibold");
  if (t.italic) cls.push("italic");
  if (t.underline) cls.push("underline underline-offset-2");
  if (t.strikethrough) cls.push("line-through");
  return (
    <span {...attributes} className={cn(...cls)}>
      {children}
    </span>
  );
}
