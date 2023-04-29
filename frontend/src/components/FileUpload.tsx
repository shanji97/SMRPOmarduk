import React, { useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { getFilesList } from "../features/doc/DocSlice";

// interface Props {
//   onFileUpload: (file: File) => void;
// }

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    if (file != null) {
      reader.readAsText(file);
      reader.onload = () => {
        console.log(reader.result);
      };
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      //   onFileUpload(selectedFile);
      console.log(selectedFile.name);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Import</button>
    </div>
  );
};

export default FileUploader;
