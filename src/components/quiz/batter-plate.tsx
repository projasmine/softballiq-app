"use client";

import { type Situation } from "@/lib/db/schema";

interface BatterPlateProps {
  situation?: Situation | null;
  className?: string;
}

export function BatterPlate({ situation, className }: BatterPlateProps) {
  const count = situation?.count ?? { balls: 0, strikes: 0 };
  const outs = situation?.outs ?? 0;
  const inning = situation?.inning;
  const score = situation?.score;
  const runners = situation?.runners ?? [];

  return (
    <div className={className}>
      <svg
        viewBox="0 0 400 300"
        width="100%"
        className="max-w-[360px] mx-auto"
        role="img"
        aria-label="Batter's box diagram"
      >
        {/* Background */}
        <rect width="400" height="300" fill="#2d5a27" rx="12" />

        {/* Dirt circle around plate */}
        <ellipse cx={200} cy={195} rx={110} ry={90} fill="#c4956a" />
        <ellipse cx={200} cy={195} rx={90} ry={72} fill="#b08558" />

        {/* Home plate */}
        <polygon
          points="200,165 185,175 185,190 215,190 215,175"
          fill="white"
          stroke="#d4d4d4"
          strokeWidth="1"
        />

        {/* Batter's boxes */}
        <rect
          x={135} y={155} width={40} height={55}
          fill="none" stroke="white" strokeWidth="2" opacity={0.7} rx="2"
        />
        <rect
          x={225} y={155} width={40} height={55}
          fill="none" stroke="white" strokeWidth="2" opacity={0.7} rx="2"
        />

        {/* Right-handed batter silhouette */}
        <g transform="translate(240, 165)">
          {/* Helmet */}
          <ellipse cx={0} cy={-2} rx={7} ry={8} fill="#1e293b" />
          <rect x={-8} y={-6} width={5} height={8} rx={2} fill="#1e293b" />
          {/* Face area */}
          <ellipse cx={1} cy={0} rx={4.5} ry={5.5} fill="#d4a574" />

          {/* Neck */}
          <rect x={-2} y={6} width={4} height={4} fill="#d4a574" rx={1} />

          {/* Torso - jersey */}
          <path
            d="M-10,10 C-10,10 -12,12 -12,18 L-12,30 C-12,32 -10,34 -6,34 L6,34 C10,34 12,32 12,30 L12,18 C12,12 10,10 10,10 Z"
            fill="#374151"
            stroke="#1f2937"
            strokeWidth="0.5"
          />
          {/* Jersey number hint */}
          <text x={0} y={26} fill="#6b7280" fontSize="8" textAnchor="middle" fontFamily="system-ui" fontWeight="bold">
            7
          </text>

          {/* Back arm (farther) */}
          <path
            d="M-10,14 C-16,12 -18,8 -14,4"
            fill="none" stroke="#374151" strokeWidth="5" strokeLinecap="round"
          />
          {/* Back hand */}
          <circle cx={-14} cy={3} r={3} fill="#d4a574" />

          {/* Front arm (closer) */}
          <path
            d="M10,14 C16,10 18,6 14,2"
            fill="none" stroke="#374151" strokeWidth="5" strokeLinecap="round"
          />
          {/* Front hand */}
          <circle cx={14} cy={1} r={3} fill="#d4a574" />

          {/* Bat */}
          <line x1={14} y1={2} x2={26} y2={-22} stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
          <line x1={26} y1={-22} x2={30} y2={-30} stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
          {/* Bat knob */}
          <circle cx={13} cy={3} r={2.5} fill="#713f12" />

          {/* Pants */}
          <path
            d="M-6,34 L-8,48 L-3,48 L0,38 L3,48 L8,48 L6,34 Z"
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="0.5"
          />

          {/* Cleats */}
          <rect x={-9} y={47} width={7} height={4} rx={2} fill="#1e293b" />
          <rect x={2} y={47} width={7} height={4} rx={2} fill="#1e293b" />
        </g>

        {/* Catcher silhouette */}
        <g transform="translate(200, 205)">
          {/* Catcher's helmet/mask */}
          <ellipse cx={0} cy={-4} rx={8} ry={9} fill="#1e293b" />
          {/* Mask grid lines */}
          <line x1={-5} y1={-6} x2={5} y2={-6} stroke="#4b5563" strokeWidth="0.8" />
          <line x1={-6} y1={-2} x2={6} y2={-2} stroke="#4b5563" strokeWidth="0.8" />
          <line x1={-5} y1={2} x2={5} y2={2} stroke="#4b5563" strokeWidth="0.8" />
          <line x1={0} y1={-10} x2={0} y2={5} stroke="#4b5563" strokeWidth="0.8" />

          {/* Chest protector */}
          <path
            d="M-12,6 C-12,6 -14,10 -14,16 L-14,24 C-14,26 -10,28 0,28 C10,28 14,26 14,24 L14,16 C14,10 12,6 12,6 Z"
            fill="#475569"
            stroke="#374151"
            strokeWidth="0.5"
          />
          {/* Chest protector detail */}
          <line x1={0} y1={8} x2={0} y2={26} stroke="#374151" strokeWidth="1" opacity={0.5} />
          <line x1={-10} y1={16} x2={10} y2={16} stroke="#374151" strokeWidth="1" opacity={0.5} />

          {/* Mitt arm */}
          <path
            d="M-12,12 C-18,10 -22,14 -20,18"
            fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round"
          />
          {/* Catcher's mitt */}
          <ellipse cx={-20} cy={19} rx={7} ry={8} fill="#92400e" stroke="#78350f" strokeWidth="1" />
          <path d="M-23,16 C-20,14 -17,16 -17,19" fill="none" stroke="#78350f" strokeWidth="1" />
          {/* Mitt pocket */}
          <ellipse cx={-20} cy={20} rx={4} ry={5} fill="#7c3415" opacity={0.5} />

          {/* Throwing hand */}
          <path
            d="M12,12 C16,14 14,18 12,18"
            fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round"
          />
          <circle cx={12} cy={19} r={3} fill="#d4a574" />

          {/* Shin guards (crouching) */}
          <path
            d="M-8,28 L-10,36 L-4,36 Z"
            fill="#475569" stroke="#374151" strokeWidth="0.5"
          />
          <path
            d="M8,28 L10,36 L4,36 Z"
            fill="#475569" stroke="#374151" strokeWidth="0.5"
          />
          {/* Cleats */}
          <rect x={-11} y={35} width={8} height={3} rx={1.5} fill="#1e293b" />
          <rect x={3} y={35} width={8} height={3} rx={1.5} fill="#1e293b" />
        </g>

        {/* Strike zone overlay */}
        <rect
          x={185} y={167} width={30} height={25}
          fill="none" stroke="white" strokeWidth="1"
          strokeDasharray="4 3" opacity={0.35}
        />

        {/* Mini diamond - runners indicator */}
        <g transform="translate(320, 55)">
          <polygon
            points="30,0 60,25 30,50 0,25"
            fill="none" stroke="white" strokeWidth="1.5" opacity={0.4}
          />
          <rect
            x={26} y={-4} width={8} height={8}
            fill={runners.includes("second") ? "#fbbf24" : "white"}
            opacity={runners.includes("second") ? 1 : 0.4}
            transform="rotate(45, 30, 0)"
          />
          <rect
            x={56} y={21} width={8} height={8}
            fill={runners.includes("first") ? "#fbbf24" : "white"}
            opacity={runners.includes("first") ? 1 : 0.4}
            transform="rotate(45, 60, 25)"
          />
          <rect
            x={-4} y={21} width={8} height={8}
            fill={runners.includes("third") ? "#fbbf24" : "white"}
            opacity={runners.includes("third") ? 1 : 0.4}
            transform="rotate(45, 0, 25)"
          />
          <polygon
            points="30,47 27,50 27,53 33,53 33,50"
            fill="white" opacity={0.5}
          />
        </g>

        {/* HUD bar */}
        <rect x={0} y={0} width={400} height={36} fill="rgba(0,0,0,0.7)" rx="12" />

        {/* Outs */}
        <text x={16} y={24} fill="#9ca3af" fontSize="10" fontFamily="system-ui">
          OUTS
        </text>
        {[0, 1, 2].map((i) => (
          <circle
            key={`out-${i}`}
            cx={60 + i * 18}
            cy={20}
            r={5}
            fill={i < outs ? "#ef4444" : "transparent"}
            stroke={i < outs ? "#ef4444" : "#6b7280"}
            strokeWidth="2"
          />
        ))}

        {/* Count */}
        <text x={125} y={24} fill="#9ca3af" fontSize="10" fontFamily="system-ui">
          {count.balls}-{count.strikes}
        </text>

        {/* Inning */}
        {inning && (
          <text
            x={200} y={24}
            fill="white" fontSize="11" fontFamily="system-ui"
            textAnchor="middle" fontWeight="bold"
          >
            INN {inning}
          </text>
        )}

        {/* Score */}
        {score && (
          <>
            <text
              x={305} y={24}
              fill="#22c55e" fontSize="11" fontFamily="system-ui"
              textAnchor="end" fontWeight="bold"
            >
              US {score.us}
            </text>
            <text x={315} y={24} fill="#9ca3af" fontSize="10" fontFamily="system-ui">
              -
            </text>
            <text
              x={384} y={24}
              fill="#ef4444" fontSize="11" fontFamily="system-ui"
              textAnchor="end" fontWeight="bold"
            >
              THEM {score.them}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
