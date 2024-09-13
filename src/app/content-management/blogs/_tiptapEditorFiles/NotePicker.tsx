"use client"
import React, { useState } from "react"
import Tiptap from "./TipTap"
import { v4 as uuidv4 } from "uuid"

const Todo = () => {
  const [content, setContent] = useState<string>("")
  const handleContentChange = (reason: any) => {
    setContent(reason)
  }
  const handleSubmit = (e: any) => {
    e.preventDefault()
    const data = {
      id: uuidv4(),
      content
    };
    (data)
    const existingDataString = localStorage.getItem("myData")
    const existingData = existingDataString ? JSON.parse(existingDataString) : []
    const updatedData = [...existingData, data]
    localStorage.setItem("myData", JSON.stringify(updatedData))
    setContent("")
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl w-full max-h-[250px] overflow-y-auto grid place-items-center mx-auto pt-10 mb-2"
    >
      <Tiptap
        content={content}
        onChange={(newContent: string) => handleContentChange(newContent)}
      />
    </form>
  )
}

export default Todo
