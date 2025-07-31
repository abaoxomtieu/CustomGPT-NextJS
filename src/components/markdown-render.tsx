import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <MarkdownPreview
      source={content}
      style={{ 
        padding: 16,
        backgroundColor: '#fff',
        color: '#24292f'
      }}
      wrapperElement={{
        "data-color-mode": "light"
      }}
    />
  );
};

export default MarkdownRenderer;
