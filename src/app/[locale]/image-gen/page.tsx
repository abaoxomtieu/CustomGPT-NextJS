import { Metadata } from "next";
import ImageGenClient from "./image-gen-client";
import { Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Image Generation",
  description:
    "Generate images using AI with text prompts and optional image inputs",
};

export default function ImageGenPage() {
  return <ImageGenClient />;
}
