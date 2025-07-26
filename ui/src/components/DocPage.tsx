import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown-dark.css";

interface DocPageProps {
  content: string;
}

const DocPage = ({ content }: DocPageProps) => {
  return (
    <div className="bg-background pt-[80px]">
      <div className="container mx-auto">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default DocPage;
