"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FlyerViewProps {
  teamName: string;
  joinCode: string;
  ageGroup: string;
  joinUrl: string;
}

export function FlyerView({ teamName, joinCode, ageGroup, joinUrl }: FlyerViewProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}&format=svg`;

  return (
    <>
      {/* Screen-only controls */}
      <div className="print:hidden space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print Flyer
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Print this page or use &quot;Save as PDF&quot; to share with your team.
        </p>
      </div>

      {/* Printable flyer */}
      <div className="bg-white text-gray-900 rounded-xl overflow-hidden print:rounded-none print:shadow-none shadow-lg max-w-md mx-auto">
        {/* Header band */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-5 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {teamName}
          </h1>
          <p className="text-sm font-medium text-gray-800/80 mt-0.5">
            {ageGroup} Softball
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-gray-900">
              Join Us on Softball IQ
            </h2>
            <p className="text-sm text-gray-600">
              Practice your game IQ with daily quizzes
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <img
                src={qrUrl}
                alt={`QR code to join ${teamName}`}
                width={200}
                height={200}
                className="w-[200px] h-[200px]"
              />
            </div>
          </div>

          {/* Scan instructions */}
          <p className="text-center text-sm text-gray-500 font-medium">
            Scan the QR code with your phone camera
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Manual join */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Go to <span className="font-semibold text-gray-900">softballiq.app/join</span>
            </p>
            <p className="text-xs text-gray-500">and enter the team code:</p>
            <div className="inline-block bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-6 py-3">
              <span className="text-2xl font-mono font-extrabold tracking-[0.2em] text-gray-900">
                {joinCode}
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              How to Join
            </p>
            <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>Scan the QR code or go to <span className="font-medium">softballiq.app/join</span></li>
              <li>Find your name on the roster and tap it</li>
              <li>Start your first Daily Rep — 5 questions a day!</li>
            </ol>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/logo.png"
                alt="Softball IQ"
                className="h-6 w-auto print:h-5"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Free softball game IQ training for 8U–14U
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
