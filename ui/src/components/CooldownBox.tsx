import type { PlayerState, SkillName } from "@/lib/game/engine";
import SkillImg from "./SkillImg";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CooldownBoxProps {
  cooldowns: PlayerState["cooldowns"];
  compact?: boolean;
}

const CooldownBox: React.FC<CooldownBoxProps> = ({ cooldowns, compact = false }) => {
  return (
    <div className={compact ? "flex space-x-1 flex-wrap gap-1" : "flex space-x-1"}>
      {Object.entries(cooldowns).map(([skillName, cooldown], index) => (
        <div key={index} className="text-center">
          <SkillImg
            skillName={skillName as SkillName}
            className={cn(
              cooldown > 0 ? "opacity-20" : "opacity-100",
              compact ? "w-6 h-6" : ""
            )}
          />
          <span
            className={cn(
              "inline-flex",
              cooldown > 0 ? "text-gray-500" : "text-green-500",
              compact ? "text-xs" : ""
            )}
          >
            {cooldown > 0 ? cooldown : <Check className={compact ? "w-2 h-2" : "w-3 h-3"} />}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CooldownBox;
