"use client"

import React from "react"
import { type Editor } from "@tiptap/react"
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Underline,
  Quote,
  Undo,
  Redo,
  Code2,
  Minus
} from "lucide-react"

type Props = {
  editor: Editor | null;
  content: string;
};

const Toolbar = ({ editor, content }: Props) => {
  if (!editor) {
    return null
  }

  const buttonClasses = (isActive: boolean) =>
    isActive ? "bg-sky-700 text-white p-2 rounded-lg" : "text-sky-400 hover:bg-sky-700 hover:text-white p-2 hover:rounded-lg"

  return (
    <div
      className="px-4 py-3 rounded-tl-md rounded-tr-md flex justify-between items-start
    gap-5 w-full flex-wrap border border-gray-700"
    >
      <div className="flex justify-start items-center gap-5 w-full lg:w-10/12 flex-wrap ">
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          className={buttonClasses(editor.isActive("bold"))}
        >
          <Bold className="w-2 h-2" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
          className={buttonClasses(editor.isActive("italic"))}
        >
          <Italic className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
          }}
          className={buttonClasses(editor.isActive("underline"))}
        >
          <Underline className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleStrike().run()
          }}
          className={buttonClasses(editor.isActive("strike"))}
        >
          <Strikethrough className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }}
          className={buttonClasses(editor.isActive("heading", { level: 1 }))}
        >
          <Heading1 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
          className={buttonClasses(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
          className={buttonClasses(editor.isActive("heading", { level: 3 }))}
        >
          <Heading3 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }}
          className={buttonClasses(editor.isActive("heading", { level: 4 }))}
        >
          <Heading4 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }}
          className={buttonClasses(editor.isActive("heading", { level: 5 }))}
        >
          <Heading5 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }}
          className={buttonClasses(editor.isActive("heading", { level: 6 }))}
        >
          <Heading6 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
          }}
          className={buttonClasses(editor.isActive("bulletList"))}
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
          }}
          className={buttonClasses(editor.isActive("orderedList"))}
        >
          <ListOrdered className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBlockquote().run()
          }}
          className={buttonClasses(editor.isActive("blockquote"))}
        >
          <Quote className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setCodeBlock().run()
          }}
          className={buttonClasses(editor.isActive("codeBlock"))}
        >
          <Code2 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setHorizontalRule().run()
          }}
          className={buttonClasses(false)}
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
          }}
          className={buttonClasses(false)}
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
          }}
          className={buttonClasses(false)}
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>
      {content && (
        <button
          type="submit"
          className="px-4 bg-sky-700 text-white py-2 rounded-md"
        >
          Add
        </button>
      )}
    </div>
  )
}

export default Toolbar
