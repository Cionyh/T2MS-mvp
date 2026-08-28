"use client"

import { useEffect, useRef } from "react"
import { Bold, Italic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  richTextPlainLength,
  richTextToEditorHtml,
  sanitizeBasicRichText,
  serializeContentEditable,
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
  const focusedRef = useRef(false)

  // Only push external value into the DOM when not actively typing.
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (focusedRef.current) return
    if (lastEmitted.current === value && el.dataset.hydrated === "1") return
    el.innerHTML = richTextToEditorHtml(value)
    el.dataset.hydrated = "1"
    lastEmitted.current = value
  }, [value])

  const readEditorValue = () => {
    const el = editorRef.current
    if (!el) return ""
    const serialized = serializeContentEditable(el)
    return sanitizeBasicRichText(serialized, maxLength)
  }

  const emitFromEditor = (rewriteDom = false) => {
    const el = editorRef.current
    if (!el) return
    const sanitized = readEditorValue()
    // Never rewrite the live DOM while typing — that jumps the caret.
    if (rewriteDom && el.innerHTML !== sanitized) {
      el.innerHTML = sanitized || ""
    }
    if (sanitized === lastEmitted.current) return
    lastEmitted.current = sanitized
    onChange(sanitized)
  }

  const runCommand = (command: "bold" | "italic") => {
    editorRef.current?.focus()
    document.execCommand(command, false)
    emitFromEditor(false)
  }

  const insertLineBreak = () => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    // Explicit <br> so saved HTML matches what the announcement page renders.
    // A trailing ZWSP helps some browsers keep the caret on the new line.
    document.execCommand("insertHTML", false, "<br>\u200B")
    emitFromEditor(false)
  }

  const plainLen = richTextPlainLength(value)
  const showPlaceholder =
    !value || value.replace(/<br\s*\/?>/gi, "").replace(/&nbsp;/gi, "").trim() === ""

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
            "w-full px-3 py-2 text-sm outline-none focus-visible:ring-0 break-words",
            minHeightClassName
          )}
          onFocus={() => {
            focusedRef.current = true
          }}
          onInput={() => emitFromEditor(false)}
          onBlur={() => {
            focusedRef.current = false
            emitFromEditor(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              insertLineBreak()
              return
            }
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
