interface LogoProps {
  size?: number;
}

export function Logo({ size = 38 }: LogoProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* House body with soft arc roofline */}
        <path
          d="M 6 44 L 42 44 L 42 28 Q 24 8 6 28 Z"
          fill="#305845"
        />
        {/* Door cutout — rounded top */}
        <path
          d="M 20 44 L 20 36 Q 20 32 24 32 Q 28 32 28 36 L 28 44 Z"
          fill="white"
        />
        {/* Guidance arc — terracotta, above the house */}
        <path
          d="M 12 14 Q 24 4 36 14"
          stroke="#bd7750"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Terminus dot — marks direction */}
        <circle cx="36" cy="14" r="2.2" fill="#bd7750" />
      </svg>
      <span
        style={{
          fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          userSelect: "none",
        }}
      >
        <span style={{ color: "#305845", fontWeight: 700, fontSize: "1.05rem" }}>
          Assisted Living{" "}
        </span>
        <span style={{ color: "#bd7750", fontWeight: 700, fontSize: "1.05rem" }}>Help</span>
      </span>
    </span>
  );
}
