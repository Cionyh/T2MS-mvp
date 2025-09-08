"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Smartphone, Monitor } from "lucide-react";

type WidgetType = "banner" | "ticker" | "modal" | "popup" | "fullscreen";

export function LiveSandbox() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [widgetType, setWidgetType] = useState<WidgetType>("banner");
  const [displayText, setDisplayText] = useState("Your live demo will appear here!");
  const [showModal, setShowModal] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const newMessage = `You typed: "${input}"`;
    setMessages((prev) => [...prev.slice(-4), newMessage]); // Keep only last 5 messages

    setTimeout(() => {
      setDisplayText(input.toUpperCase());
      setMessages((prev) => [...prev, `Demo response: "${input.toUpperCase()}" updated!`]);
      if (widgetType === "modal") setShowModal(true);
      if (widgetType === "fullscreen") setShowFullscreen(true);
    }, 300);

    setInput("");
  }, [input, widgetType]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  }, [handleSend]);

  const widgetTypes = useMemo(() => [
    { type: "banner", label: "Banner" },
    { type: "ticker", label: "Ticker" },
    { type: "modal", label: "Modal" },
    { type: "popup", label: "Popup" },
    { type: "fullscreen", label: "Fullscreen" }
  ] as const, []);

  const renderPreview = useCallback(() => {
    const text = displayText;
    const isSmallScreen = isMobile;

    switch (widgetType) {
      case "banner":
        return (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full p-3 sm:p-4 rounded-xl bg-primary text-white font-semibold text-center shadow-lg ${
              isSmallScreen ? 'text-sm' : 'text-base'
            }`}
          >
            {text}
          </motion.div>
        );
      case "ticker":
        return (
          <motion.div
            key={text}
            className="overflow-hidden whitespace-nowrap w-full bg-primary/70 rounded-xl py-2 px-3 sm:px-4 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`inline-block ${isSmallScreen ? 'text-sm' : 'text-base'}`}
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              {text} — Live Demo —
            </motion.div>
          </motion.div>
        );
      case "modal":
        return (
          <div className="relative w-full h-32 sm:h-48 flex items-center justify-center">
            {showModal ? (
              <motion.div
                key={text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-background p-4 sm:p-6 rounded-xl shadow-xl text-center border ${
                  isSmallScreen ? 'w-64' : 'w-80'
                }`}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <p className={`font-bold ${isSmallScreen ? 'text-base' : 'text-lg'}`}>
                  {text}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`relative bg-background/50 p-4 sm:p-6 rounded-xl shadow-lg text-center border-2 border-dashed border-muted ${
                  isSmallScreen ? 'w-64' : 'w-80'
                }`}
              >
                <p className={`font-medium text-muted-foreground ${isSmallScreen ? 'text-sm' : 'text-base'}`}>
                  Modal Preview - Click Send to show modal
                </p>
              </motion.div>
            )}
          </div>
        );
      case "popup":
        return (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg ${
              isSmallScreen ? 'text-sm' : 'text-base'
            }`}
          >
            {text}
          </motion.div>
        );
      case "fullscreen":
        return (
          <div className="relative w-full h-32 sm:h-48 flex items-center justify-center">
            <AnimatePresence>
              {showFullscreen ? (
                <motion.div
                  key={text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 bg-primary flex items-center justify-center text-white font-bold z-50"
                >
                  <button
                    onClick={() => setShowFullscreen(false)}
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white hover:text-white/70 transition-colors bg-black/20 rounded-full p-2"
                  >
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                  <p className={`text-center px-4 ${isSmallScreen ? 'text-xl' : 'text-3xl'}`}>
                    {text}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`w-full p-3 sm:p-4 rounded-xl bg-primary/50 text-white font-semibold text-center shadow-lg ${
                    isSmallScreen ? 'text-sm' : 'text-base'
                  }`}
                >
                  Fullscreen Preview - Click Send to show fullscreen
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  }, [displayText, widgetType, showModal, showFullscreen, isMobile]);

  if (!mounted) return null;

  return (
    <section className="w-full px-2 sm:px-4 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 max-w-6xl mx-auto">
        {/* Controls */}
        <div className="flex-1 bg-background border border-muted rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-xl sm:text-2xl font-bold">Live Sandbox</h3>
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 sm:mb-6">
            Type a keyword and watch the widget update live!
          </p>

          {/* Widget Type Selector */}
          <div className="flex justify-center gap-1 sm:gap-2 mb-4 flex-wrap">
            {widgetTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => {
                  setWidgetType(type as WidgetType);
                  if (type === "modal") setShowModal(false);
                  if (type === "fullscreen") setShowFullscreen(false);
                }}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  widgetType === type
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-foreground hover:bg-primary/20 hover:shadow-sm"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Type a sample keyword..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border border-muted rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 text-sm sm:text-base"
            >
              <Send className="w-4 h-4" /> 
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          {/* Messages */}
          <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-muted rounded-lg p-2 text-xs sm:text-sm shadow-sm"
                >
                  {msg}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center relative min-h-[200px] sm:min-h-[300px] z-10">
          {renderPreview()}
        </div>
      </div>
    </section>
  );
}
