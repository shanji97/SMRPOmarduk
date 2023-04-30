import { useEffect, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import { useAppDispatch } from "../app/hooks";
import { getFilesList, upload } from "../features/doc/DocSlice";

interface EditorProps {
  content: string;
}

const Editor: React.FC<EditorProps> = ({ content }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMarkdownText(content);
  }, [content]);

  const [markdownText, setMarkdownText] = useState(content);

  function handleEditorChange({ text }: { text: string }) {
    setMarkdownText(text);
  }

  const handleSave = () => {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([markdownText], { type: "text/markdown" }),
      "file.md"
    );

    let projectId = "3";

    // dispatch(upload({ file: formData, projectId }));
  };

  const mdParser = new MarkdownIt(/* Markdown-it options */);

  return (
    <>
      <MdEditor
        value={markdownText}
        style={{ height: "700px" }}
        renderHTML={(text: any) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
    </>
  );
};

export default Editor;
