import type { PlayerState, SkillName } from "@/lib/game/engine";
import SkillImg from "./SkillImg";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CooldownBoxProps {
  cooldowns: PlayerState["cooldowns"];
}

const CooldownBox: React.FC<CooldownBoxProps> = ({ cooldowns }) => {
  return (
    <div className="flex space-x-1">
      {Object.entries(cooldowns).map(([skillName, cooldown], index) => (
        <div key={index} className="text-center">
          <SkillImg
            skillName={skillName as SkillName}
            className={cn(cooldown > 0 ? "opacity-20" : "opacity-100")}
          />
          <span
            className={cn(
              "inline-flex",
              cooldown > 0 ? "text-gray-500" : "text-green-500"
            )}
          >
            {cooldown > 0 ? cooldown : <Check className="w-3 h-3" />}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CooldownBox;
