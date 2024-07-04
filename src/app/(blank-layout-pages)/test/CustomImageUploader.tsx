"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useState } from "react";

const CustomImageUploader = ({ onFileChange }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileChange(file);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-md text-center">
      <div
        {...getRootProps({ className: "dropzone" })}
        className={`p-4 ${isDragActive ? "bg-gray-200" : ""} cursor-pointer`}
      >
        <input {...getInputProps()} />
        {uploadedFile ? (
          <div className="flex flex-col items-center">
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="preview"
              className="w-32 h-32 object-cover mb-2"
            />
            <button
              type="button"
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => setUploadedFile(null)}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-500">Featured image</p>
            <div className="mt-2 text-gray-500 border border-dashed border-gray-400 w-32 h-32 flex items-center justify-center">
              <span>Add image</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomImageUploader;
