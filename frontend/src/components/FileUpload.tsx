import React, { useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { getFilesList } from "../features/doc/DocSlice";
import { Form } from "react-bootstrap";

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
      <Form.Group controlId="formFileSm" className="mb-3">
        <Form.Control type="file" size="sm" />
        <Form.Label>Import a ".md" documentation file.</Form.Label>
      </Form.Group>
    </div>
  );
};

export default FileUploader;
