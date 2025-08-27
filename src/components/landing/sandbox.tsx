"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";

type WidgetType = "banner" | "ticker" | "modal" | "popup" | "fullscreen";

export function LiveSandbox() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [widgetType, setWidgetType] = useState<WidgetType>("banner");
  const [displayText, setDisplayText] = useState("Your live demo will appear here!");
  const [showModal, setShowModal] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `You typed: "${input}"`]);

    setTimeout(() => {
      setDisplayText(input.toUpperCase());
      setMessages((prev) => [...prev, `Demo response: "${input.toUpperCase()}" updated!`]);
      if (widgetType === "modal") setShowModal(true);
      if (widgetType === "fullscreen") setShowFullscreen(true);
    }, 500);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const renderPreview = () => {
    const text = displayText;

    switch (widgetType) {
      case "banner":
        return (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full p-4 rounded-xl bg-primary text-white font-semibold text-center shadow-none"
          >
            {text}
          </motion.div>
        );
      case "ticker":
        return (
          <motion.div
            key={text}
            className="overflow-hidden whitespace-nowrap w-full bg-primary/70 rounded-xl py-2 px-4 shadow-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="inline-block"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              {text} — Live Demo — {text} — Live Demo —
            </motion.div>
          </motion.div>
        );
      case "modal":
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-background p-6 rounded-xl shadow-xl text-center w-80"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="text-lg font-bold">{showModal ? text : "Modal Preview"}</p>
            </motion.div>
          </div>
        );
      case "popup":
        return (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-8 right-8 bg-primary text-white px-6 py-3 rounded-xl shadow-none"
          >
            {text}
          </motion.div>
        );
      case "fullscreen":
        return (
          <div className="relative w-full h-48 flex items-center justify-center">
            <AnimatePresence>
              {showFullscreen ? (
                <motion.div
                  key={text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fixed inset-0 bg-primary flex items-center justify-center text-white text-3xl font-bold z-50"
                >
                  <button
                    onClick={() => setShowFullscreen(false)}
                    className="absolute top-6 right-6 text-white hover:text-muted-foreground"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  {text}
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full p-4 rounded-xl bg-primary/50 text-white font-semibold text-center shadow-none"
                >
                  Fullscreen Preview
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="w-full px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Controls */}
        <div className="flex-1 bg-background border border-muted rounded-3xl p-6 shadow-none">
          <h3 className="text-2xl font-bold text-center mb-3">Live Sandbox</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Type a keyword and watch the widget update live!
          </p>

          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {["banner", "ticker", "modal", "popup", "fullscreen"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setWidgetType(type as WidgetType);
                  if (type === "modal") setShowModal(false);
                  if (type === "fullscreen") setShowFullscreen(false);
                }}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                  widgetType === type
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground hover:bg-primary/20"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Type a sample keyword..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border border-muted rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="bg-primary text-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted rounded-xl p-2 text-sm shadow-sm"
                >
                  {msg}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center relative min-h-[300px] z-999">
          {renderPreview()}
        </div>
      </div>
    </section>
  );
}
