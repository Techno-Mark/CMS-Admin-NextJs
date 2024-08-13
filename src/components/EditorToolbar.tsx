import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import Divider from "@mui/material/Divider";
import CustomIconButton from "@core/components/mui/IconButton";

const EditorToolbar = ({ editor }:any) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 px-6">
      <CustomIconButton
        selected={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className="tabler-bold" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className="tabler-underline" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className="tabler-italic" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className="tabler-strikethrough" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <i className="tabler-align-left" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <i className="tabler-align-center" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <i className="tabler-align-right" />
      </CustomIconButton>
      <CustomIconButton
        selected={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <i className="tabler-align-justified" />
      </CustomIconButton>
    </div>
  );
};

const EditorBasic = ({
  content,
  onContentChange,
  error,
}:any) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something here...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  return (
    <div className={`border ${error && "border-red-500"} rounded-md p-4`}>
      <EditorToolbar editor={editor} />
      <Divider />
      <EditorContent
        editor={editor}
        className="min-h-[150px] overflow-y-auto flex-grow editor-content"
      />
    </div>
  );
};

export default EditorBasic;
