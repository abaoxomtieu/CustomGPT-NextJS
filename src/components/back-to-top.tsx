"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div
      className={`fixed bottom-30 right-6 z-50 transition-opacity ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-2xl"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  )
}
