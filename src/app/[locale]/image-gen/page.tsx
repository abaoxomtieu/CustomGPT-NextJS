import { Metadata } from "next";
import ImageGenClient from "./image-gen-client";

export const metadata: Metadata = {
  title: "Image Generation",
  description: "Generate images using AI with text prompts and optional image inputs",
};

export default function ImageGenPage() {
  return <ImageGenClient />;
} 