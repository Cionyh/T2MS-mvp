"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const CHAT_URL =
  process.env.NEXT_PUBLIC_CHAT_ASSISTANT_URL ??
  "https://chatassistant.base44.app";

const HIDDEN_PREFIXES = [
  "/admin",
  "/worker",
  "/accept-invitation",
  "/onboarding",
  "/sign-in",
  "/signup",
  "/church",
  "/church-page-announcements",
  "/church-announcement",
  "/announce",
  "/affiliate",
] as const;

function shouldHideChat(pathname: string | null): boolean {
  if (!pathname) return true;
  return HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function ChatAssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hide = shouldHideChat(pathname);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (hide) setOpen(false);
  }, [hide]);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) setOpen(false);
    },
    [],
  );

  if (hide) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-[9999] cursor-pointer rounded-full border-none bg-amber-800 px-[22px] py-[14px] text-[15px] font-medium text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-colors hover:bg-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
      >
        💬 Chat with Us
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat assistant"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={onBackdropClick}
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-white text-lg leading-none text-neutral-900 shadow-md transition-colors hover:bg-neutral-100"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
          <iframe
            title="T2MS Chat Assistant"
            src={CHAT_URL}
            className="h-[680px] max-h-[calc(100vh-32px)] w-[420px] max-w-full rounded-2xl border-none shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          />
        </div>
      ) : null}
    </>
  );
}
