import { cn } from "@/lib/utils";
import { useMemo } from "react";
import a0 from "../assets/a-0.webp";
import aClaude from "../assets/a-claude.webp";
import aKimi from "../assets/a-kimi.webp";
import aMistral from "../assets/a-mistral.webp";
import aGpt from "../assets/a-gpt.webp";
import aDeepseek from "../assets/a-deepseek.webp";
import aArcee from "../assets/a-arcee.webp";

interface AgentImgProps {
  name: string;
  model: string;
  className?: string;
  flipImage?: boolean;
}

const AgentImg: React.FC<AgentImgProps> = ({
  name,
  model,
  className,
  flipImage,
}) => {
  const imageUrl = useMemo(() => {
    switch (true) {
      case /claude/i.test(model):
        return aClaude;
      case /kimi/i.test(model):
        return aKimi;
      case /mistral/i.test(model):
        return aMistral;
      case /gpt/i.test(model):
        return aGpt;
      case /deepseek/i.test(model):
        return aDeepseek;
      case /arcee/i.test(model):
        return aArcee;
      default:
        return a0;
    }
  }, [model]);

  return (
    <img
      src={imageUrl}
      alt={name}
      className={cn(
        "player-card__image",
        flipImage && "scale-x-[-1]",
        className
      )}
    />
  );
};

export default AgentImg;
