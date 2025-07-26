import FightingBar from "./FightingBar";
import { getRoleState, type GameResult } from "@/lib/game/runner";
import Player from "./Player";
import { useCallback, useMemo, useState } from "react";
import { type ViolationLog } from "@/lib/game/engine";
import GameController from "./GameController";
import { cn } from "@/lib/utils";

interface GameDetailProps {
  gameResult: GameResult;
}

function toPercent(value: number | undefined, total: number) {
  if (value === undefined) {
    return 100;
  }

  return (value / total) * 100;
}

export default function GameDetail({ gameResult }: GameDetailProps) {
  const [current, setCurrent] = useState<{
    turn: number;
    player: "p1" | "p2";
  }>({
    turn: 0,
    player: "p2",
  });

  const totalTurns = gameResult.logs[gameResult.logs.length - 1]?.turn ?? 0;

  const { p1Logs, p2Logs } = useMemo(() => {
    const { p1Logs, p2Logs } = gameResult.logs.reduce<{
      p1Logs: GameResult["logs"];
      p2Logs: GameResult["logs"];
    }>(
      (acc, log) => {
        if (log.player === "p1") {
          acc.p1Logs.push(log);
        } else {
          acc.p2Logs.push(log);
        }
        return acc;
      },
      { p1Logs: [], p2Logs: [] }
    );

    return {
      p1Logs,
      p2Logs,
    };
  }, [gameResult.logs]);

  const { p1Log, p2Log } = useMemo(() => {
    return {
      p1Log: p1Logs.find((log) => log.turn === current.turn) ?? null,
      p2Log:
        p2Logs.find((log) => {
          if (current.player === "p2") {
            return log.turn === current.turn;
          }
          return log.turn === current.turn - 1;
        }) ?? null,
    };
  }, [p1Logs, p2Logs, current]);

  const violationRecord = useMemo(() => {
    return gameResult.violationLogs.reduce<
      Record<string, Pick<ViolationLog, "reason">>
    >((acc, cur) => {
      acc[`${cur.agent}-${cur.turn}`] = { reason: cur.reason };
      return acc;
    }, {});
  }, [gameResult.violationLogs]);

  const { p1HpPercent, p1MpPercent, p2HpPercent, p2MpPercent } = useMemo(() => {
    const log = current.player === "p1" ? p1Log : p2Log;
    const p1State = log?.state.p1;
    const p2State = log?.state.p2;

    let p1Hp = p1State?.hp || gameResult.gameConfig.player.initialHp;
    let p1Mp = p1State?.mp || gameResult.gameConfig.player.initialMp;
    let p2Hp = p2State?.hp || gameResult.gameConfig.player.initialHp;
    let p2Mp = p2State?.mp || gameResult.gameConfig.player.initialMp;

    if (current.player === "p1" && log?.result.skillUsed) {
      const { mpCost, damage, heal } =
        gameResult.gameConfig.skills[log?.result.skillUsed];
      p1Mp -= mpCost;
      if (damage) {
        p2Hp -= damage;
      }
      if (heal) {
        p1Hp += heal;
      }
    }

    if (current.player === "p2" && log?.result.skillUsed) {
      const { mpCost, damage, heal } =
        gameResult.gameConfig.skills[log?.result.skillUsed];
      p2Mp -= mpCost;
      if (damage) {
        p1Hp -= damage;
      }
      if (heal) {
        p2Hp += heal;
      }
    }

    return {
      p1HpPercent: toPercent(p1Hp, gameResult.gameConfig.player.initialHp),
      p1MpPercent: toPercent(p1Mp, gameResult.gameConfig.player.initialMp),
      p2HpPercent: toPercent(p2Hp, gameResult.gameConfig.player.initialHp),
      p2MpPercent: toPercent(p2Mp, gameResult.gameConfig.player.initialMp),
    };
  }, [current.player, p1Log, p2Log, gameResult.gameConfig]);

  const { p1: p1Token, p2: p2Token } = useMemo(() => {
    return gameResult.tokenLogs.reduce<{
      p1: { total: number };
      p2: { total: number };
    }>(
      (acc, cur) => {
        if (cur.turn < current.turn) {
          acc[cur.agent].total += cur.totalTokens;
        }

        if (cur.turn === current.turn && cur.agent === "p1") {
          acc.p1.total += cur.totalTokens;
        }

        if (
          cur.turn === current.turn &&
          cur.agent === "p2" &&
          current.player === "p2"
        ) {
          acc.p2.total += cur.totalTokens;
        }

        return acc;
      },
      { p1: { total: 0 }, p2: { total: 0 } }
    );
  }, [gameResult.tokenLogs, current.turn, current.player]);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => {
      if (prev.turn <= 0 && prev.player === "p2") {
        return prev;
      }

      if (prev.player === "p1") {
        return {
          turn: prev.turn - 1,
          player: "p2",
        };
      }

      return {
        turn: prev.turn,
        player: "p1",
      };
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrent((prev) => {
      if (prev.turn >= totalTurns && prev.player === "p2") {
        return prev;
      }

      if (
        prev.turn >= totalTurns &&
        prev.player === "p1" &&
        p1Logs.length !== p2Logs.length
      ) {
        return prev;
      }

      if (prev.player === "p1") {
        return {
          turn: prev.turn,
          player: "p2",
        };
      }

      return {
        turn: prev.turn + 1,
        player: "p1",
      };
    });
  }, [totalTurns, p1Logs.length, p2Logs.length]);

  return (
    <div
      className={cn(
        "p-4 h-screen flex flex-col justify-between pt-[80px]",
        `before:absolute before:inset-0 before:bg-[url('/background.png')] before:bg-cover before:bg-center before:opacity-100 before:-z-1`
      )}
    >
      <header>
        <div className="flex justify-between items-center">
          <div className="space-y-1 flex flex-col items-end flex-1">
            <FightingBar type="health" side="left" value={p1HpPercent} />
            <FightingBar type="energy" side="left" value={p1MpPercent} />
          </div>
          <div className="text-foreground text-2xl font-bold turn-number mx-8 font-electro">
            Turn {current.turn.toString().padStart(2, "0")}
          </div>
          <div className="space-y-1 flex flex-col items-start flex-1">
            <FightingBar type="health" side="right" value={p2HpPercent} />
            <FightingBar type="energy" side="right" value={p2MpPercent} />
          </div>
        </div>
      </header>
      <main>
        <div className="flex justify-between items-center h-full space-x-6">
          <Player
            config={gameResult.p1Config}
            current={current}
            role="p1"
            log={p1Log}
            violationRecord={violationRecord}
            totalToken={p1Token.total}
            className={cn(
              current.turn === totalTurns && getRoleState(gameResult, "p1")
            )}
          />
          <Player
            config={gameResult.p2Config}
            className={cn(
              "space-x-reverse flex-row-reverse",
              current.turn === totalTurns && getRoleState(gameResult, "p2")
            )}
            current={current}
            role="p2"
            log={p2Log}
            violationRecord={violationRecord}
            totalToken={p2Token.total}
          />
        </div>
      </main>
      <footer className="pb-4 flex items-center justify-center">
        <GameController
          current={current}
          totalTurns={totalTurns}
          onNext={handleNext}
          onPrev={handlePrev}
          winner={gameResult.winner}
        />
      </footer>
    </div>
  );
}
