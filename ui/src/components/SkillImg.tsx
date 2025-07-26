import { SkillName, type ViolationLog } from "@/lib/game/engine";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import s1 from "../assets/s-1.webp";
import s2 from "../assets/s-2.webp";
import s3 from "../assets/s-3.webp";
import s4 from "../assets/s-4.webp";
import s5 from "../assets/s-5.webp";
import s6 from "../assets/s-6.webp";
import s0 from "../assets/s-0.webp";
import { cn } from "@/lib/utils";

const images = [s1, s2, s3, s4, s5, s6];

const nameToImg = (name?: string) => {
  if (!name) {
    return s0;
  }

  const index = Object.values(SkillName).indexOf(name as SkillName);
  return images[index];
};

const nameToText = (name?: string) => {
  switch (name) {
    case SkillName.quickStrike:
      return "Quick Strike";
    case SkillName.heavyBlow:
      return "Heavy Blow";
    case SkillName.barrier:
      return "Barrier";
    case SkillName.rejuvenate:
      return "Rejuvenate";
    case SkillName.ultimateNova:
      return "Ultimate Nova";
    case SkillName.skipTurn:
      return "Skip Turn";
    default:
      return name;
  }
};

interface SkillImgProps {
  skillName?: SkillName;
  className?: string;
  violationLog?: Pick<ViolationLog, "reason">;
}

const SkillImg: React.FC<SkillImgProps> = ({
  skillName,
  className,
  violationLog,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <img
          src={nameToImg(skillName)}
          className={cn(`w-12 h-auto`, className)}
          alt={skillName}
        />
      </TooltipTrigger>
      <TooltipContent>
        {violationLog?.reason
          ? `Violation: ${violationLog.reason}`
          : nameToText(skillName)}
      </TooltipContent>
    </Tooltip>
  );
};

export default SkillImg;
