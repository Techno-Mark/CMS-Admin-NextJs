"use client";
import React, { useState } from "react";
import CustomImageUploader from "./CustomImageUploader";

const App = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (file) => {
    setFile(file);
  };

  return (
    // <></>
    <div className="p-4">
      <CustomImageUploader onFileChange={handleFileChange} />
      {file && <p className="mt-4">Uploaded file: {file.name}</p>}
    </div>
  );
};

export default App;
