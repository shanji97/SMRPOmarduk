import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { download, upload } from "../features/doc/DocSlice";
import { Form, Button, Row, Col } from "react-bootstrap";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import { toast } from "react-toastify";
import { reset } from "../features/doc/DocSlice";
import { useParams } from "react-router-dom";

function Docs() {
  const params = useParams();
  const dispatch = useAppDispatch();

  const {
    downloadedFile,
    isUploadSuccess,
    isUploadError,
    isDownloadSuccess,
    isLoading,
    message,
  } = useAppSelector((state) => state.docs);

  // file upload
  const [file, setFile] = useState<File | null>(null);
  const [fileInputTouched, setFileInputTouched] = useState(false);

  const fileInputValid = file != null && file.name.endsWith(".md");
  const fileInputIsInvalid = fileInputTouched && !fileInputValid;

  // editor text
  const [markdownTextInit, setMarkdownTextInit] = useState(downloadedFile); // for comparing changes
  const [markdownText, setMarkdownText] = useState(downloadedFile);

  const changesSaved = markdownTextInit === markdownText;

  useEffect(() => {
    if (isUploadSuccess) {
      toast.success("Changes saved successfully!");
      dispatch(reset());
      dispatch(download({ fileName: "docs.md", projectId: params.projectId! }));
    }
    if (isUploadError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isUploadError, isUploadSuccess, isLoading]);

  useEffect(() => {
    if (isDownloadSuccess) {
      setMarkdownText(downloadedFile);
      setMarkdownTextInit(downloadedFile);
    }
  });

  // select file input
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileInputTouched(true);

    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      toast.error("Make sure to choose a markdown (.md) file!");
    }
  };

  // submit file
  const handleFileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFileInputTouched(true);

    if (fileInputIsInvalid) {
      toast.error("Make sure to choose a Markdown (.md) file!");
      return;
    }

    if (file && !fileInputIsInvalid) {
      const formData = new FormData();
      formData.append("file", file, "docs.md");

      dispatch(upload({ file: formData, projectId: params.projectId! })); // TODO
    }
  };

  function handleEditorChange({ text }: { text: string }) {
    setMarkdownText(text);
  }

  // download project docs on first load
  useEffect(() => {
    dispatch(download({ fileName: "docs.md", projectId: params.projectId! }));
  }, [isUploadSuccess]);

  useEffect(() => {
    setMarkdownText(downloadedFile);
  }, [downloadedFile]);

  const exportMarkdownFile = () => {
    const markdownString: string = downloadedFile;
    const blob: Blob = new Blob([markdownString], { type: "text/markdown" });

    const link: HTMLAnchorElement = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Project Docs.md";
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
      "docs.md"
    );

    dispatch(upload({ file: formData, projectId: params.projectId! }));
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
                accept=".md"
                onChange={handleFileSelection}
                isInvalid={fileInputIsInvalid}
              />
            </Form.Group>
            <div className="mt-1 text-muted small">
              Please select a Markdown (.md) file.
            </div>
          </Col>
          <Col className="ms-3">
            <Button
              variant="primary"
              type="submit"
              size="sm"
              className="d-inline"
              disabled={file != null && !file.name.endsWith(".md")}
            >
              Upload
            </Button>
          </Col>
        </Form>
      </Row>
      <hr />
      <h5 className="mb-3">Export project documentation</h5>

      <Button size="sm" onClick={handleExport} disabled={!changesSaved}>
        Export .md file
      </Button>
      {!changesSaved && (
        <div className="text-muted small mt-2">
          Save changes before exporting
        </div>
      )}
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
