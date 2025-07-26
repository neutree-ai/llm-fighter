import React from "react";
import AgentImg from "./AgentImg";

interface PlayerCardProps {
  playerName: string;
  model: string;
  className?: string;
  width?: string;
  height?: string;
  glowIntensity?: "low" | "medium" | "high";
  active?: boolean;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  style?: React.CSSProperties;
  flipImage?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  model,
  className = "",
  width = "280px",
  height = "400px",
  glowIntensity = "medium",
  active = false,
  onClick,
  onHover,
  style = {},
  flipImage = false,
}) => {
  const handleMouseEnter = () => {
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    onHover?.(false);
  };

  const cardStyle: React.CSSProperties = {
    width,
    height,
    minWidth: width,
    ...style,
  };

  return (
    <div
      className={`
        player-card 
        player-card--glow-${glowIntensity}
        ${active ? "player-card--active" : ""}
        ${className}
      `.trim()}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background glow */}
      <div className="player-card__glow" />

      {/* Card content */}
      <div className="player-card__content">
        {/* Image container */}
        <div className="player-card__image-container">
          <AgentImg name={playerName} model={model} flipImage={flipImage} />
        </div>

        {/* Player info */}
        {(playerName || model) && (
          <div className="player-card__info">
            {playerName && <h3 className="player-card__name">{playerName}</h3>}
            {model && <p className="player-card__model">{model}</p>}
          </div>
        )}
      </div>

      {/* Bottom glow ring */}
      <div className="player-card__bottom-ring" />

      {/* Corner decorations */}
      <div className="player-card__corners">
        <div className="player-card__corner player-card__corner--tl" />
        <div className="player-card__corner player-card__corner--tr" />
        <div className="player-card__corner player-card__corner--bl" />
        <div className="player-card__corner player-card__corner--br" />
      </div>
    </div>
  );
};

export default PlayerCard;
