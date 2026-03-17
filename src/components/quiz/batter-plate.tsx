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
        {/* Left box */}
        <rect
          x={135}
          y={155}
          width={40}
          height={55}
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity={0.7}
          rx="2"
        />
        {/* Right box */}
        <rect
          x={225}
          y={155}
          width={40}
          height={55}
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity={0.7}
          rx="2"
        />

        {/* Batter silhouette (right-handed) */}
        {/* Body */}
        <ellipse cx={240} cy={170} rx={6} ry={7} fill="#374151" stroke="#1f2937" strokeWidth="1" />
        {/* Torso */}
        <line x1={240} y1={177} x2={240} y2={197} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
        {/* Legs */}
        <line x1={240} y1={197} x2={234} y2={210} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
        <line x1={240} y1={197} x2={246} y2={210} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
        {/* Arms holding bat */}
        <line x1={240} y1={183} x2={250} y2={178} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
        {/* Bat */}
        <line x1={248} y1={180} x2={260} y2={158} stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" />
        <line x1={260} y1={158} x2={264} y2={150} stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />

        {/* Catcher silhouette */}
        <ellipse cx={200} cy={215} rx={6} ry={6} fill="#374151" stroke="#1f2937" strokeWidth="1" />
        <ellipse cx={200} cy={228} rx={8} ry={6} fill="#374151" stroke="#1f2937" strokeWidth="1" />
        {/* Mitt */}
        <ellipse cx={194} cy={222} rx={5} ry={6} fill="#92400e" stroke="#78350f" strokeWidth="1" />

        {/* Strike zone overlay */}
        <rect
          x={185}
          y={167}
          width={30}
          height={25}
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity={0.35}
        />

        {/* Mini diamond - runners indicator */}
        <g transform="translate(320, 55)">
          {/* Diamond shape */}
          <polygon
            points="30,0 60,25 30,50 0,25"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity={0.4}
          />
          {/* Bases */}
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
          {/* Home */}
          <polygon
            points="30,47 27,50 27,53 33,53 33,50"
            fill="white"
            opacity={0.5}
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
            x={200}
            y={24}
            fill="white"
            fontSize="11"
            fontFamily="system-ui"
            textAnchor="middle"
            fontWeight="bold"
          >
            INN {inning}
          </text>
        )}

        {/* Score */}
        {score && (
          <>
            <text
              x={305}
              y={24}
              fill="#22c55e"
              fontSize="11"
              fontFamily="system-ui"
              textAnchor="end"
              fontWeight="bold"
            >
              US {score.us}
            </text>
            <text x={315} y={24} fill="#9ca3af" fontSize="10" fontFamily="system-ui">
              -
            </text>
            <text
              x={384}
              y={24}
              fill="#ef4444"
              fontSize="11"
              fontFamily="system-ui"
              textAnchor="end"
              fontWeight="bold"
            >
              THEM {score.them}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
