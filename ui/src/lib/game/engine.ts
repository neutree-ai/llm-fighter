export const SkillName = {
  quickStrike: "quickStrike",
  heavyBlow: "heavyBlow",
  barrier: "barrier",
  rejuvenate: "rejuvenate",
  ultimateNova: "ultimateNova",
  skipTurn: "skipTurn",
} as const;

export type SkillName = (typeof SkillName)[keyof typeof SkillName];

export type GameConfig = {
  player: {
    initialHp: number;
    maxHp: number;
    initialMp: number;
    maxMp: number;
    mpRegenPerTurn: number;
  };
  game: {
    initialTurn: number;
    maxLastActionsHistory: number;
    violationPenaltyTurns: number;
    barrierDamageReduction: number; // 0.5 = 50% reduction
  };
  skills: Record<SkillName, SkillConfig>;
};

export type SkillConfig = {
  name: SkillName;
  mpCost: number;
  cooldown: number;
  damage?: number;
  heal?: number;
  barrier?: boolean;
};

export type GameState = {
  turn: number;
  p1: PlayerState;
  p2: PlayerState;
  lastActions: LastActions;
  currentPlayer: "p1" | "p2";
};

export type PlayerState = {
  hp: number;
  mp: number;
  cooldowns: Record<SkillName, number>;
  penaltyTurnsRemaining: number;
};

export type LastActions = {
  p1: SkillName[];
  p2: SkillName[];
};

export type Skill = {
  name: SkillName;
  mpCost: number;
  cooldown: number;
  damage?: number;
  heal?: number;
  barrier?: boolean;
};

export type ToolCall = {
  type: "thinking" | "useSkill";
  content?: string;
  skill?: SkillName;
};

export type TurnResult = {
  success: boolean;
  violation?: string;
  damageDealt?: number;
  healingDone?: number;
  skillUsed?: SkillName;
};

export type PlayerTurnResult = {
  player: "p1" | "p2";
  turn: number;
  result: TurnResult;
  gameState: GameState;
  timestamp: string;
};

export type GameLog = {
  turn: number;
  timestamp: string;
  player: "p1" | "p2";
  state: GameState;
  toolCalls: ToolCall[];
  result: TurnResult;
};

export type ViolationLog = {
  turn: number;
  agent: "p1" | "p2";
  reason: string;
  penaltyTurns: number;
};

export type TokenLog = {
  turn: number;
  agent: "p1" | "p2";
  totalTokens: number;
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class GameEngine {
  private gameState: GameState;
  private logs: GameLog[];
  private violationLogs: ViolationLog[];
  private tokenLogs: TokenLog[];
  private config: GameConfig;

  constructor({
    config,
    logs,
    tokenLogs,
    violationLogs,
  }: {
    config: GameConfig;
    logs: GameLog[];
    tokenLogs: TokenLog[];
    violationLogs: ViolationLog[];
  }) {
    this.config = { ...config };
    this.logs = logs;
    this.violationLogs = violationLogs;
    this.tokenLogs = tokenLogs;

    this.gameState = this.initializeGame();
    this.replayFromLogs();
  }

  private initializeGame(): GameState {
    const initialPlayerState: PlayerState = {
      hp: this.config.player.initialHp,
      mp: this.config.player.initialMp,
      cooldowns: {
        [SkillName.quickStrike]: 0,
        [SkillName.heavyBlow]: 0,
        [SkillName.barrier]: 0,
        [SkillName.rejuvenate]: 0,
        [SkillName.ultimateNova]: 0,
        [SkillName.skipTurn]: 0,
      },
      penaltyTurnsRemaining: 0,
    };

    return {
      turn: this.config.game.initialTurn,
      p1: deepClone(initialPlayerState),
      p2: deepClone(initialPlayerState),
      lastActions: { p1: [], p2: [] },
      currentPlayer: "p1",
    };
  }

  private replayFromLogs() {
    for (const log of this.logs) {
      this.gameState = this.applyLogToGameState(log);
    }

    if (this.logs.length > 0) {
      const lastLog = this.logs[this.logs.length - 1];
      this.gameState.turn = lastLog.turn;

      if (this.gameState.p1.hp <= 0 || this.gameState.p2.hp <= 0) {
        this.gameState.currentPlayer = lastLog.player;
      }
    }
  }

  private applyLogToGameState(log: GameLog): GameState {
    const newState = deepClone(this.gameState);

    if (log.result.success && log.result.skillUsed) {
      const player = log.player;
      const targetPlayer = player === "p1" ? "p2" : "p1";
      const skill = this.config.skills[log.result.skillUsed];

      if (skill) {
        newState[player].mp -= skill.mpCost;
        newState[player].cooldowns[skill.name] = skill.cooldown;

        if (log.result.damageDealt && log.result.damageDealt > 0) {
          newState[targetPlayer].hp -= log.result.damageDealt;
        }

        if (log.result.healingDone && log.result.healingDone > 0) {
          newState[player].hp += log.result.healingDone;
        }

        this.updateLastActionInState(newState, player, log.result.skillUsed);
      }
    }

    const violationForThisTurn = this.violationLogs.find(
      (v) => v.turn === log.turn && v.agent === log.player
    );
    if (violationForThisTurn) {
      newState[log.player].penaltyTurnsRemaining +=
        violationForThisTurn.penaltyTurns;
    }

    this.updateResourcesAndCooldownsInState(newState, log.player);
    this.updatePenaltyStatusInState(newState, log.player);

    if (newState.p1.hp > 0 && newState.p2.hp > 0) {
      this.switchToNextPlayerInState(newState);
    }

    return newState;
  }

  private updateLastActionInState(
    newState: GameState,
    player: "p1" | "p2",
    skill: SkillName
  ) {
    newState.lastActions[player].unshift(skill);
    if (
      newState.lastActions[player].length >
      this.config.game.maxLastActionsHistory
    ) {
      newState.lastActions[player].pop();
    }
  }

  private updateResourcesAndCooldownsInState(
    newState: GameState,
    player: "p1" | "p2"
  ) {
    newState[player].mp = Math.min(
      this.config.player.maxMp,
      newState[player].mp + this.config.player.mpRegenPerTurn
    );

    for (const skill of Object.keys(
      newState[player].cooldowns
    ) as SkillName[]) {
      if (newState[player].cooldowns[skill] > 0) {
        newState[player].cooldowns[skill]--;
      }
    }
  }

  private updatePenaltyStatusInState(newState: GameState, player: "p1" | "p2") {
    if (newState[player].penaltyTurnsRemaining > 0) {
      newState[player].penaltyTurnsRemaining--;
    }
  }

  private switchToNextPlayerInState(newState: GameState) {
    if (newState.currentPlayer === "p1") {
      newState.currentPlayer = "p2";
    } else {
      newState.currentPlayer = "p1";
      newState.turn++;
    }
  }

  public getGameState(): GameState {
    return deepClone(this.gameState);
  }

  public getConfig(): GameConfig {
    return deepClone(this.config);
  }

  public getCurrentPlayer(): "p1" | "p2" {
    return this.gameState.currentPlayer;
  }

  public isGameOver(): boolean {
    return this.gameState.p1.hp <= 0 || this.gameState.p2.hp <= 0;
  }

  public getWinner(): "p1" | "p2" | null {
    if (this.gameState.p1.hp <= 0) return "p2";
    if (this.gameState.p2.hp <= 0) return "p1";
    return null;
  }

  public processPlayerTurn(
    player: "p1" | "p2",
    calls: ToolCall[]
  ): PlayerTurnResult {
    if (player !== this.gameState.currentPlayer) {
      throw new Error(
        `It's ${this.gameState.currentPlayer}'s turn, not ${player}'s`
      );
    }

    const timestamp = new Date().toISOString();
    const initialState = this.getGameState();

    const result = this.processPlayerActionWithViolationCheck(calls, player);

    if (result.skillUsed) {
      this.updatePlayerLastAction(player, result.skillUsed);
    }

    this.updatePlayerResourcesAndCooldowns(player);
    this.updatePlayerPenaltyStatus(player);

    const log: GameLog = {
      turn: this.gameState.turn,
      timestamp,
      player,
      state: initialState,
      toolCalls: calls,
      result,
    };
    this.logs.push(log);

    this.switchToNextPlayer();

    return {
      player,
      turn: this.gameState.turn,
      result,
      gameState: this.getGameState(),
      timestamp,
    };
  }

  private processPlayerActionWithViolationCheck(
    calls: ToolCall[],
    player: "p1" | "p2"
  ): TurnResult {
    const result = this.processPlayerAction(calls, player);

    if (!result.success) {
      const penaltyTurns = this.config.game.violationPenaltyTurns;

      this.violationLogs.push({
        turn: this.gameState.turn,
        agent: player,
        reason: result.violation ?? "Unknown violation",
        penaltyTurns,
      });

      this.gameState[player].penaltyTurnsRemaining += penaltyTurns;
    }

    return result;
  }

  private processPlayerAction(
    calls: ToolCall[],
    player: "p1" | "p2"
  ): TurnResult {
    const state = this.gameState[player];
    const targetPlayer = player === "p1" ? "p2" : "p1";
    const targetState = this.gameState[targetPlayer];

    if (state.penaltyTurnsRemaining > 0) {
      return {
        success: true,
        skillUsed: SkillName.skipTurn,
      };
    }

    const skillCalls = calls.filter((call) => call.type === "useSkill");

    if (skillCalls.length === 0) {
      return {
        success: false,
        violation: "No skill used",
      };
    }

    if (skillCalls.length > 1) {
      return {
        success: false,
        violation: "Multiple skills used in one turn",
      };
    }

    const skillCall = skillCalls[0];
    if (!skillCall.skill) {
      return {
        success: false,
        violation: "Skill name missing",
      };
    }

    const skill = this.config.skills[skillCall.skill];
    if (!skill) {
      return {
        success: false,
        violation: `Unknown skill: ${skillCall.skill}`,
      };
    }

    if (state.mp < skill.mpCost) {
      return {
        success: false,
        violation: `Insufficient MP: ${state.mp} < ${skill.mpCost}`,
      };
    }

    if (state.cooldowns[skill.name] > 0) {
      return {
        success: false,
        violation: `Skill on cooldown: ${
          state.cooldowns[skill.name]
        } turns remaining`,
      };
    }

    const newState = { ...state };
    newState.mp -= skill.mpCost;
    newState.cooldowns[skill.name] = skill.cooldown;

    let damageDealt = 0;
    let healingDone = 0;

    if (skill.damage && skill.damage > 0) {
      let actualDamage = skill.damage;

      if (this.hasActiveBarrier(targetPlayer)) {
        actualDamage = Math.floor(
          actualDamage * this.config.game.barrierDamageReduction
        );
      }

      actualDamage = Math.min(actualDamage, targetState.hp);
      targetState.hp -= actualDamage;
      damageDealt = actualDamage;
    } else if (skill.heal && skill.heal > 0) {
      const actualHeal = Math.min(
        skill.heal,
        this.config.player.maxHp - newState.hp
      );
      newState.hp += actualHeal;
      healingDone = actualHeal;
    }

    this.gameState[player] = newState;

    return {
      success: true,
      damageDealt,
      healingDone,
      skillUsed: skill.name,
    };
  }

  private hasActiveBarrier(player: "p1" | "p2"): boolean {
    return this.gameState.lastActions[player][0] === SkillName.barrier;
  }

  private updatePlayerLastAction(player: "p1" | "p2", skill: SkillName) {
    this.gameState.lastActions[player].unshift(skill);
    if (
      this.gameState.lastActions[player].length >
      this.config.game.maxLastActionsHistory
    ) {
      this.gameState.lastActions[player].pop();
    }
  }

  private updatePlayerResourcesAndCooldowns(player: "p1" | "p2") {
    this.gameState[player].mp = Math.min(
      this.config.player.maxMp,
      this.gameState[player].mp + this.config.player.mpRegenPerTurn
    );

    for (const skill of Object.keys(
      this.gameState[player].cooldowns
    ) as SkillName[]) {
      if (this.gameState[player].cooldowns[skill] > 0) {
        this.gameState[player].cooldowns[skill]--;
      }
    }
  }

  private updatePlayerPenaltyStatus(player: "p1" | "p2") {
    if (this.gameState[player].penaltyTurnsRemaining > 0) {
      this.gameState[player].penaltyTurnsRemaining--;
    }
  }

  private switchToNextPlayer() {
    if (this.gameState.currentPlayer === "p1") {
      this.gameState.currentPlayer = "p2";
    } else {
      this.gameState.currentPlayer = "p1";
      this.gameState.turn++;
    }
  }

  public recordTokenUsage(
    turn: number,
    agent: "p1" | "p2",
    totalTokens: number
  ) {
    this.tokenLogs.push({
      turn,
      agent,
      totalTokens,
    });
  }

  public getViolationLogs(): ViolationLog[] {
    return [...this.violationLogs];
  }

  public getTokenLogs(): TokenLog[] {
    return [...this.tokenLogs];
  }

  public getLogs(): GameLog[] {
    return [...this.logs];
  }
}
