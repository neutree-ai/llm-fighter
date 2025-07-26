import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameResult } from "@/lib/game/runner";

interface GameControllerProps {
  onPrev: () => void;
  onNext: () => void;
  current: {
    turn: number;
    player: "p1" | "p2";
  };
  totalTurns: number;
  winner: GameResult["winner"];
}

const GameController = ({
  onPrev,
  onNext,
  current,
  totalTurns,
  winner,
}: GameControllerProps) => {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [intervalMs, setIntervalMs] = useState("1000");

  useEffect(() => {
    if (mode === "auto") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(
        () => {
          onNext();
        },
        parseInt(intervalMs, 10)
      );
    }

    if (mode === "manual" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, onNext, intervalMs]);

  return (
    <div className="space-y-4 game-controller px-4 py-2 rounded-lg">
      <div className="space-x-2 text-foreground font-electro font-bold">
        <span className="mr-4">
          {current.turn}/{totalTurns}
        </span>
        {!winner && <span className="uppercase text-sm">running</span>}
        {winner && (
          <span className="uppercase text-sm">
            {winner === "draw"
              ? "draw"
              : winner === "p1"
                ? "player 1 wins"
                : "player 2 wins"}
          </span>
        )}
      </div>
      <div className="space-x-2 flex">
        <Button onClick={onPrev}>
          <ArrowLeft />
        </Button>
        <Button
          onClick={() =>
            setMode((prev) => (prev === "manual" ? "auto" : "manual"))
          }
        >
          {mode === "manual" ? <Play /> : <Pause />}
        </Button>
        {mode === "auto" && (
          <Select value={intervalMs} onValueChange={setIntervalMs}>
            <SelectTrigger className="w-[100px] text-foreground">
              <SelectValue placeholder="Speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">Fast</SelectItem>
              <SelectItem value="3000">Medium</SelectItem>
              <SelectItem value="5000">Slow</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button onClick={onNext}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default GameController;
