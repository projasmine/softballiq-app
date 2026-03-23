"use client";

import { useState, useEffect } from "react";
import { X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari when not already installed as PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");

    if (isIOS && !isStandalone && !dismissed) {
      // Delay showing to not interrupt the first experience
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-semibold">Add Softball IQ to Home Screen</p>
            <p className="text-xs text-muted-foreground">
              Get quick access like a real app — no download needed!
            </p>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary shrink-0">1</span>
            <span className="text-muted-foreground">
              Tap the <Share className="inline h-3.5 w-3.5 mx-0.5 -mt-0.5" /> <strong className="text-foreground">Share</strong> button in Safari
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary shrink-0">2</span>
            <span className="text-muted-foreground">
              Scroll down and tap <Plus className="inline h-3.5 w-3.5 mx-0.5 -mt-0.5" /> <strong className="text-foreground">Add to Home Screen</strong>
            </span>
          </div>
        </div>
        <Button size="sm" variant="outline" className="w-full text-xs" onClick={dismiss}>
          Maybe Later
        </Button>
      </div>
    </div>
  );
}
