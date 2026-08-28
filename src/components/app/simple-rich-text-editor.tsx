"use client"

import { useEffect, useRef } from "react"
import { Bold, Italic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  richTextPlainLength,
  richTextToEditorHtml,
  sanitizeBasicRichText,
} from "@/lib/rich-text"

type SimpleRichTextEditorProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  minHeightClassName?: string
  className?: string
}

export function SimpleRichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  maxLength = 1000,
  minHeightClassName = "min-h-[88px]",
  className,
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef<string | null>(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Skip rewrite while typing the same value we just emitted
    if (lastEmitted.current === value && el.dataset.hydrated === "1") return
    el.innerHTML = richTextToEditorHtml(value)
    el.dataset.hydrated = "1"
    lastEmitted.current = value
  }, [value])

  const emitFromEditor = () => {
    const el = editorRef.current
    if (!el) return
    const sanitized = sanitizeBasicRichText(el.innerHTML, maxLength)
    // Keep editor in sync if sanitize changed content (e.g. truncated)
    if (el.innerHTML !== sanitized && sanitized) {
      const sel = window.getSelection()
      const hadFocus = document.activeElement === el
      el.innerHTML = sanitized
      if (hadFocus) {
        el.focus()
        // Place caret at end
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    } else if (!sanitized) {
      // empty
    }
    lastEmitted.current = sanitized
    onChange(sanitized)
  }

  const runCommand = (command: "bold" | "italic") => {
    editorRef.current?.focus()
    document.execCommand(command, false)
    emitFromEditor()
  }

  const plainLen = richTextPlainLength(value)
  const showPlaceholder = !value || value.replace(/<br\s*\/?>/gi, "").trim() === ""

  return (
    <div className={cn("rounded-md border border-input bg-background", className)}>
      <div className="flex items-center gap-1 border-b border-input px-1.5 py-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("bold")}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("italic")}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <span className="ml-auto pr-2 text-[11px] text-muted-foreground">
          {plainLen}/{maxLength}
        </span>
      </div>
      <div className="relative">
        {showPlaceholder && placeholder ? (
          <div
            className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground"
            aria-hidden
          >
            {placeholder}
          </div>
        ) : null}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "w-full px-3 py-2 text-sm outline-none focus-visible:ring-0",
            minHeightClassName
          )}
          onInput={emitFromEditor}
          onBlur={emitFromEditor}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
              e.preventDefault()
              runCommand("bold")
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
              e.preventDefault()
              runCommand("italic")
            }
          }}
        />
      </div>
    </div>
  )
}
