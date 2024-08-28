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
          extraPlugins: [CustomBase64Adapter],
          image: {
            toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative'],
          },
        }}
      />
    </div>
  )
}

function CustomBase64Adapter(editor:any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader:any) => {
    return {
      upload: () => {
        return loader.file.then((file:any) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              resolve({
                default: reader.result,
              });
            };
            reader.onerror = reject;
          });
        });
      },
    };
  };
}


export default MyCKEditor
