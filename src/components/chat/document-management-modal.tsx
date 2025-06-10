"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Upload, Pencil, Trash2, RotateCcw, X, Loader2 } from "lucide-react";
import DocumentUpload from "./document-upload";
import { DocumentVectorStore } from "../../../types/document";
import { documentService } from "@/services/documentService";

interface DocumentManagementDialogProps {
  botId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DocumentManagementDialog({
  botId,
  isOpen,
  onClose,
}: DocumentManagementDialogProps) {
  const [documents, setDocuments] = useState<DocumentVectorStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentVectorStore | null>(null);
  const [content, setContent] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFileUploadDialogVisible, setIsFileUploadDialogVisible] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.fetchDocuments(botId);
      setDocuments(data);
    } catch {
      toast.error("Lỗi tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [botId]);

  // Reset page when documents change
  useEffect(() => {
    setCurrentPage(1);
  }, [documents.length]);

  // add or edit document
  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }

    try {
      if (editingDocument) {
        // Edit
        const updatedDocument: DocumentVectorStore = {
          ...editingDocument,
          page_content: content,
        };
        await documentService.updateDocument(
          botId,
          updatedDocument,
          editingDocument.id
        );
        toast.success("Cập nhật tài liệu thành công");
      } else {
        // Add
        const metadata = { bot_id: botId };
        const documentToAdd: DocumentVectorStore = {
          id: crypto.randomUUID(),
          page_content: content,
          metadata,
        };
        await documentService.addDocuments(
          botId,
          [documentToAdd],
          [documentToAdd.id]
        );
        toast.success("Thêm tài liệu thành công");
      }
      setIsDialogOpen(false);
      setEditingDocument(null);
      setContent("");
      fetchDocuments();
    } catch {
      toast.error(
        editingDocument ? "Lỗi cập nhật tài liệu" : "Lỗi thêm tài liệu"
      );
    }
  };

  // delete documents
  const handleDelete = async (ids: string[]) => {
    try {
      await documentService.deleteDocuments(botId, ids);
      toast.success("Đã xóa tài liệu");
      setDocuments((prev) => prev.filter((doc) => !ids.includes(doc.id)));
      setSelectedIds([]);
    } catch {
      toast.error("Lỗi khi xóa tài liệu");
    }
  };

  // open edit dialog
  const showEditDialog = (document: DocumentVectorStore) => {
    setEditingDocument(document);
    setContent(document.page_content);
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {!isOpen && !onClose && (
        <DialogTrigger asChild>
          <Button variant="outline" className="text-sm md:text-base">Quản lý tài liệu</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] flex flex-col p-3 md:p-5 !max-w-[95vw] md:!max-w-2/3">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl">Quản lý tài liệu</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Thêm, chỉnh sửa, xóa và upload tài liệu cho chatbot.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-3 md:mb-4 flex-shrink-0">
          <Button
            onClick={() => {
              setIsDialogOpen(true);
              setEditingDocument(null);
              setContent("");
            }}
            disabled={loading}
            className="text-sm md:text-base"
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" /> Thêm tài liệu
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsFileUploadDialogVisible(true)}
            disabled={loading}
            className="text-sm md:text-base"
          >
            <Upload className="w-4 h-4 mr-1 md:mr-2" /> Upload file
          </Button>
          <Button variant="outline" onClick={fetchDocuments} disabled={loading} className="text-sm md:text-base">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 md:mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-1 md:mr-2" />
            )}
            {loading ? "Đang tải..." : "Tải lại"}
          </Button>
          {selectedIds.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="destructive" disabled={loading} className="text-sm md:text-base">
                  <Trash2 className="w-4 h-4 mr-1 md:mr-2" /> Xóa đã chọn
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="p-0 w-56 md:w-64">
                <Alert variant="destructive" className="p-3 md:p-4">
                  <AlertTitle className="text-sm md:text-base">Bạn chắc chắn muốn xóa?</AlertTitle>
                  <AlertDescription className="text-xs md:text-sm">
                    Xóa tất cả tài liệu được chọn khỏi hệ thống.
                  </AlertDescription>
                  <div className="flex justify-end gap-2 mt-3 md:mt-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(selectedIds)}
                      disabled={loading}
                      className="text-xs md:text-sm"
                    >
                      {loading ? (
                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                      ) : null}
                      Xác nhận
                    </Button>
                  </div>
                </Alert>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Table Container với scroll */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-24 md:h-32">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-primary" />
                <p className="text-sm md:text-base text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-secondary/50 sticky top-0">
                    <tr>
                      <th className="w-8 md:w-12 p-1 md:p-2 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === documents.length &&
                            documents.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(documents.map((doc) => doc.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          className="rounded"
                          disabled={loading}
                        />
                      </th>
                      <th className="p-1 md:p-2 text-left font-medium text-foreground">
                        ID
                      </th>
                      <th className="p-1 md:p-2 text-left font-medium text-foreground">
                        Nội dung
                      </th>
                      <th className="p-1 md:p-2 text-left font-medium text-foreground">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 md:p-8 text-center text-muted-foreground text-xs md:text-sm"
                        >
                          Không có tài liệu nào
                        </td>
                      </tr>
                    ) : (
                      documents
                        .slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize
                        )
                        .map((doc) => (
                          <tr
                            key={doc.id}
                            className="border-b hover:bg-secondary/50"
                          >
                            <td className="p-1 md:p-2">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(doc.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds([...selectedIds, doc.id]);
                                  } else {
                                    setSelectedIds(
                                      selectedIds.filter((id) => id !== doc.id)
                                    );
                                  }
                                }}
                                className="rounded"
                                disabled={loading}
                              />
                            </td>
                            <td className="p-1 md:p-2">
                              <div
                                className="truncate max-w-[80px] md:max-w-[120px] text-[10px] md:text-xs font-mono text-muted-foreground"
                                title={doc.id}
                              >
                                {doc.id.substring(0, 8)}...
                              </div>
                            </td>
                            <td className="p-1 md:p-2">
                              <div className="max-w-[200px] md:max-w-[300px]">
                                <div
                                  className="truncate text-xs md:text-sm text-foreground h-8 md:h-10"
                                  title={doc.page_content}
                                >
                                  {doc.page_content}
                                </div>
                                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                                  {doc.page_content.length} ký tự
                                </div>
                              </div>
                            </td>
                            <td className="p-1 md:p-2">
                              <div className="flex gap-0.5 md:gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => showEditDialog(doc)}
                                  title="Chỉnh sửa"
                                  disabled={loading}
                                  className="h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                  <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                                </Button>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Xóa"
                                      disabled={loading}
                                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                                    >
                                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    side="bottom"
                                    align="start"
                                    className="p-0 w-56 md:w-64"
                                  >
                                    <Alert
                                      variant="destructive"
                                      className="p-3 md:p-4"
                                    >
                                      <AlertTitle className="text-sm md:text-base">
                                        Bạn chắc chắn muốn xóa?
                                      </AlertTitle>
                                      <AlertDescription className="text-xs md:text-sm">
                                        Hành động này sẽ xóa tài liệu khỏi hệ
                                        thống.
                                      </AlertDescription>
                                      <div className="flex justify-end gap-2 mt-3 md:mt-4">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleDelete([doc.id])}
                                          disabled={loading}
                                          className="text-xs md:text-sm"
                                        >
                                          {loading ? (
                                            <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                                          ) : null}
                                          Xác nhận
                                        </Button>
                                      </div>
                                    </Alert>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {documents.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-3 md:mt-4 px-1 md:px-2">
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Hiển thị{" "}
                    {Math.min(
                      (currentPage - 1) * pageSize + 1,
                      documents.length
                    )}{" "}
                    - {Math.min(currentPage * pageSize, documents.length)} của{" "}
                    {documents.length} tài liệu
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="text-xs md:text-sm h-7 md:h-8"
                    >
                      Trước
                    </Button>
                    <span className="text-xs md:text-sm text-foreground">
                      Trang {currentPage} /{" "}
                      {Math.ceil(documents.length / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        currentPage >= Math.ceil(documents.length / pageSize) || loading
                      }
                      className="text-xs md:text-sm h-7 md:h-8"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dialog thêm/chỉnh sửa tài liệu */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">
                {editingDocument ? "Chỉnh sửa tài liệu" : "Thêm tài liệu"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleAddOrEdit}
              className="space-y-3 md:space-y-4 mt-3 md:mt-4"
              autoComplete="off"
            >
              <div>
                <label className="block mb-1 md:mb-2 font-medium text-sm md:text-base">Nội dung</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-2/3 p-2 overflow-x-hidden text-sm md:text-base"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="submit" className="text-sm md:text-base">
                  {editingDocument ? "Lưu" : "Tạo mới"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingDocument(null);
                    setContent("");
                  }}
                  className="text-sm md:text-base"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog upload file */}
        <DocumentUpload
          isVisible={isFileUploadDialogVisible}
          onClose={() => setIsFileUploadDialogVisible(false)}
          botId={botId}
        />
      </DialogContent>
    </Dialog>
  );
}
