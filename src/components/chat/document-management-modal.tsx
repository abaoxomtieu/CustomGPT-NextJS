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
import { Plus, Upload, Pencil, Trash2, RotateCcw, X } from "lucide-react";
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
          <Button variant="outline">Quản lý tài liệu</Button>
        </DialogTrigger>
      )}
      <DialogContent className=" max-h-[90vh] flex flex-col p-5 !max-w-none !w-2/3">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Quản lý tài liệu</DialogTitle>
          <DialogDescription>
            Thêm, chỉnh sửa, xóa và upload tài liệu cho chatbot.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
          <Button
            onClick={() => {
              setIsDialogOpen(true);
              setEditingDocument(null);
              setContent("");
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm tài liệu
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsFileUploadDialogVisible(true)}
          >
            <Upload className="w-4 h-4 mr-2" /> Upload file
          </Button>
          <Button variant="outline" onClick={fetchDocuments} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" /> Tải lại
          </Button>
          {selectedIds.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa đã chọn
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="p-0 w-64">
                <Alert variant="destructive" className="p-4">
                  <AlertTitle>Bạn chắc chắn muốn xóa?</AlertTitle>
                  <AlertDescription>
                    Xóa tất cả tài liệu được chọn khỏi hệ thống.
                  </AlertDescription>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(selectedIds)}
                    >
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
            <div className="flex items-center justify-center h-32">
              <div className="text-center">Đang tải...</div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="flex-1 overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-12 p-2 text-left">
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
                        />
                      </th>
                      <th className="p-2 text-left font-medium">ID</th>
                      <th className="p-2 text-left font-medium">Nội dung</th>
                      <th className="p-2 text-left font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-gray-500"
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
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2">
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
                              />
                            </td>
                            <td className="p-2">
                              <div
                                className="truncate max-w-[120px] text-xs font-mono"
                                title={doc.id}
                              >
                                {doc.id.substring(0, 8)}...
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="max-w-[300px]">
                                <div
                                  className="truncate text-sm"
                                  title={doc.page_content}
                                >
                                  {doc.page_content}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {doc.page_content.length} ký tự
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => showEditDialog(doc)}
                                  title="Chỉnh sửa"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    side="bottom"
                                    align="start"
                                    className="p-0 w-64"
                                  >
                                    <Alert
                                      variant="destructive"
                                      className="p-4"
                                    >
                                      <AlertTitle>
                                        Bạn chắc chắn muốn xóa?
                                      </AlertTitle>
                                      <AlertDescription>
                                        Hành động này sẽ xóa tài liệu khỏi hệ
                                        thống.
                                      </AlertDescription>
                                      <div className="flex justify-end gap-2 mt-4">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleDelete([doc.id])}
                                        >
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
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-gray-500">
                    Hiển thị{" "}
                    {Math.min(
                      (currentPage - 1) * pageSize + 1,
                      documents.length
                    )}{" "}
                    - {Math.min(currentPage * pageSize, documents.length)} của{" "}
                    {documents.length} tài liệu
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} /{" "}
                      {Math.ceil(documents.length / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        currentPage >= Math.ceil(documents.length / pageSize)
                      }
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? "Chỉnh sửa tài liệu" : "Thêm tài liệu"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleAddOrEdit}
              className="space-y-4 mt-4"
              autoComplete="off"
            >
              <div>
                <label className="block mb-2 font-medium">Nội dung</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="submit">
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
