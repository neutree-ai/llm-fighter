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
import tokenIcon from "../assets/token.webp";
import s0 from "../assets/s-0.webp";
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
  mobileLayout?: boolean;
}

const Player = ({
  config,
  className,
  role,
  current,
  log,
  violationRecord,
  totalToken,
  mobileLayout = false,
}: PlayerProps) => {
  const active = role === current.player && current.turn !== 0;
  const violationCount = useMemo(() => {
    return Object.keys(violationRecord).filter((key) => {
      const [r, t] = key.split("-");

      return r === role && parseInt(t, 10) <= current.turn;
    }).length;
  }, [violationRecord, role, current.turn]);
  const violationTurn =
    current.player !== role && role === "p2" ? current.turn - 1 : current.turn;

  if (mobileLayout) {
    return (
      <div className={cn("player-mobile w-full max-w-sm mx-auto", className)}>
        {/* Compact player card */}
        <div className="mb-4">
          <PlayerCard
            playerName={config.name}
            model={config.model}
            active={active}
            flipImage={role === "p1"}
            width="240px"
            height="120px"
          />
        </div>
        
        {/* Vertical layout for skills and info */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <GameLabel variant="secondary" size="small">
              Current Action
              <div className="text-center min-h-8">
                {log ? (
                  <SkillImg
                    skillName={log.result.skillUsed}
                    className="inline w-6 h-6"
                    violationLog={violationRecord[`${role}-${violationTurn}`]}
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">No action</span>
                )}
              </div>
            </GameLabel>
            
            <GameLabel size="small" variant="secondary">
              Stats
              <div className="text-left text-xs space-y-1">
                <div className="flex items-center">
                  <img src={tokenIcon} alt="Token" className="inline-block w-3 h-3" />
                  <span className="ml-1">{totalToken}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center",
                    violationCount > 0 ? "text-red-500" : "text-green-500"
                  )}
                >
                  <img
                    src={s0}
                    alt="Violation"
                    className="inline-block w-3 h-3 bg-red-800 rounded-full"
                  />
                  <span className="ml-1">{violationCount}</span>
                </div>
              </div>
            </GameLabel>
          </div>
          
          <GameLabel variant="secondary" size="small">
            Last Actions
            <SkillsBox lastActions={log?.state.lastActions[role] ?? []} compact />
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
              compact
            />
          </GameLabel>
          
          <GameLabel variant="secondary" size="small">
            Thinking
            <div className="text-left h-16 space-y-1">
              <ScrollArea className="h-full">
                {(log?.toolCalls ?? [])
                  .filter((call) => call.type === "thinking")
                  .map((call, index) => {
                    return (
                      <div key={index} className="text-muted-foreground w-full text-xs">
                        <ReactMarkdown>{call.content ?? ""}</ReactMarkdown>
                      </div>
                    );
                  })}
              </ScrollArea>
            </div>
          </GameLabel>
        </div>
      </div>
    );
  }

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
                violationLog={violationRecord[`${role}-${violationTurn}`]}
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
