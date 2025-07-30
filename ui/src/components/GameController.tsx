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
    <div className="space-y-2 md:space-y-4 game-controller px-2 md:px-4 py-1 md:py-2 rounded-lg w-full max-w-md">
      {/* Desktop status */}
      <div className="hidden md:block space-x-2 text-foreground font-electro font-bold">
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
      
      {/* Mobile & Desktop controls */}
      <div className="flex items-center justify-between">
        {/* Mobile status */}
        <div className="md:hidden text-foreground font-electro font-bold text-sm">
          {current.turn}/{totalTurns}
          {winner && (
            <div className="text-xs uppercase">
              {winner === "draw" ? "Draw" : winner === "p1" ? "P1 Wins" : "P2 Wins"}
            </div>
          )}
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <Button onClick={onPrev} size="sm" className="md:h-10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={() =>
              setMode((prev) => (prev === "manual" ? "auto" : "manual"))
            }
            size="sm"
            className="md:h-10"
          >
            {mode === "manual" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          {mode === "auto" && (
            <Select value={intervalMs} onValueChange={setIntervalMs}>
              <SelectTrigger className="w-16 md:w-[100px] text-foreground h-8 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">Fast</SelectItem>
                <SelectItem value="3000">Medium</SelectItem>
                <SelectItem value="5000">Slow</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button onClick={onNext} size="sm" className="md:h-10">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameController;
