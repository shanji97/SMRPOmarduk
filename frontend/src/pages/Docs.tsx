import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import FileUploader from "../components/FileUpload";
import Editor from "./Editor";
import { download, getFilesList, upload } from "../features/doc/DocSlice";
import * as FileSaver from "file-saver";
import { Form, Button, Row, Col } from "react-bootstrap";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import { toast } from "react-toastify";
import { reset } from "../features/doc/DocSlice";

function Docs() {
  const dispatch = useAppDispatch();

  const { downloadedFile, isUploadSuccess, isUploadError, isLoading, message } =
    useAppSelector((state) => state.docs);

  // file upload
  const [file, setFile] = useState<File | null>(null);

  //editor text
  const [markdownText, setMarkdownText] = useState(downloadedFile);

  useEffect(() => {
    if (isUploadSuccess) {
      toast.success("Changes saved successfully!");
      dispatch(reset());
    }
    if (isUploadError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isUploadError, isUploadSuccess, isLoading]);

  // select file input
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // submit file
  const handleFileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file, "file.md");

      dispatch(upload({ file: formData, projectId: "3" })); // TODO
    }
  };

  function handleEditorChange({ text }: { text: string }) {
    setMarkdownText(text);
  }

  // download project docs on first load
  useEffect(() => {
    dispatch(download({ fileName: "file.md", projectId: "3" }));
  }, [isUploadSuccess]);

  useEffect(() => {
    setMarkdownText(downloadedFile);
  }, [downloadedFile]);

  const exportMarkdownFile = () => {
    const markdownString: string = downloadedFile;
    const blob: Blob = new Blob([markdownString], { type: "text/markdown" });

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Project documentation.md";
    link.style.display = "none";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const handleExport = () => {
    exportMarkdownFile();
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([markdownText], { type: "text/markdown" }),
      "file.md"
    );

    let projectId = "3";

    dispatch(upload({ file: formData, projectId }));
  };

  const mdParser = new MarkdownIt(/* Markdown-it options */);

  return (
    <div className="w-75 mx-auto">
      <h2 className="mt-3 mb-3">Project Documentation</h2>
      <hr />
      <h5 className="mb-4">Import project documentation</h5>
      <Row>
        <Form
          onSubmit={handleFileSubmit}
          className="d-flex justify-content-between"
        >
          <Col xs={4}>
            <Form.Group controlId="formFile">
              <Form.Control
                size="sm"
                type="file"
                onChange={handleFileSelection}
              />
            </Form.Group>
          </Col>
          <Col className="ms-3">
            <Button
              variant="primary"
              type="submit"
              size="sm"
              className="d-inline"
            >
              Upload
            </Button>
          </Col>
        </Form>
      </Row>
      <hr />
      <h5 className="mb-3">Export project documentation</h5>
      <Button size="sm" onClick={handleExport}>
        Export .md file
      </Button>
      <hr />
      <Row>
        <Col>
          <h5 className="mb-4">Edit project documentation</h5>
        </Col>
        <Col className="d-flex justify-content-end">
          <Button size="sm" className="align-self-center" onClick={handleSave}>
            Save changes
          </Button>
        </Col>
      </Row>
      <div className="mb-5">
        <MdEditor
          value={markdownText}
          style={{ height: "700px" }}
          renderHTML={(text: any) => mdParser.render(text)}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}

export default Docs;
