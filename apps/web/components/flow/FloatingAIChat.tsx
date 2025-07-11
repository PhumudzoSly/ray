import { useState, CSSProperties } from "react";
import { AIChatPanel } from "./ai-chat-panel";
import { Project } from "@/lib/types";
import { Bot, MessageSquare, X, Sparkles } from "lucide-react";

interface FloatingAIChatProps {
  project: Project;
  position?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export function FloatingAIChat({ project, position }: FloatingAIChatProps) {
  const [open, setOpen] = useState(false);

  // Compute style for panel and button
  const baseStyle: CSSProperties = {
    position: "fixed",
    zIndex: 1100,
    ...(position?.top !== undefined ? { top: position.top } : { bottom: 32 }),
    ...(position?.right !== undefined
      ? { right: position.right }
      : { right: 32 }),
    ...(position?.left !== undefined ? { left: position.left } : {}),
    ...(position?.bottom !== undefined ? { bottom: position.bottom } : {}),
  };

  return (
    <>
      {/* Enhanced Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={baseStyle}
          className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center border border-border/20 hover:scale-110 transition-all duration-300 ease-out"
          aria-label="Open AI Chat"
        >
          <Bot size={24} className="group-hover:scale-110 transition-transform duration-200" />
          
          {/* Animated ring effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-ping opacity-20" />
          
          {/* Sparkle effect */}
          <div className="absolute -top-1 -right-1">
            <Sparkles size={12} className="text-yellow-300 animate-pulse" />
          </div>
        </button>
      )}

      {/* Enhanced Overlay and Floating Chat Panel */}
      {open && (
        <>
          {/* Improved Overlay */}
          <div
            className="fixed inset-0 z-[1099] bg-black/20 backdrop-blur-sm"
            aria-label="Close AI Chat Overlay"
            onClick={() => setOpen(false)}
          />
          <div
            style={baseStyle}
            className="w-[420px] h-[640px] bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-[1100]"
            role="dialog"
            aria-modal="true"
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-sm">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ready to help with your flow</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors duration-200 group"
                aria-label="Close AI Chat"
                tabIndex={0}
              >
                <X size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Scrollable Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <AIChatPanel project={project} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
