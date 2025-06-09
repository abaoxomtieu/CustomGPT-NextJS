"use client"

import { Toaster } from "@/components/ui/sonner"

export default function CreatePromptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full bg-background">
      <Toaster />
      {children}
    </div>
  )
} 