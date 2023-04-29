import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import FileUploader from "../components/FileUpload";
import Editor from "./Editor";
import { download, getFilesList } from "../features/doc/DocSlice";
import * as FileSaver from "file-saver";

function Docs() {
  const dispatch = useAppDispatch();

  const { fileNames, downloadedFile } = useAppSelector((state) => state.docs);

  useEffect(() => {
    dispatch(download({ fileName: "file.md", projectId: "3" }));
  }, []);

  const handleDownload = (fileName: string) => {
    dispatch(download({ fileName, projectId: "3" }));
  };

  function exportMarkdownFile(): void {
    const markdownString: string = "// your markdown string from state";
    const blob: Blob = new Blob([markdownString], { type: "text/markdown" });

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "my-markdown-file.md";
    link.style.display = "none";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  const handleExport = () => {
    console.log(downloadedFile);
    exportMarkdownFile();
  };

  const handleImport = () => {
    console.log(downloadedFile);
    exportMarkdownFile();
  };

  console.log(downloadedFile);

  return (
    <div className="w-75 m-auto">
      <h2 className="mt-3 mb-5">Project Documentation</h2>

      <h5>Edit project documentation</h5>
      <div className="">
        <Editor content={downloadedFile} />
      </div>
      <h5>Import project documentation</h5>
      <FileUploader />
      <h5>Export project documentation</h5>
      <button onClick={handleExport}>Export</button>
    </div>
  );
}

export default Docs;
