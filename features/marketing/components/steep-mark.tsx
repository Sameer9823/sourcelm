/**
 * "The Steep" — Chaibook's signature visual.
 *
 * Three source types (PDF, web, video) flow in as chips, converge into a
 * vessel where concentric rings suggest infusion, and distilled notes rise
 * out the top. This is the one place we spend the design's "boldness" —
 * everything else in the product stays quiet and disciplined around it.
 */

export function SteepMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 480 420"
            className={className}
            fill="none"
            role="img"
            aria-label="Sources steeping into a vessel and rising as distilled notes"
        >
            {/* Rising distilled notes */}
            <g className="text-leaf" opacity="0.9">
                <rect
                    x="204"
                    y="34"
                    width="72"
                    height="10"
                    rx="5"
                    fill="currentColor"
                    opacity="0.55"
                />
                <rect
                    x="188"
                    y="14"
                    width="104"
                    height="10"
                    rx="5"
                    fill="currentColor"
                />
            </g>
            <path
                d="M240 52 V96"
                stroke="currentColor"
                className="text-leaf"
                strokeWidth="1.5"
                strokeDasharray="1 7"
                strokeLinecap="round"
            />

            {/* Vessel */}
            <path
                d="M150 120 H330 L308 300 Q240 330 172 300 Z"
                stroke="currentColor"
                className="text-foreground"
                strokeWidth="2"
                fill="none"
            />
            <path
                d="M150 120 H330"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Infusion rings inside vessel */}
            <g className="text-primary" opacity="0.8">
                <circle
                    cx="240"
                    cy="215"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <circle
                    cx="240"
                    cy="215"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    opacity="0.6"
                />
                <circle
                    cx="240"
                    cy="215"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.35"
                />
            </g>

            {/* Source chips converging */}
            {[
                { x: 40, y: 140, cy: 175, label: "PDF" },
                { x: 30, y: 230, cy: 215, label: "Web" },
                { x: 60, y: 320, cy: 255, label: "Video" },
            ].map((chip) => (
                <g key={chip.label}>
                    <path
                        d={`M${chip.x + 88} ${chip.y + 15} Q 160 ${chip.cy} 172 215`}
                        stroke="currentColor"
                        className="text-muted-foreground"
                        strokeWidth="1"
                        strokeDasharray="3 5"
                        fill="none"
                        opacity="0.5"
                    />
                    <rect
                        x={chip.x}
                        y={chip.y}
                        width="88"
                        height="30"
                        rx="15"
                        className="fill-card stroke-border"
                        strokeWidth="1"
                    />
                    <text
                        x={chip.x + 44}
                        y={chip.y + 19}
                        textAnchor="middle"
                        className="fill-foreground font-ledger"
                        fontSize="11"
                    >
                        {chip.label}
                    </text>
                </g>
            ))}

            {/* Base */}
            <ellipse
                cx="240"
                cy="304"
                rx="70"
                ry="12"
                className="fill-primary/15"
            />
        </svg>
    );
}
