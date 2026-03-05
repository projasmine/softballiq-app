"use client";

import { type Situation } from "@/lib/db/schema";

const FIELD_POSITIONS: Record<string, { cx: number; cy: number }> = {
  home: { cx: 250, cy: 450 },
  first: { cx: 370, cy: 330 },
  second: { cx: 250, cy: 230 },
  third: { cx: 130, cy: 330 },
  pitcher: { cx: 250, cy: 340 },
  catcher: { cx: 250, cy: 470 },
  shortstop: { cx: 190, cy: 270 },
  left_field: { cx: 100, cy: 160 },
  center_field: { cx: 250, cy: 100 },
  right_field: { cx: 400, cy: 160 },
  first_base: { cx: 380, cy: 310 },
  second_base_ss: { cx: 195, cy: 265 },
  second_base_2b: { cx: 310, cy: 265 },
  third_base: { cx: 120, cy: 310 },
};

const FIELDER_LABELS: Record<string, string> = {
  pitcher: "P",
  catcher: "C",
  first_base: "1B",
  second_base_2b: "2B",
  third_base: "3B",
  shortstop: "SS",
  left_field: "LF",
  center_field: "CF",
  right_field: "RF",
};

const FIELDER_KEYS = [
  "pitcher",
  "catcher",
  "first_base",
  "second_base_2b",
  "third_base",
  "shortstop",
  "left_field",
  "center_field",
  "right_field",
];

interface SoftballFieldProps {
  situation?: Situation | null;
  playerPosition?: string;
  className?: string;
}

export function SoftballField({
  situation,
  playerPosition,
  className,
}: SoftballFieldProps) {
  const runners = situation?.runners ?? [];
  const outs = situation?.outs ?? 0;
  const count = situation?.count ?? { balls: 0, strikes: 0 };
  const inning = situation?.inning;
  const score = situation?.score;
  const ballHitTo = situation?.ballHitTo;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 500 520"
        width="100%"
        className="max-w-[400px] mx-auto"
        role="img"
        aria-label="Softball field diagram"
      >
        {/* Grass background */}
        <rect width="500" height="520" fill="#2d5a27" rx="12" />

        {/* Outfield arc */}
        <path
          d="M 30 400 Q 250 -40 470 400"
          fill="none"
          stroke="#3d7a37"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Infield dirt */}
        <path
          d="M 250 450 L 370 330 L 250 230 L 130 330 Z"
          fill="#c4956a"
          stroke="#a07850"
          strokeWidth="2"
        />

        {/* Pitcher's circle */}
        <circle
          cx={250}
          cy={340}
          r={18}
          fill="#c4956a"
          stroke="#a07850"
          strokeWidth="1.5"
        />

        {/* Base paths */}
        <line
          x1={250}
          y1={450}
          x2={370}
          y2={330}
          stroke="white"
          strokeWidth="1.5"
          opacity={0.6}
        />
        <line
          x1={370}
          y1={330}
          x2={250}
          y2={230}
          stroke="white"
          strokeWidth="1.5"
          opacity={0.6}
        />
        <line
          x1={250}
          y1={230}
          x2={130}
          y2={330}
          stroke="white"
          strokeWidth="1.5"
          opacity={0.6}
        />
        <line
          x1={130}
          y1={330}
          x2={250}
          y2={450}
          stroke="white"
          strokeWidth="1.5"
          opacity={0.6}
        />

        {/* Foul lines */}
        <line
          x1={250}
          y1={450}
          x2={30}
          y2={180}
          stroke="white"
          strokeWidth="1.5"
          opacity={0.4}
        />
        <line
          x1={250}
          y1={450}
          x2={470}
          y2={180}
          stroke="white"
          strokeWidth="1.5"
          opacity={0.4}
        />

        {/* Bases */}
        {/* Home plate */}
        <polygon
          points="250,445 243,450 243,457 257,457 257,450"
          fill="white"
        />
        {/* First base */}
        <rect
          x={363}
          y={323}
          width={14}
          height={14}
          fill={runners.includes("first") ? "#fbbf24" : "white"}
          transform="rotate(45, 370, 330)"
        />
        {/* Second base */}
        <rect
          x={243}
          y={223}
          width={14}
          height={14}
          fill={runners.includes("second") ? "#fbbf24" : "white"}
          transform="rotate(45, 250, 230)"
        />
        {/* Third base */}
        <rect
          x={123}
          y={323}
          width={14}
          height={14}
          fill={runners.includes("third") ? "#fbbf24" : "white"}
          transform="rotate(45, 130, 330)"
        />

        {/* Runner dots on bases */}
        {runners.map((base) => {
          const pos = FIELD_POSITIONS[base];
          if (!pos) return null;
          return (
            <circle
              key={`runner-${base}`}
              cx={pos.cx}
              cy={pos.cy}
              r={8}
              fill="#fbbf24"
              stroke="#92400e"
              strokeWidth="2"
            />
          );
        })}

        {/* Fielder markers */}
        {FIELDER_KEYS.map((key) => {
          const pos = FIELD_POSITIONS[key];
          if (!pos) return null;
          const isPlayerPos =
            playerPosition &&
            key.replace("_base", "").replace("_2b", "").replace("_field", "") ===
              playerPosition.toLowerCase().replace(" ", "_");
          return (
            <g key={`fielder-${key}`}>
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={14}
                fill={isPlayerPos ? "#3b82f6" : "#1e40af"}
                stroke={isPlayerPos ? "#93c5fd" : "#1e3a5f"}
                strokeWidth={isPlayerPos ? 3 : 1.5}
              />
              <text
                x={pos.cx}
                y={pos.cy + 4}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                {FIELDER_LABELS[key]}
              </text>
            </g>
          );
        })}

        {/* Ball trajectory */}
        {ballHitTo && FIELD_POSITIONS[ballHitTo] && (
          <>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
            </defs>
            <line
              x1={250}
              y1={445}
              x2={FIELD_POSITIONS[ballHitTo].cx}
              y2={FIELD_POSITIONS[ballHitTo].cy + 20}
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="8 4"
              markerEnd="url(#arrowhead)"
            />
          </>
        )}

        {/* HUD scoreboard bar */}
        <rect x={0} y={0} width={500} height={40} fill="rgba(0,0,0,0.7)" rx="12" />

        {/* Outs indicator */}
        <text x={20} y={26} fill="#9ca3af" fontSize="11" fontFamily="system-ui">
          OUTS
        </text>
        {[0, 1, 2].map((i) => (
          <circle
            key={`out-${i}`}
            cx={70 + i * 20}
            cy={22}
            r={6}
            fill={i < outs ? "#ef4444" : "transparent"}
            stroke={i < outs ? "#ef4444" : "#6b7280"}
            strokeWidth="2"
          />
        ))}

        {/* Count */}
        <text
          x={150}
          y={26}
          fill="#9ca3af"
          fontSize="11"
          fontFamily="system-ui"
        >
          {count.balls}-{count.strikes}
        </text>

        {/* Inning */}
        {inning && (
          <text
            x={250}
            y={26}
            fill="white"
            fontSize="12"
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
              x={380}
              y={26}
              fill="#22c55e"
              fontSize="12"
              fontFamily="system-ui"
              textAnchor="end"
              fontWeight="bold"
            >
              US {score.us}
            </text>
            <text
              x={420}
              y={26}
              fill="#9ca3af"
              fontSize="11"
              fontFamily="system-ui"
            >
              -
            </text>
            <text
              x={480}
              y={26}
              fill="#ef4444"
              fontSize="12"
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
