import type { GameResult } from "./runner";
import type { GameLog, ViolationLog } from "./engine";

export interface TimelineEvent {
  turn: number;
  timestamp: string;
  player: "p1" | "p2";
  type: "action" | "violation";
  
  // Action event data
  thinking?: string;
  skill?: string;
  success?: boolean;
  violation_reason?: string;
  damage_dealt?: number;
  healing_done?: number;
  
  // State after action
  hp?: { p1: number; p2: number };
  mp?: { p1: number; p2: number };
  
  // Token usage
  tokens_used?: number;
  
  // Penalties
  penalty_turns?: number;
}

export interface BattleTimeline {
  meta: {
    game_id?: string;
    winner: string | null;
    total_turns: number;
    p1_name: string;
    p2_name: string;
    p1_model: string;
    p2_model: string;
    initial_hp: number;
    initial_mp: number;
    mp_regen_per_turn: number;
  };
  
  skills: Record<string, {
    mp_cost: number;
    cooldown: number;
    damage?: number;
    heal?: number;
    barrier?: boolean;
    description: string;
  }>;
  
  timeline: TimelineEvent[];
  
  summary: {
    total_tokens: { p1: number; p2: number };
    total_violations: { p1: number; p2: number };
    total_damage_dealt: { p1: number; p2: number };
    total_healing_done: { p1: number; p2: number };
  };
}

const SKILL_DESCRIPTIONS: Record<string, string> = {
  quickStrike: "Fast attack with low damage and MP cost",
  heavyBlow: "Powerful attack with high damage and MP cost", 
  barrier: "Creates protective barrier reducing next incoming damage by 50%",
  rejuvenate: "Heals HP and restores some MP",
  ultimateNova: "Devastating ultimate attack with very high MP cost",
  skipTurn: "Skip turn (no MP cost, used for penalties or strategic delay)"
};

export function exportGameAsTimeline(gameResult: GameResult): BattleTimeline {
  // Sort all events by turn and timestamp
  const allEvents: Array<{
    turn: number;
    timestamp: string;
    type: "game" | "violation";
    data: GameLog | ViolationLog;
  }> = [];

  // Add game logs
  gameResult.logs.forEach(log => {
    allEvents.push({
      turn: log.turn,
      timestamp: log.timestamp,
      type: "game",
      data: log
    });
  });

  // Add violation logs
  gameResult.violationLogs.forEach(violation => {
    allEvents.push({
      turn: violation.turn,
      timestamp: new Date().toISOString(), // violations don't have timestamps
      type: "violation", 
      data: violation
    });
  });

  // Sort chronologically
  allEvents.sort((a, b) => {
    if (a.turn !== b.turn) return a.turn - b.turn;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Create token lookup map
  const tokenMap = new Map<string, number>();
  gameResult.tokenLogs.forEach(tokenLog => {
    tokenMap.set(`${tokenLog.turn}-${tokenLog.agent}`, tokenLog.totalTokens);
  });

  // Build timeline events
  const timeline: TimelineEvent[] = [];
  
  allEvents.forEach(event => {
    if (event.type === "game") {
      const log = event.data as GameLog;
      
      // Extract thinking content from tool calls
      const thinkingCall = log.toolCalls.find(call => call.type === "thinking");
      const skillCall = log.toolCalls.find(call => call.type === "useSkill");
      
      timeline.push({
        turn: log.turn,
        timestamp: log.timestamp,
        player: log.player,
        type: "action",
        thinking: thinkingCall?.content || undefined,
        skill: log.result.skillUsed || skillCall?.skill || undefined,
        success: log.result.success,
        violation_reason: log.result.violation || undefined,
        damage_dealt: log.result.damageDealt || undefined,
        healing_done: log.result.healingDone || undefined,
        hp: {
          p1: log.state.p1.hp,
          p2: log.state.p2.hp
        },
        mp: {
          p1: log.state.p1.mp,
          p2: log.state.p2.mp
        },
        tokens_used: tokenMap.get(`${log.turn}-${log.player}`) || undefined
      });
    } else {
      const violation = event.data as ViolationLog;
      
      timeline.push({
        turn: violation.turn,
        timestamp: event.timestamp,
        player: violation.agent,
        type: "violation",
        violation_reason: violation.reason,
        penalty_turns: violation.penaltyTurns
      });
    }
  });

  // Calculate summary statistics
  const summary = {
    total_tokens: { p1: 0, p2: 0 },
    total_violations: { p1: 0, p2: 0 },
    total_damage_dealt: { p1: 0, p2: 0 },
    total_healing_done: { p1: 0, p2: 0 }
  };

  gameResult.tokenLogs.forEach(tokenLog => {
    summary.total_tokens[tokenLog.agent] += tokenLog.totalTokens;
  });

  gameResult.violationLogs.forEach(violation => {
    summary.total_violations[violation.agent]++;
  });

  gameResult.logs.forEach(log => {
    if (log.result.damageDealt) {
      summary.total_damage_dealt[log.player] += log.result.damageDealt;
    }
    if (log.result.healingDone) {
      summary.total_healing_done[log.player] += log.result.healingDone;
    }
  });

  // Build skills reference
  const skills: Record<string, {
    mp_cost: number;
    cooldown: number;
    damage?: number;
    heal?: number;
    barrier?: boolean;
    description: string;
  }> = {};
  Object.entries(gameResult.gameConfig.skills).forEach(([name, config]) => {
    skills[name] = {
      mp_cost: config.mpCost,
      cooldown: config.cooldown,
      damage: config.damage || undefined,
      heal: config.heal || undefined,
      barrier: config.barrier || undefined,
      description: SKILL_DESCRIPTIONS[name] || "Unknown skill"
    };
  });

  return {
    meta: {
      winner: gameResult.winner,
      total_turns: Math.max(...gameResult.logs.map(log => log.turn), 0),
      p1_name: gameResult.p1Config.name,
      p2_name: gameResult.p2Config.name,
      p1_model: gameResult.p1Config.model,
      p2_model: gameResult.p2Config.model,
      initial_hp: gameResult.gameConfig.player.initialHp,
      initial_mp: gameResult.gameConfig.player.initialMp,
      mp_regen_per_turn: gameResult.gameConfig.player.mpRegenPerTurn
    },
    skills,
    timeline,
    summary
  };
}

export function exportGameAsYAML(gameResult: GameResult): string {
  const timeline = exportGameAsTimeline(gameResult);
  
  // Convert to YAML manually for better formatting control
  const yamlLines: string[] = [];
  
  // Meta section
  yamlLines.push("meta:");
  yamlLines.push(`  winner: ${timeline.meta.winner || 'null'}`);
  yamlLines.push(`  total_turns: ${timeline.meta.total_turns}`);
  yamlLines.push(`  p1_name: "${timeline.meta.p1_name}"`);
  yamlLines.push(`  p2_name: "${timeline.meta.p2_name}"`);
  yamlLines.push(`  p1_model: "${timeline.meta.p1_model}"`);
  yamlLines.push(`  p2_model: "${timeline.meta.p2_model}"`);
  yamlLines.push(`  initial_hp: ${timeline.meta.initial_hp}`);
  yamlLines.push(`  initial_mp: ${timeline.meta.initial_mp}`);
  yamlLines.push(`  mp_regen_per_turn: ${timeline.meta.mp_regen_per_turn}`);
  yamlLines.push("");

  // Skills section
  yamlLines.push("skills:");
  Object.entries(timeline.skills).forEach(([name, skill]) => {
    yamlLines.push(`  ${name}:`);
    yamlLines.push(`    mp_cost: ${skill.mp_cost}`);
    yamlLines.push(`    cooldown: ${skill.cooldown}`);
    if (skill.damage) yamlLines.push(`    damage: ${skill.damage}`);
    if (skill.heal) yamlLines.push(`    heal: ${skill.heal}`);
    if (skill.barrier) yamlLines.push(`    barrier: true`);
    yamlLines.push(`    description: "${skill.description}"`);
  });
  yamlLines.push("");

  // Timeline section
  yamlLines.push("timeline:");
  timeline.timeline.forEach(event => {
    yamlLines.push(`  - turn: ${event.turn}`);
    yamlLines.push(`    timestamp: "${event.timestamp}"`);
    yamlLines.push(`    player: ${event.player}`);
    yamlLines.push(`    type: ${event.type}`);
    
    if (event.thinking) {
      const escapedThinking = event.thinking.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      yamlLines.push(`    thinking: "${escapedThinking}"`);
    }
    if (event.skill) yamlLines.push(`    skill: ${event.skill}`);
    if (event.success !== undefined) yamlLines.push(`    success: ${event.success}`);
    if (event.violation_reason) yamlLines.push(`    violation_reason: "${event.violation_reason}"`);
    if (event.damage_dealt) yamlLines.push(`    damage_dealt: ${event.damage_dealt}`);
    if (event.healing_done) yamlLines.push(`    healing_done: ${event.healing_done}`);
    if (event.penalty_turns) yamlLines.push(`    penalty_turns: ${event.penalty_turns}`);
    if (event.tokens_used) yamlLines.push(`    tokens_used: ${event.tokens_used}`);
    
    if (event.hp) {
      yamlLines.push(`    hp:`);
      yamlLines.push(`      p1: ${event.hp.p1}`);
      yamlLines.push(`      p2: ${event.hp.p2}`);
    }
    if (event.mp) {
      yamlLines.push(`    mp:`);
      yamlLines.push(`      p1: ${event.mp.p1}`);
      yamlLines.push(`      p2: ${event.mp.p2}`);
    }
  });
  yamlLines.push("");

  // Summary section
  yamlLines.push("summary:");
  yamlLines.push("  total_tokens:");
  yamlLines.push(`    p1: ${timeline.summary.total_tokens.p1}`);
  yamlLines.push(`    p2: ${timeline.summary.total_tokens.p2}`);
  yamlLines.push("  total_violations:");
  yamlLines.push(`    p1: ${timeline.summary.total_violations.p1}`);
  yamlLines.push(`    p2: ${timeline.summary.total_violations.p2}`);
  yamlLines.push("  total_damage_dealt:");
  yamlLines.push(`    p1: ${timeline.summary.total_damage_dealt.p1}`);
  yamlLines.push(`    p2: ${timeline.summary.total_damage_dealt.p2}`);
  yamlLines.push("  total_healing_done:");
  yamlLines.push(`    p1: ${timeline.summary.total_healing_done.p1}`);
  yamlLines.push(`    p2: ${timeline.summary.total_healing_done.p2}`);

  return yamlLines.join('\n');
}