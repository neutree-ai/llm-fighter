# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LLM Fighter is a platform for evaluating LLM agentic capabilities through strategic combat games. The system consists of:

- **Frontend (ui/)**: React + TypeScript + Vite web application
- **Backend (api/)**: Cloudflare Workers API with D1 database
- **Game Engine**: Turn-based combat system with skill-based gameplay

## Architecture

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with TanStack Router for routing
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack Query for server state

### Backend Stack
- **Runtime**: Cloudflare Workers with Hono framework
- **Database**: Cloudflare D1 (SQLite-based)
- **API**: OpenAPI-compatible endpoints using chanfana
- **Auth**: GitHub OAuth integration

### Game System
- **Engine**: `ui/src/lib/game/engine.ts` - Core game state management and validation
- **Config**: `ui/src/lib/game/config.ts` - Game configuration and skill definitions
- **LLM Interface**: `ui/src/lib/game/llm.ts` - Agent creation and communication
- **Runner**: `ui/src/lib/game/runner.ts` - Battle orchestration

## Development Commands

### Frontend (ui/)
```bash
# Development server (proxies API to production)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend (api/)
```bash
# Development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# Generate types from Wrangler
npm run cf-typegen
```

## Key Components

### Game Engine (`ui/src/lib/game/engine.ts`)
- **GameEngine class**: Manages turn-based combat, validates moves, tracks state
- **Skills**: quickStrike, heavyBlow, barrier, rejuvenate, ultimateNova, skipTurn
- **Violation System**: Penalizes invalid moves with turn skips
- **Resource Management**: HP/MP system with cooldowns and regeneration

### LLM Agent System (`ui/src/lib/game/llm.ts`)
- **LLMAgent class**: Handles communication with OpenAI-compatible APIs
- **Tool System**: Uses `thinking` and `useSkill` tools for agent interaction
- **Prompt Generation**: Builds detailed game state context for agents

### API Endpoints (`api/src/endpoints/`)
- Game result CRUD operations
- Public game data access
- Authentication-protected user operations

## Game Rules Summary

- **Resources**: 600 HP, 120 MP, +6 MP regeneration per turn
- **Skills**: Each has MP cost, cooldown, and effects (damage/heal/barrier)
- **Violations**: Invalid moves result in 3-turn penalties
- **Victory**: Last agent standing wins
- **Barrier Mechanic**: 50% damage reduction for one incoming attack

## Database Schema

- **games**: Core game records with configurations and results
- **users**: GitHub OAuth user accounts
- **sessions**: Authentication session management

## Important Files

- `ui/src/lib/game/prompts/system-v1.md`: Default system prompt for LLM agents
- `ui/src/routes/docs/design.md`: Comprehensive system design documentation
- `api/migrations/`: Database schema migrations
- `api/wrangler.jsonc`: Cloudflare Workers configuration

## Testing

The game engine includes comprehensive validation and error handling. When making changes:

1. Test game logic with various skill combinations
2. Verify violation detection and penalty application
3. Check LLM agent communication and tool usage
4. Validate API endpoints with authentication flows

## Deployment

- **Frontend**: Built to `ui/dist/` and served as Cloudflare Workers assets
- **Backend**: Deployed as Cloudflare Worker with D1 database and KV storage
- **Domain**: Custom domain configured in wrangler.jsonc

## Security Considerations

- API keys are sanitized in agent configurations (replaced with "*")
- GitHub OAuth handles authentication
- Database queries use parameterized statements
- CORS and domain restrictions in place