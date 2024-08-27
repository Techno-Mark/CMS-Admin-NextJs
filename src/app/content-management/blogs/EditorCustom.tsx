// components/CKEditor.tsx
import React, { useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

interface CKEditorProps {
  onChange: (data: string) => void
  initialValue?: string
}

const MyCKEditor: React.FC<CKEditorProps> = ({ onChange, initialValue = '' }) => {
  const [data, setData] = useState(initialValue)

  return (
    <div>
      <CKEditor
        editor={ClassicEditor}
        data={data}
        onChange={(event, editor) => {
          const data = editor.getData()
          setData(data)
          onChange(data)
        }}
        config={{
          // You can add any additional CKEditor configuration here
        }}
      />
    </div>
  )
}

export default MyCKEditor
