import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { theme } = useTheme();
  
  return (
    <MarkdownPreview
      source={content}
      style={{
        padding: 5,
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
      wrapperElement={{
        "data-color-mode": theme === "dark" ? "dark" : "light",
      }}
    />
  );
};

export default MarkdownRenderer;
