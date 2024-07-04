import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Underline from '@tiptap/extension-underline';
// import Link from '@tiptap/extension-link';
// import TextAlign from '@tiptap/extension-text-align';
// import Image from '@tiptap/extension-image';
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { Box, Button, ButtonGroup, Toolbar, Divider } from "@mui/material";

const TipTapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit, Image, BulletList, OrderedList],
    content: "<p>Hello World!</p>",
  });

  if (!editor) {
    return null;
  }

  return (
    <Box>
      <Toolbar>
        <ButtonGroup variant="contained">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
          >
            Bold
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
          >
            Italic
          </Button>
          {/* <Button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>
            Underline
          </Button> */}
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
          >
            Strike
          </Button>
        </ButtonGroup>
        <Divider orientation="vertical" flexItem />
        <ButtonGroup variant="contained">
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "is-active" : ""}
          >
            Bullet List
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "is-active" : ""}
          >
            Ordered List
          </Button>
        </ButtonGroup>
        <Divider orientation="vertical" flexItem />
        <ButtonGroup variant="contained">
          {/* <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}>
            Left
          </Button>
          <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}>
            Center
          </Button>
          <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}>
            Right
          </Button>
          <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}>
            Justify
          </Button> */}
        </ButtonGroup>
        <Divider orientation="vertical" flexItem />
        <ButtonGroup variant="contained">
          {/* <Button onClick={() => editor.chain().focus().setLink({ href: 'https://www.example.com' }).run()} className={editor.isActive('link') ? 'is-active' : ''}>
            Link
          </Button>
          <Button onClick={() => editor.chain().focus().unsetLink().run()} className={editor.isActive('link') ? 'is-active' : ''}>
            Unlink
          </Button>
          <Button onClick={() => editor.chain().focus().setImage({ src: 'https://via.placeholder.com/150' }).run()} className={editor.isActive('image') ? 'is-active' : ''}>
            Image
          </Button> */}
        </ButtonGroup>
      </Toolbar>
      <EditorContent editor={editor} className="editor-content" />
    </Box>
  );
};

export default TipTapEditor;
