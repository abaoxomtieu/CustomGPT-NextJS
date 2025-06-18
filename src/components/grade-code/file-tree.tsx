import { useCallback, useState, useEffect } from "react";
import { FolderOpen, Folder, File } from "lucide-react";
import { FileTreeProps, TreeNode } from "../../../types/type";

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelection }) => {
  const [openNodes, setOpenNodes] = useState<string[]>([]);
  const [checkedNodes, setCheckedNodes] = useState<string[]>([]);

  const toggleNode = (value: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setOpenNodes((prev) =>
      prev.includes(value)
        ? prev.filter((node) => node !== value)
        : [...prev, value]
    );
  };

  const toggleCheck = useCallback(
    (node: TreeNode, event?: React.ChangeEvent) => {
      event?.stopPropagation();
      const value = node.value;

      setCheckedNodes((prevChecked) => {
        const isChecked = prevChecked.includes(value);
        let newCheckedNodes: string[];

        if (isChecked) {
          // Remove node from checked nodes
          newCheckedNodes = prevChecked.filter((v) => v !== value);

          // Remove all children recursively when parent is unchecked
          if (node.children) {
            const removeAllChildren = (children: TreeNode[]) => {
              children.forEach((child) => {
                newCheckedNodes = newCheckedNodes.filter(
                  (v) => v !== child.value
                );
                if (child.children) {
                  removeAllChildren(child.children);
                }
              });
            };

            removeAllChildren(node.children);
          }
        } else {
          // Add node and its children to checked nodes
          newCheckedNodes = [...prevChecked, value];

          // Add all children recursively
          if (node.children) {
            const addAllChildren = (children: TreeNode[]) => {
              children.forEach((child) => {
                if (!newCheckedNodes.includes(child.value)) {
                  newCheckedNodes.push(child.value);
                  if (child.children) {
                    addAllChildren(child.children);
                  }
                }
              });
            };

            addAllChildren(node.children);
          }
        }

        return newCheckedNodes;
      });
    },
    []
  );

  // Update parent component whenever checkedNodes changes
  useEffect(() => {
    onFileSelection(checkedNodes);
  }, [checkedNodes, onFileSelection]);

  const renderTree = useCallback(
    (node: TreeNode) => {
      const isOpen = openNodes.includes(node.value);
      const isChecked = checkedNodes.includes(node.value);
      const isDirectory = !!node.children;

      return (
        <li key={node.value} className="list-none mb-1">
          <div
            className={`flex items-center p-1.5 rounded transition-all hover:bg-foreground/5 ${
              isChecked ? "bg-foreground/5" : ""
            }`}
            onClick={() => isDirectory && toggleNode(node.value)}
          >
            <div className="flex items-center flex-grow min-w-0">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => toggleCheck(node, e)}
                className="mr-2 h-3 w-3 accent-foreground cursor-pointer flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              />

              <span
                className={`cursor-pointer flex items-center min-w-0 text-xs ${
                  isDirectory ? "text-foreground font-medium" : "text-foreground/80"
                }`}
              >
                {isDirectory ? (
                  isOpen ? (
                    <FolderOpen className="mr-1.5 w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <Folder className="mr-1.5 w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )
                ) : (
                  <File className="mr-1.5 w-3.5 h-3.5 text-foreground/60 flex-shrink-0" />
                )}
                <span className="truncate text-xs leading-tight">{node.label}</span>
              </span>
            </div>
          </div>

          {isDirectory && isOpen && (
            <ul className="pl-4 mt-0.5 border-l border-foreground/10">
              {node.children!.map((child) => renderTree(child))}
            </ul>
          )}
        </li>
      );
    },
    [openNodes, checkedNodes, toggleCheck]
  );

  return (
    <div className="file-tree-container p-1">
      <ul className="space-y-0">{nodes.map((node) => renderTree(node))}</ul>
    </div>
  );
};

export default FileTree;
