"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Upload,
  Download,
  X,
  ImageIcon,
  Sparkles,
  Eye,
  Lightbulb,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  generateImage,
  generateImagePrompt,
} from "@/services/imageGenerationService";

export default function ImageGenClient() {
  const t = useTranslations("imageGeneration");
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("errors.fileSizeLimit"));
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("errors.invalidFileType"));
        return;
      }

      setSelectedImage(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t("errors.enterPrompt"));
      return;
    }

    setIsGenerating(true);
    try {
      const responseBlob = await generateImage(
        prompt,
        selectedImage || undefined
      );

      console.log(responseBlob);

      // Check if response is text or image
      if (responseBlob.type === "text/plain") {
        // Handle text response - show as notification and in UI
        const textContent = await responseBlob.text();
        setTextResponse(textContent);
        setGeneratedImage(null);

        toast.error(t("errors.moreDetails", { message: textContent }), {
          duration: 8000, // Show longer for user to read
        });
      } else if (responseBlob.type.startsWith("image/")) {
        // Handle image response
        const imageUrl = URL.createObjectURL(responseBlob);
        setGeneratedImage(imageUrl);
        setTextResponse(null);
        toast.success(t("success.imageGenerated"));
      } else {
        // Handle unexpected response type
        toast.error(t("errors.unexpectedFormat"));
        setGeneratedImage(null);
        setTextResponse(null);
      }
    } catch (error: any) {
      console.error("Error generating image:", error);

      // Handle different error types
      if (error.response?.status === 401) {
        toast.error(t("errors.loginRequired"));
      } else if (error.response?.status === 500) {
        toast.error(t("errors.serverError"));
      } else {
        toast.error(t("errors.generateFailed"));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    setPrompt("");
    setSelectedImage(null);
    setGeneratedImage(null);
    setTextResponse(null);
    setShowPreview(false);
    setShowPromptModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openPreview = () => {
    setShowPreview(true);
  };

  const handleGeneratePrompt = async () => {
    if (!prompt.trim()) {
      toast.error(t("errors.enterPrompt"));
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const enhancedPrompt = await generateImagePrompt(prompt);
      setPrompt(enhancedPrompt);
      toast.success(t("success.promptGenerated"));
    } catch (error: any) {
      console.error("Error generating prompt:", error);

      if (error.message === "API_KEY_REQUIRED") {
        toast.error(t("errors.apiKeyRequired"), {
          duration: 6000,
          action: {
            label: t("errors.setupApiKey"),
            onClick: () => window.open("/profile", "_blank"),
          },
        });
      } else if (error.response?.status === 500) {
        toast.error(t("errors.serverError"));
      } else {
        toast.error(t("errors.promptGenerationFailed"));
      }
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-3 sm:mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <h1 className="text-lg sm:text-xl font-bold">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Panel */}
          <Card className="order-2 xl:order-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("form.generateButton")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label
                    htmlFor="prompt"
                    className="text-sm sm:text-base font-medium"
                  >
                    {t("form.promptLabel")}
                  </Label>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPromptModal(true)}
                      className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                    >
                      <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">
                        {t("form.expandPrompt")}
                      </span>
                      <span className="sm:hidden">Mở rộng</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGeneratePrompt}
                      disabled={
                        !prompt.trim() || isGeneratingPrompt || isGenerating
                      }
                      className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                          <span className="hidden sm:inline">
                            {t("form.generatingPrompt")}
                          </span>
                          <span className="sm:hidden">Tạo...</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">
                            {t("form.suggestPrompt")}
                          </span>
                          <span className="sm:hidden">Gợi ý</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="prompt"
                  placeholder={t("form.promptPlaceholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base font-medium">
                  {t("form.referenceImageLabel")}
                </Label>
                <div className="space-y-3">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {!selectedImage ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 sm:h-32 border-dashed border-2 hover:border-primary/50 touch-manipulation"
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t("form.uploadText")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                          {t("form.uploadSubtext")}
                        </p>
                      </div>
                    </Button>
                  ) : (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Selected reference"
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={removeSelectedImage}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 p-0 touch-manipulation"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs max-w-[80%] truncate">
                        {selectedImage.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full sm:flex-1 h-12 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 touch-manipulation text-sm sm:text-base"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("form.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("form.generateButton")}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={isGenerating}
                  className="w-full sm:w-auto h-12 sm:h-10 touch-manipulation text-sm sm:text-base"
                >
                  {t("form.clearButton")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card className="order-1 xl:order-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("result.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] flex items-center justify-center">
              {generatedImage ? (
                <div className="space-y-3 sm:space-y-4 w-full">
                  <div className="relative w-full min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] rounded-lg border shadow-lg overflow-hidden bg-gray-50">
                    <img
                      src={generatedImage}
                      alt="Generated image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={openPreview}
                      className="w-full sm:flex-1 h-10 sm:h-9 touch-manipulation text-sm"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t("result.previewButton")}
                    </Button>
                    <Button
                      onClick={downloadImage}
                      className="w-full sm:flex-1 h-10 sm:h-9 touch-manipulation text-sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("result.downloadButton")}
                    </Button>
                  </div>
                </div>
              ) : textResponse ? (
                <div className="space-y-3 sm:space-y-4 w-full">
                  <div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg min-h-[150px] sm:min-h-[200px] overflow-y-auto">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-xs sm:text-sm font-medium">
                          !
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-medium text-orange-800 mb-1">
                          {t("result.needMoreDetails")}
                        </h4>
                        <p className="text-xs sm:text-sm text-orange-700 leading-relaxed">
                          {textResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs sm:text-sm text-muted-foreground">
                    <p>{t("result.tryAgainTip")}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[200px] sm:min-h-[250px] border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center px-4">
                    <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {isGenerating
                        ? t("result.generatingText")
                        : t("result.placeholderText")}
                    </p>
                    {isGenerating && (
                      <div className="mt-3 sm:mt-4">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {t("tips.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                  {t("tips.goodPrompts.title")}
                </h4>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 pl-2">
                  <li className="leading-relaxed">
                    {t("tips.goodPrompts.tip1")}
                  </li>
                  <li className="leading-relaxed">
                    {t("tips.goodPrompts.tip2")}
                  </li>
                  <li className="leading-relaxed">
                    {t("tips.goodPrompts.tip3")}
                  </li>
                  <li className="leading-relaxed">
                    {t("tips.goodPrompts.tip4")}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                  {t("tips.referenceImages.title")}
                </h4>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 pl-2">
                  <li className="leading-relaxed">
                    {t("tips.referenceImages.tip1")}
                  </li>
                  <li className="leading-relaxed">
                    {t("tips.referenceImages.tip2")}
                  </li>
                  <li className="leading-relaxed">
                    {t("tips.referenceImages.tip3")}
                  </li>
                  <li className="leading-relaxed">
                    {t("tips.referenceImages.tip4")}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">
                {t("result.previewTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-2 sm:p-4">
              {generatedImage && (
                <img
                  src={generatedImage}
                  alt="Generated image preview"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Prompt Modal */}
        <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("form.promptModalTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label
                    htmlFor="modal-prompt"
                    className="text-sm sm:text-base font-medium"
                  >
                    {t("form.promptLabel")}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGeneratePrompt}
                    disabled={
                      !prompt.trim() || isGeneratingPrompt || isGenerating
                    }
                    className="text-xs sm:text-sm h-8 px-2 sm:px-3 w-full sm:w-auto"
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        <span className="hidden sm:inline">
                          {t("form.generatingPrompt")}
                        </span>
                        <span className="sm:hidden">Tạo gợi ý...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">
                          {t("form.suggestPrompt")}
                        </span>
                        <span className="sm:hidden">Tạo gợi ý</span>
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="modal-prompt"
                  placeholder={t("form.promptPlaceholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={8}
                  className="resize-none min-h-[200px] sm:min-h-[300px] text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPromptModal(false)}
                  className="w-full sm:w-auto h-10 sm:h-9 text-sm touch-manipulation"
                >
                  {t("form.closeModal")}
                </Button>
                <Button
                  onClick={() => {
                    setShowPromptModal(false);
                    handleGenerate();
                  }}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full sm:w-auto h-10 sm:h-9 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-sm touch-manipulation"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("form.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("form.generateButton")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
