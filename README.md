# Smart AI API Mocking Tool

A powerful, AI-powered mock API generator that allows developers to create realistic test endpoints using plain English prompts.

[![CI](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/actions/workflows/ci.yml/badge.svg)](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/actions/workflows/ci.yml)
[![Docker](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/actions/workflows/docker.yml/badge.svg)](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/actions/workflows/docker.yml)
[![CodeQL](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/actions/workflows/codeql.yml/badge.svg)](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/actions/workflows/codeql.yml)
[![GHCR](https://img.shields.io/badge/image-ghcr.io-2496ed?logo=docker)](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/pkgs/container/smart-ai-api-mocking-tool)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-025e8c?logo=dependabot)](https://github.com/Kishan0703/Smart-AI-API-Mocking-Tool/network/updates)

> The full CI/CD story — every pipeline gate and the reasoning behind it — lives in [docs/CI-CD.md](docs/CI-CD.md).

## 🚀 Features

### Phase 1: Core MVP Features

#### 1. Prompt-to-Schema Input
- Simple text input where users describe their API needs in plain English
- Example: "I need an API for a list of 10 customized sneakers with price, color, size, and image URL"

#### 2. AI-Powered Generator (Context-Aware)
- Generates JSON data based on natural language descriptions
- **Smart data generation**: 
  - Prices get realistic numbers (e.g., `120.50`)
  - Colors get actual color names (e.g., `"Red"`, `"Blue"`)
  - Emails get proper email formats
  - And 40+ other context-aware field types

#### 3. Live Endpoints
- Instantly generates unique URLs for each mock API
- Example: `https://your-app.com/api/mock/sneakers-mock-abc123`
- Ready to use in your frontend code immediately

#### 4. JSON Editor
- View and edit AI-generated data
- Syntax-highlighted editor
- Real-time validation
- Copy to clipboard functionality



### Phase 2: Chaos Mode & Dynamic Routing

#### 1. Chaos Mode
Simulate real-world server conditions:

**Latency Simulation:**
- Add custom delays (0-5000ms)
- Test loading spinners and loading states
- Slider control for easy adjustment

**Error Rate Simulation:**
- Configure failure percentage (0-100%)
- Choose error type:
  - 500 Internal Server Error
  - 503 Service Unavailable
  - 404 Not Found
  - 408 Request Timeout
- Test your error handling code

**Quick Presets:**
- Perfect Server (0ms, 0% errors)
- Slow Network (2000ms delay)
- Flaky Server (500ms, 10% errors)
- Total Chaos (3000ms, 30% errors)

#### 2. Dynamic Routing (CRUD Simulator)
Full HTTP method support:

| Method | Behavior |
|--------|----------|
| `GET` | Returns the mock data |
| `POST` | Simulates resource creation with auto-generated ID |
| `PUT` | Simulates full resource replacement |
| `PATCH` | Simulates partial resource update |
| `DELETE` | Simulates resource deletion |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Generation**: Faker.js
- **Icons**: Lucide React

## Installation

```bash
# Install dependencies
npm install

# (Optional) configure the AI generator — without a key the app
# falls back to a built-in realistic faker generator
cp .env.example .env.local   # add your GEMINI_API_KEY

# Start the development server
npm run dev
```

## Running with Docker

```bash
# Build and run locally (mock data persists via a named volume)
docker compose up --build

# Or pull the image published by CI from GitHub Container Registry
docker run -p 3000:3000 ghcr.io/kishan0703/smart-ai-api-mocking-tool:latest
```

The container runs as a non-root user, exposes a `HEALTHCHECK` on `/api/health`,
and needs no API key to boot — the faker fallback keeps everything functional.

## Testing & quality

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
npm run test:unit   # 24 unit tests (vitest)
npm run build       # production build (same artifact CI ships)
npm run smoke       # 12 end-to-end checks against a running server
```

CI runs all of these on every pull request, plus security gates
(`npm audit`, gitleaks secret scan, dependency review, CodeQL SAST,
Trivy container scan) — see [docs/CI-CD.md](docs/CI-CD.md).

## Usage

### Creating a Mock API

1. **Describe your API** in the text input:
   ```
   I need an API for 10 customized sneakers with price, color, size, and image URL
   ```

2. **Press Enter** or click the send button

3. **Get your endpoint URL** instantly:
   ```
   http://localhost:3000/api/mock/sneakers-xyz123
   ```

4. **Edit the JSON** if needed in the editor panel

5. **Configure Chaos Mode** to test edge cases

## API Endpoints

### Generate Mock API
```http
POST /api/generate
Content-Type: application/json

{
  "prompt": "I need an API for 5 users with name, email, and avatar"
}
```

### Mock Endpoint (Dynamic)
```http
GET    /api/mock/:slug    # Returns mock data
POST   /api/mock/:slug    # Simulates create
PUT    /api/mock/:slug    # Simulates replace
PATCH  /api/mock/:slug    # Simulates update
DELETE /api/mock/:slug    # Simulates delete
```

## Project Structure

```
├── .github/workflows/     # CI, Docker, CodeQL, Gemini integration
├── docs/CI-CD.md          # pipeline gates & reasoning
├── scripts/smoke-test.mjs # end-to-end API checks
├── tests/
│   ├── unit/              # vitest unit tests (generator, storage, utils)
│   └── integration/       # opt-in live Gemini tests
├── Dockerfile             # multi-stage, standalone output, non-root
├── docker-compose.yml
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── generate/         # Mock generation endpoint
    │   │   ├── endpoints/[id]/   # CRUD for saved endpoints
    │   │   ├── mock/[slug]/      # Dynamic mock endpoints
    │   │   ├── health/           # Liveness probe (Docker/CI)
    │   │   └── ...
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/               # UI components
    └── lib/
        ├── generator.ts          # Local AI-style data generator
        ├── storage.ts            # File-backed persistence
        ├── store.ts              # Zustand state management
        ├── types.ts              # TypeScript definitions
        └── utils.ts              # Utility functions
```

## Supported Data Types

The AI generator automatically detects and generates appropriate data for:

| Category | Fields |
|----------|--------|
| **Identity** | id, name, firstName, lastName, username |
| **Contact** | email, phone, address |
| **Commerce** | price, description, category, brand, rating, stock, sku |
| **Appearance** | color, size, imageUrl |
| **Location** | city, country, zipCode, latitude, longitude |
| **Content** | title, content, comment, bio, tags |
| **Dates** | createdAt, updatedAt |
| **Booleans** | isActive, isAvailable |

## Hackathon

Built for the **Overclock Hackathon** - Problem Statement #5: Smart AI API Mocking Tool
