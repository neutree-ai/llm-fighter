import React from "react";

interface GameLabelProps {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "xl";
  variant?: "primary" | "secondary" | "accent";
  glowIntensity?: "low" | "medium" | "high";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const GameLabel: React.FC<GameLabelProps> = ({
  children,
  size = "medium",
  variant = "primary",
  glowIntensity = "medium",
  className = "",
  style = {},
  onClick,
}) => {
  return (
    <div
      className={`
        game-label 
        game-label--${size}
        game-label--${variant}
        game-label--glow-${glowIntensity}
        ${onClick ? "game-label--clickable" : ""}
        ${className}
      `.trim()}
      style={style}
      onClick={onClick}
    >
      {/* Background glow */}
      <div className="game-label__glow" />

      {/* Content */}
      <div className="game-label__content">{children}</div>

      {/* Corner highlights */}
      <div className="game-label__corners">
        <div className="game-label__corner game-label__corner--tl" />
        <div className="game-label__corner game-label__corner--tr" />
        <div className="game-label__corner game-label__corner--bl" />
        <div className="game-label__corner game-label__corner--br" />
      </div>
    </div>
  );
};

export default GameLabel;
