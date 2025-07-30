import { SkillName } from "@/lib/game/engine";
import SkillImg from "./SkillImg";
import { Fragment } from "react/jsx-runtime";

interface SkillsBoxProps {
  lastActions: SkillName[];
  compact?: boolean;
}

const SkillsBox: React.FC<SkillsBoxProps> = ({ lastActions, compact = false }) => {
  return (
    <div className={compact ? "flex space-x-1 items-center min-h-8" : "flex space-x-1 items-center min-h-12"}>
      {lastActions.map((action, index) => (
        <Fragment key={index}>
          <div className="skill">
            <SkillImg skillName={action} className={compact ? "w-6 h-6" : ""} />
          </div>
          {index !== lastActions.length - 1 && <div className={compact ? "text-xs" : ""}>→</div>}
        </Fragment>
      ))}
    </div>
  );
};

export default SkillsBox;
