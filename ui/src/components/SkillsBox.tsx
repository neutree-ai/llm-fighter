import { SkillName } from "@/lib/game/engine";
import SkillImg from "./SkillImg";
import { Fragment } from "react/jsx-runtime";

interface SkillsBoxProps {
  lastActions: SkillName[];
}

const SkillsBox: React.FC<SkillsBoxProps> = ({ lastActions }) => {
  return (
    <div className="flex space-x-1 items-center min-h-12">
      {lastActions.map((action, index) => (
        <Fragment key={index}>
          <div className="skill">
            <SkillImg skillName={action} />
          </div>
          {index !== lastActions.length - 1 && <div>→</div>}
        </Fragment>
      ))}
    </div>
  );
};

export default SkillsBox;
