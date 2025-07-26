import { SkillName, type GameConfig } from "./engine";
import type { GameResult } from "./runner";
import v1SystemPrompt from "./prompts/system-v1.md?raw";

function equal<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type Config = Pick<GameResult, "gameConfig"> & {
  systemPrompt: string;
};

export const v1Config: Config = {
  systemPrompt: v1SystemPrompt,
  gameConfig: {
    player: {
      initialHp: 600,
      maxHp: 600,
      initialMp: 120,
      maxMp: 120,
      mpRegenPerTurn: 6,
    },
    game: {
      initialTurn: 1,
      maxLastActionsHistory: 5,
      violationPenaltyTurns: 3,
      barrierDamageReduction: 0.5,
    },
    skills: {
      [SkillName.quickStrike]: {
        name: SkillName.quickStrike,
        mpCost: 5,
        cooldown: 1,
        damage: 20,
      },
      [SkillName.heavyBlow]: {
        name: SkillName.heavyBlow,
        mpCost: 15,
        cooldown: 2,
        damage: 45,
      },
      [SkillName.barrier]: {
        name: SkillName.barrier,
        mpCost: 12,
        cooldown: 3,
        barrier: true,
      },
      [SkillName.rejuvenate]: {
        name: SkillName.rejuvenate,
        mpCost: 18,
        cooldown: 4,
        heal: 40,
      },
      [SkillName.ultimateNova]: {
        name: SkillName.ultimateNova,
        mpCost: 40,
        cooldown: 6,
        damage: 140,
      },
      [SkillName.skipTurn]: {
        name: SkillName.skipTurn,
        mpCost: 0,
        cooldown: 0,
      },
    },
  },
};

export function getGameConfigVersion(config: GameConfig) {
  switch (true) {
    case equal(config, v1Config.gameConfig):
      return "v1";
    default:
      return "custom";
  }
}

export function getPromptVersion(prompt: string) {
  switch (true) {
    case prompt === v1Config.systemPrompt:
      return "v1";
    default:
      return "custom";
  }
}
