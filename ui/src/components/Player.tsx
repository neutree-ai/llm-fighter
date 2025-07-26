import type { AgentConfig } from "@/lib/game/llm";
import PlayerCard from "./PlayerCard";
import GameLabel from "./GameLabel";
import SkillsBox from "./SkillsBox";
import { SkillName, type GameLog, type ViolationLog } from "@/lib/game/engine";
import CooldownBox from "./CooldownBox";
import { cn } from "@/lib/utils";
import SkillImg from "./SkillImg";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import tokenIcon from "../assets/token.png";
import s0 from "../assets/s-0.png";
import { useMemo } from "react";

interface PlayerProps {
  className?: string;
  config: AgentConfig;
  log: GameLog | null;
  violationRecord: Record<string, Pick<ViolationLog, "reason">>;
  totalToken: number;
  role: "p1" | "p2";
  current: {
    turn: number;
    player: "p1" | "p2";
  };
}

const Player = ({
  config,
  className,
  role,
  current,
  log,
  violationRecord,
  totalToken,
}: PlayerProps) => {
  const active = role === current.player && current.turn !== 0;
  const violationCount = useMemo(() => {
    return Object.keys(violationRecord).filter((key) => {
      const [r, t] = key.split("-");

      return r === role && parseInt(t, 10) <= current.turn;
    }).length;
  }, [violationRecord, role, current.turn]);

  return (
    <div
      className={cn("player flex flex-1 overflow-hidden space-x-4", className)}
    >
      <PlayerCard
        playerName={config.name}
        model={config.model}
        active={active}
        flipImage={role === "p1"}
      />
      <div className="log-panel space-y-2 flex-1">
        <GameLabel variant="secondary" size="small">
          Current Action
          <div className="text-center min-h-12">
            {log ? (
              <SkillImg
                skillName={log.result.skillUsed}
                className="inline"
                violationLog={violationRecord[`${role}-${current.turn}`]}
              />
            ) : (
              <span className="text-muted-foreground">No action</span>
            )}
          </div>
        </GameLabel>
        <GameLabel variant="secondary" size="small">
          Last Actions
          <SkillsBox lastActions={log?.state.lastActions[role] ?? []} />
        </GameLabel>
        <GameLabel variant="secondary" size="small">
          Cooldowns
          <CooldownBox
            cooldowns={
              log?.state[role].cooldowns ?? {
                [SkillName.quickStrike]: 0,
                [SkillName.heavyBlow]: 0,
                [SkillName.barrier]: 0,
                [SkillName.rejuvenate]: 0,
                [SkillName.ultimateNova]: 0,
                [SkillName.skipTurn]: 0,
              }
            }
          />
        </GameLabel>
        <GameLabel variant="secondary" size="small">
          Thinking
          <div className="text-left h-24 space-y-1">
            <ScrollArea className="h-full">
              {(log?.toolCalls ?? [])
                .filter((call) => call.type === "thinking")
                .map((call, index) => {
                  return (
                    <div key={index} className="text-muted-foreground w-full">
                      <ReactMarkdown>{call.content ?? ""}</ReactMarkdown>
                    </div>
                  );
                })}
            </ScrollArea>
          </div>
        </GameLabel>
        <GameLabel size="small" variant="secondary">
          Stats
          <div className="text-left w-full flex items-center">
            <img src={tokenIcon} alt="Token" className="inline-block w-4 h-4" />
            <span className="ml-2">{totalToken} tokens</span>
          </div>
          <div
            className={cn(
              "text-left w-full flex items-center",
              violationCount > 0 ? "text-red-500" : "text-green-500"
            )}
          >
            <img
              src={s0}
              alt="Violation"
              className="inline-block w-4 h-4 bg-red-800 rounded-full"
            />
            <span className="ml-2">{violationCount} violations</span>
          </div>
        </GameLabel>
      </div>
    </div>
  );
};

export default Player;
