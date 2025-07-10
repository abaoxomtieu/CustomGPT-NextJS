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
import { useAuth } from "@/hooks/use-auth";
import { LoginButton } from "@/components/login-button";
import { useTranslations } from "next-intl";
import {
  generateImage,
  generateImagePrompt,
} from "@/services/imageGenerationService";

export default function ImageGenClient() {
  const { isLogin } = useAuth();
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

    if (!isLogin) {
      toast.error(t("errors.loginRequired"));
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

    if (!isLogin) {
      toast.error(t("errors.loginRequired"));
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
      } else if (error.response?.status === 401) {
        toast.error(t("errors.loginRequired"));
      } else if (error.response?.status === 500) {
        toast.error(t("errors.serverError"));
      } else {
        toast.error(t("errors.promptGenerationFailed"));
      }
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {t("loginRequired.title")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("loginRequired.description")}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-xl font-bold">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {t("form.generateButton")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt">{t("form.promptLabel")}</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPromptModal(true)}
                      className="text-xs"
                    >
                      <Maximize2 className="w-3 h-3 mr-1" />
                      {t("form.expandPrompt")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGeneratePrompt}
                      disabled={
                        !prompt.trim() || isGeneratingPrompt || isGenerating
                      }
                      className="text-xs"
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          {t("form.generatingPrompt")}
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {t("form.suggestPrompt")}
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
                  className="resize-none max-h-16"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>{t("form.referenceImageLabel")}</Label>
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
                      className="w-full h-32 border-dashed border-2 hover:border-primary/50"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {t("form.uploadText")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("form.uploadSubtext")}
                        </p>
                      </div>
                    </Button>
                  ) : (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Selected reference"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={removeSelectedImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {selectedImage.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
                >
                  {t("form.clearButton")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {t("result.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              {generatedImage ? (
                <div className="space-y-4 w-full">
                  <div className="relative w-full h-64 rounded-lg border shadow-lg overflow-hidden bg-gray-50">
                    <img
                      src={generatedImage}
                      alt="Generated image"
                      className="w-full h-full object-contain"
                      style={{ maxHeight: "16rem" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={openPreview}
                      className="flex-1"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t("result.previewButton")}
                    </Button>
                    <Button
                      onClick={downloadImage}
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("result.downloadButton")}
                    </Button>
                  </div>
                </div>
              ) : textResponse ? (
                <div className="space-y-4 w-full">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg h-48 overflow-y-auto">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm font-medium">
                          !
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-orange-800 mb-1">
                          {t("result.needMoreDetails")}
                        </h4>
                        <p className="text-sm text-orange-700 leading-relaxed">
                          {textResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    <p>{t("result.tryAgainTip")}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isGenerating
                        ? t("result.generatingText")
                        : t("result.placeholderText")}
                    </p>
                    {isGenerating && (
                      <div className="mt-4">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("tips.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  {t("tips.goodPrompts.title")}
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t("tips.goodPrompts.tip1")}</li>
                  <li>{t("tips.goodPrompts.tip2")}</li>
                  <li>{t("tips.goodPrompts.tip3")}</li>
                  <li>{t("tips.goodPrompts.tip4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  {t("tips.referenceImages.title")}
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t("tips.referenceImages.tip1")}</li>
                  <li>{t("tips.referenceImages.tip2")}</li>
                  <li>{t("tips.referenceImages.tip3")}</li>
                  <li>{t("tips.referenceImages.tip4")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{t("result.previewTitle")}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
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
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t("form.promptModalTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="modal-prompt">{t("form.promptLabel")}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGeneratePrompt}
                    disabled={
                      !prompt.trim() || isGeneratingPrompt || isGenerating
                    }
                    className="text-xs"
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        {t("form.generatingPrompt")}
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-3 h-3 mr-1" />
                        {t("form.suggestPrompt")}
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="modal-prompt"
                  placeholder={t("form.promptPlaceholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={12}
                  className="resize-none min-h-[300px]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPromptModal(false)}
                >
                  {t("form.closeModal")}
                </Button>
                <Button
                  onClick={() => {
                    setShowPromptModal(false);
                    handleGenerate();
                  }}
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
