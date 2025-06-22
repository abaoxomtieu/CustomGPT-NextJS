"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Eye, FileText, X } from "lucide-react";
import FileTree from "./file-tree";
import type { TreeNode } from "../../../types/type";
import { useTranslations } from "next-intl";
interface FileTreePanelProps {
  fileTreeData: TreeNode[];
  selectedFiles: string[];
  onFileSelection: (files: string[]) => void;
}

export default function FileTreePanel({
  fileTreeData,
  selectedFiles,
  onFileSelection,
}: FileTreePanelProps) {
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const t = useTranslations("gradeCode");
  const showSelectedFiles = () => setIsFilesDrawerOpen(true);

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow h-[500px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3 flex-shrink-0">
          <CardTitle className="text-sm font-medium text-foreground">
            {t("file_tree")}
          </CardTitle>
          {selectedFiles.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 h-6 px-2 text-xs bg-background text-foreground border-foreground/20 hover:bg-foreground/5"
              onClick={showSelectedFiles}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">{t("selected")}</span>
              <Badge
                variant="secondary"
                className="bg-foreground text-background px-1.5 py-0 text-xs h-4 min-w-[16px] flex items-center justify-center"
              >
                {selectedFiles.length}
              </Badge>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto">
          {fileTreeData.length > 0 ? (
            <FileTree nodes={fileTreeData} onFileSelection={onFileSelection} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-xs text-center px-4">
                {t("no_files_to_display")}
                <br />
                <span className="hidden sm:inline">
                  {t("clone_repo_first")}
                </span>
                <span className="sm:hidden">{t("clone_repo_first")}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer open={isFilesDrawerOpen} onOpenChange={setIsFilesDrawerOpen}>
        <DrawerContent className="w-full max-h-[80vh]">
          <DrawerHeader className="py-3 px-4 border-b border-foreground/10">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2 text-base text-foreground">
                <FileText className="w-4 h-4" />
                {t("selected_files")}
                <Badge
                  variant="secondary"
                  className="bg-foreground/10 text-foreground px-2 py-0.5 text-xs"
                >
                  {selectedFiles.length}
                </Badge>
              </DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-foreground/10"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="p-3 overflow-y-auto">
            {selectedFiles.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {selectedFiles.map((file, index) => (
                  <li
                    key={file}
                    className="text-foreground py-1.5 px-2 rounded bg-background border border-foreground/10 hover:bg-foreground/5 transition-colors break-all"
                  >
                    <span className="text-muted-foreground mr-2">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    {file}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">
                  {t("no_files_selected")}
                </p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
