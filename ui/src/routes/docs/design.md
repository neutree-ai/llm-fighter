# LLM Fighter System Design Document

## Table of Contents

1. Background & Motivation
2. Core Game Mechanics
3. Battle Flow & Tool Integration
4. Configuration & Parameters
5. Data Collection & Metrics
6. Architecture & Implementation

---

## 1. Background & Motivation

LLM Fighter introduces a novel evaluation framework that tests agentic capabilities through real-time adversarial gameplay. Our system addresses four key dimensions of intelligent behavior:

**Strategic Resource Management**: Models must demonstrate quantitative reasoning and long-term planning across multiple constraints and trade-offs. The HP/MP/cooldown system creates complex optimization problems that require balancing immediate actions with future opportunities.

**Tool Execution Accuracy**: Our framework evaluates precise tool selection and invocation with customizable skill sets under time pressure. Unlike static testing environments, mistakes carry immediate strategic consequences that compound over time.

**Real-time Adaptation**: The adversarial environment demands continuous context processing and dynamic strategy adjustment based on evolving game states. Models must read opponent patterns, predict future moves, and adapt their strategies accordingly.

**Precision Under Pressure**: Our penalty system ensures that execution accuracy directly impacts success. Winners consistently demonstrate superior precision, as violations and sub-optimal choices create cascading disadvantages that skilled opponents can exploit.

This combat-based evaluation reveals capabilities that emerge only in dynamic, multi-turn scenarios where strategic thinking, tool mastery, and adaptive reasoning converge.

## 2. Core Game Mechanics

### 2.1 Resource System

| Component              | Specification                     |
| ---------------------- | --------------------------------- |
| **Health Points (HP)** | 600 initial / 600 maximum         |
| **Mana Points (MP)**   | 120 initial / 120 maximum         |
| **MP Regeneration**    | +6 MP per turn (natural recovery) |
| **Cooldown System**    | Individual cooldowns per skill    |

### 2.2 Skill Library

All agents share an identical skill set, ensuring fair evaluation. Strategic differentiation emerges entirely from LLM reasoning and prompt engineering.

| Skill          | MP Cost | Cooldown | Effect                                      |
| -------------- | ------- | -------- | ------------------------------------------- |
| `quickStrike`  | 5       | 1 turn   | 20 damage                                   |
| `heavyBlow`    | 15      | 2 turns  | 45 damage                                   |
| `barrier`      | 12      | 3 turns  | 50% damage reduction (next incoming attack) |
| `rejuvenate`   | 18      | 4 turns  | Restore 40 HP                               |
| `ultimateNova` | 40      | 6 turns  | 140 damage                                  |
| `skipTurn`     | 0       | 0 turns  | No action (strategic waiting)               |

### 2.3 Violation System

**Validation Process**:

1. Format validation: Tool calls must conform to schema
2. Rule validation: Sufficient MP, cooldown ready, skill exists
3. Penalty: Skip N turns (default N=3) for violations

**Violation Examples**:

- Insufficient MP for chosen skill
- Using skill still on cooldown
- Invalid skill name or missing skill parameter
- Multiple skill usage in single turn

### 2.4 Victory Conditions

**Death Match Mode**: Battle continues until any player's HP ≤ 0
**Turn Limit**: Games exceeding maximum turns (default: 50) result in draw
**Immediate Resolution**: Game ends instantly when victory condition is met

## 3. Battle Flow & Tool Integration

### 3.1 Turn Sequence (Asynchronous Serial)

1. **Context Generation**: System creates game state context including public status, last 5 actions from each player, and opponent penalty status
2. **Player Action**: Current player's agent outputs tool calls
3. **Adjudication**: System validates and resolves actions, updates game state
4. **Turn Transition**: Switch to next player, increment turn counter when both players have acted
5. **Loop**: Continue until victory condition or turn limit reached

### 3.2 Context Structure

The system provides each agent with comprehensive game state information:

```json
{
  "turn": 7,
  "you": {
    "hp": 420,
    "mp": 55,
    "cooldowns": { "heavyBlow": 1, "barrier": 0 },
    "penaltyTurnsRemaining": 0
  },
  "opponent": {
    "hp": 370,
    "mp": 40,
    "cooldowns": { "ultimateNova": 2 },
    "penaltyTurnsRemaining": 0
  },
  "lastActions": {
    "you": ["heavyBlow", "barrier", "skipTurn", "quickStrike", "ultimateNova"],
    "opponent": [
      "quickStrike",
      "quickStrike",
      "heavyBlow",
      "barrier",
      "skipTurn"
    ]
  }
}
```

### 3.3 Tool Schema

| Tool       | Parameters               | Schema                | Usage Rules                                             |
| ---------- | ------------------------ | --------------------- | ------------------------------------------------------- |
| `thinking` | `{ "content": string }`  | Multiple uses allowed | Private reasoning and strategy planning                 |
| `useSkill` | `{ "skill": SkillName }` | Exactly one per turn  | Execute chosen skill; missing call results in violation |

**Tool Call Flow**:

1. Agent may use `thinking` multiple times for strategy analysis
2. Agent must use `useSkill` exactly once to complete turn
3. Missing or multiple `useSkill` calls trigger violation penalties

### 3.4 State Management

**Resource Updates**: Applied after each successful action

- MP regeneration (+6 per turn)
- Cooldown decrements (all active cooldowns -1)
- Penalty turn decrements (if applicable)

## 4. Configuration & Parameters

### 4.1 Standard Game Configuration

| Parameter             | Default Value  | Description                          |
| --------------------- | -------------- | ------------------------------------ |
| **Initial HP**        | 600            | Starting health points               |
| **Maximum HP**        | 600            | Health point ceiling                 |
| **Initial MP**        | 120            | Starting mana points                 |
| **Maximum MP**        | 120            | Mana point ceiling                   |
| **MP Regeneration**   | +6 per turn    | Natural mana recovery                |
| **Initial Cooldowns** | 0 (all skills) | All skills available at game start   |
| **Turn Order**        | Alternating    | P1 starts, then alternates each turn |
| **Max Turns**         | 50             | Draw condition if exceeded           |
| **Violation Penalty** | 3 turns        | Skip turns for rule violations       |
| **Barrier Reduction** | 50%            | Damage reduction percentage          |
| **Action History**    | 5 actions      | Maximum stored recent actions        |

### 4.2 Agent Configuration

```typescript
type AgentConfig = {
  baseURL: string; // LLM API endpoint
  apiKey: string; // Authentication key
  name: string; // Agent identifier
  model: string; // Model specification
  systemPrompt?: string; // Custom system instructions
  temperature?: number; // Sampling temperature (default: 0.1)
  maxTokens?: number; // Response token limit (default: 512)
};
```

### 4.3 Customization Options

**Game Rules**:

- Adjustable resource pools (HP/MP limits)
- Configurable regeneration rates
- Variable penalty severity
- Custom turn limits

**Skill Balancing**:

- Modifiable MP costs and cooldowns
- Damage/healing value adjustments
- Effect duration modifications

**Agent Behavior**:

- Custom system prompts for different strategies
- Temperature and token limit optimization
- Model selection and configuration

## 5. Data Collection & Metrics

### 5.1 Log Structure

The system captures comprehensive battle data through multiple log types:

**Game Logs**: Complete turn-by-turn battle records

```typescript
type GameLog = {
  turn: number; // Turn number
  timestamp: string; // ISO timestamp
  player: "p1" | "p2"; // Acting player
  state: GameState; // Game state before action
  toolCalls: ToolCall[]; // Agent's tool invocations
  result: TurnResult; // Action outcome and effects
};
```

**Violation Logs**: Rule violation tracking

```typescript
type ViolationLog = {
  turn: number; // When violation occurred
  agent: "p1" | "p2"; // Violating agent
  reason: string; // Specific violation description
  penaltyTurns: number; // Penalty duration
};
```

**Token Logs**: Resource usage monitoring

```typescript
type TokenLog = {
  turn: number; // Turn number
  agent: "p1" | "p2"; // Token consuming agent
  totalTokens: number; // Total tokens used this turn
};
```

### 5.2 Battle Results

```typescript
type GameResult = {
  winner: "p1" | "p2" | "draw" | null; // Battle outcome
  gameConfig: GameConfig; // Game parameters used
  logs: GameLog[]; // Complete battle log
  violationLogs: ViolationLog[]; // Violation history
  tokenLogs: TokenLog[]; // Token usage history
  p1Config: AgentConfig; // Player 1 configuration
  p2Config: AgentConfig; // Player 2 configuration
};
```
