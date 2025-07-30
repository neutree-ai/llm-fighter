import React from "react";

interface HealthColors {
  high: [string, string];
  medium: [string, string];
  low: [string, string];
}

interface FightingBarProps {
  type?: "health" | "energy";
  side?: "left" | "right";
  value?: number;
  maxValue?: number;
  healthColors?: HealthColors;
  energyColors?: [string, string];
  animated?: boolean;
  glowEffect?: boolean;
  onClick?: () => void;
  onAnimationEnd?: () => void;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

const FightingBar: React.FC<FightingBarProps> = ({
  type = "health",
  side = "left",
  value = 100,
  maxValue = 100,
  healthColors = {
    high: ["#00ff88", "#ffff00"],
    medium: ["#ffff00", "#ff6600"],
    low: ["#ff6600", "#ff0000"],
  },
  energyColors = ["#00aaff", "#0088ff"],
  animated = true,
  glowEffect = true,
  onClick,
  onAnimationEnd,
  className = "",
  style = {},
  compact = false,
}) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));

  const getHealthGradient = (): string => {
    const direction = side === "left" ? "90deg" : "-90deg";
    let colors: [string, string];

    if (percentage > 60) {
      colors = healthColors.high;
    } else if (percentage > 30) {
      colors = healthColors.medium;
    } else {
      colors = healthColors.low;
    }

    return `linear-gradient(${direction}, ${colors.join(", ")})`;
  };

  const getEnergyGradient = (): string => {
    const direction = side === "left" ? "90deg" : "-90deg";
    return `linear-gradient(${direction}, ${energyColors.join(", ")})`;
  };

  const barStyle: React.CSSProperties = style;

  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    background: type === "health" ? getHealthGradient() : getEnergyGradient(),
  };

  return (
    <div
      className={`
        fighting-bar 
        fighting-bar--${type} 
        fighting-bar--${side}
        ${animated ? "fighting-bar--animated" : ""}
        ${glowEffect ? "fighting-bar--glow" : ""}
        ${compact ? "fighting-bar--compact" : ""}
        ${className}
      `.trim()}
      style={barStyle}
      onClick={onClick}
      onAnimationEnd={onAnimationEnd}
    >
      <div
        className={`fighting-bar__fill fighting-bar__fill--${side}`}
        style={fillStyle}
      />
    </div>
  );
};

export default FightingBar;
