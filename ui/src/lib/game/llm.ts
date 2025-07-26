import {
  type CoreMessage,
  generateText,
  type LanguageModelUsage,
  type LanguageModelV1,
  tool,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { GameState, ToolCall } from "./engine.ts";
import { SkillName } from "./engine.ts";

const ThinkingSchema = z.object({
  content: z.string().describe("Your reasoning and strategy thoughts"),
});

const UseSkillSchema = z.object({
  skill: z
    .enum([
      SkillName.quickStrike,
      SkillName.heavyBlow,
      SkillName.barrier,
      SkillName.rejuvenate,
      SkillName.ultimateNova,
      SkillName.skipTurn,
    ])
    .describe("The skill to use this turn"),
});

export type AgentConfig = {
  baseURL: string;
  apiKey: string;
  name: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
};

export class LLMAgent {
  private config: AgentConfig;
  private model: LanguageModelV1;
  private totalTokensUsed = 0;

  constructor(config: AgentConfig) {
    this.config = config;

    this.model = createOpenAI({
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey,
    })(this.config.model);
  }

  public async makeMove(
    gameState: GameState,
    playerRole: "p1" | "p2"
  ): Promise<{
    calls: ToolCall[];
    tokenUsage: { total: number };
  }> {
    const prompt = this.buildPrompt(gameState, playerRole);

    try {
      let round = 0;
      const messages: CoreMessage[] = [
        {
          role: "user",
          content: prompt,
        },
      ];
      const allCalls: ToolCall[] = [];

      while (true) {
        round++;

        const result = await generateText({
          model: this.model,
          system: this.config.systemPrompt,
          messages,
          temperature: this.config.temperature || 0.1,
          maxTokens: this.config.maxTokens || 512,
          maxRetries: 3,
          tools: {
            thinking: tool({
              parameters: ThinkingSchema,
              description:
                "Reason about the current game state and plan your move",
              execute: async () => {
                return `ok`;
              },
            }),
            useSkill: tool({
              parameters: UseSkillSchema,
              description: "Use a skill during your turn",
              execute: async () => {
                return `done`;
              },
            }),
          },
        });
        const tokenUsage = this.calculateTokenUsage(result.usage || {});
        this.totalTokensUsed += tokenUsage.total;

        if (result.text.trim()) {
          console.log(`[${this.config.name}] Response: ${result.text}`);
        }

        const calls = result.toolCalls.map((c) => {
          if (c.toolName === "thinking") {
            return {
              type: c.toolName,
              content: c.args.content,
            };
          }

          if (c.toolName === "useSkill") {
            return {
              type: c.toolName,
              skill: c.args.skill as SkillName,
            };
          }

          throw new Error(`Unknown tool call`);
        });
        allCalls.push(...calls);

        if (calls.some((c) => c.type === "useSkill")) {
          return {
            calls: allCalls,
            tokenUsage,
          };
        }

        messages.push(...result.response.messages);

        if (round > 5) {
          throw new Error(
            `Exceeded maximum thinking rounds without a valid skill call`
          );
        }
      }
    } catch (error) {
      console.error(`[${this.config.name}] Error generating move:`, error);

      // let engine do penalty
      return {
        calls: [],
        tokenUsage: { total: 0 },
      };
    }
  }

  private buildPrompt(gameState: GameState, playerRole: "p1" | "p2"): string {
    const you = gameState[playerRole];
    const opponent = playerRole === "p1" ? gameState.p2 : gameState.p1;
    const yourActions = gameState.lastActions[playerRole];
    const opponentActions =
      gameState.lastActions[playerRole === "p1" ? "p2" : "p1"];

    return `## CURRENT GAME STATE (Turn ${gameState.turn}):

**Your Status (${playerRole.toUpperCase()}):**
- HP: ${you.hp}/600
- MP: ${you.mp}/120
- Penalty turns remaining: ${you.penaltyTurnsRemaining}
- Cooldowns: ${
      Object.entries(you.cooldowns)
        .filter(([, cd]) => cd > 0)
        .map(([skill, cd]) => `${skill}(${cd})`)
        .join(", ") || "None"
    }

**Opponent Status:**
- HP: ${opponent.hp}/600  
- MP: ${opponent.mp}/120
- Penalty turns remaining: ${opponent.penaltyTurnsRemaining}
- Cooldowns: ${
      Object.entries(opponent.cooldowns)
        .filter(([, cd]) => cd > 0)
        .map(([skill, cd]) => `${skill}(${cd})`)
        .join(", ") || "None"
    }

**Recent Actions (most recent first):**
- Your last 5: ${yourActions.join(" → ") || "None yet"}
- Opponent's last 5: ${opponentActions.join(" → ") || "None yet"}

${
  gameState.currentPlayer === playerRole
    ? "Analyze the situation and make your move. Remember: you can think multiple times but must use exactly one skill per turn."
    : "Wait for your turn."
}`;
  }

  private calculateTokenUsage(usage: LanguageModelUsage): {
    total: number;
  } {
    const total = usage.totalTokens;

    return { total };
  }

  public getTotalTokensUsed(): number {
    return this.totalTokensUsed;
  }

  public getName(): string {
    return this.config.name;
  }

  public getConfig(): AgentConfig {
    return {
      ...this.config,
      apiKey: "*",
    };
  }
}

export function createAgent(config: AgentConfig): LLMAgent {
  return new LLMAgent(config);
}
