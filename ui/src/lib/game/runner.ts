import {
  GameEngine,
  type GameConfig,
  type GameLog,
  type TokenLog,
  type ViolationLog,
} from "./engine";
import { createAgent, type AgentConfig, type LLMAgent } from "./llm";

export type GameResult = {
  // runner state
  winner: "p1" | "p2" | "draw" | null; // null means not ended

  // engine state
  gameConfig: GameConfig;
  logs: GameLog[];
  violationLogs: ViolationLog[];
  tokenLogs: TokenLog[];

  // llm state
  p1Config: AgentConfig;
  p2Config: AgentConfig;
};

export class BattleRunner {
  private gameEngine: GameEngine;
  private p1Agent: LLMAgent;
  private p2Agent: LLMAgent;
  private maxTurns: number;

  private result: GameResult;
  private onResult?: (result: GameResult) => Promise<void>;

  constructor({
    maxTurns,
    checkpoint,
    onResult,
  }: {
    maxTurns?: number;
    checkpoint: GameResult;
    onResult?: (result: GameResult) => Promise<void>;
  }) {
    this.gameEngine = new GameEngine({
      config: checkpoint.gameConfig,
      logs: checkpoint.logs,
      tokenLogs: checkpoint.tokenLogs,
      violationLogs: checkpoint.violationLogs,
    });
    this.p1Agent = createAgent(checkpoint.p1Config);
    this.p2Agent = createAgent(checkpoint.p2Config);

    this.maxTurns = maxTurns ?? 50; // Default to 50 turns if not specified

    this.result = checkpoint;
    this.onResult = onResult;
  }

  private async saveResult({ isDraw }: { isDraw: boolean }): Promise<void> {
    const winner = isDraw ? "draw" : this.gameEngine.getWinner();
    const logs = this.gameEngine.getLogs();
    const violationLogs = this.gameEngine.getViolationLogs();
    const tokenLogs = this.gameEngine.getTokenLogs();

    this.result = {
      winner,
      logs,
      violationLogs,
      tokenLogs,
      gameConfig: this.gameEngine.getConfig(),
      p1Config: this.p1Agent.getConfig(),
      p2Config: this.p2Agent.getConfig(),
    };

    await this.onResult?.(this.result);
  }

  public async runBattle(): Promise<void> {
    let turnCount = 0;

    while (!this.gameEngine.isGameOver() && turnCount < this.maxTurns) {
      const gameState = this.gameEngine.getGameState();
      const currentPlayer = this.gameEngine.getCurrentPlayer();

      turnCount = gameState.turn;

      try {
        let agent: LLMAgent;
        let playerRole: "p1" | "p2";

        if (currentPlayer === "p1") {
          agent = this.p1Agent;
          playerRole = "p1";
        } else {
          agent = this.p2Agent;
          playerRole = "p2";
        }

        const move = await agent.makeMove(gameState, playerRole);

        this.gameEngine.recordTokenUsage(
          gameState.turn,
          playerRole,
          move.tokenUsage.total
        );

        this.gameEngine.processPlayerTurn(playerRole, move.calls);

        await this.saveResult({ isDraw: false });
      } catch (error) {
        console.error(`Turn ${turnCount} failed:`, error);
        break;
      }
    }

    await this.saveResult({ isDraw: turnCount >= this.maxTurns });
  }

  public getResult(): GameResult {
    return this.result;
  }
}

export const getRoleState = (game: GameResult, role: "p1" | "p2") => {
  if (game.winner === null) {
    return "";
  }

  if (game.winner === "draw") {
    return "draw";
  }

  return game.winner === role ? "win" : "lose";
};
