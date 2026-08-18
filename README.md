# Sovyniq

Your AI Knowledge Workspace — an AI-powered workspace for learning, research, document analysis, content generation, AI conversations, artifacts, and podcasts. Built with Next.js 15, React 19, and TypeScript.

## Features

- **Workspaces** - Organize your learning materials and sources
- **Sources** - Upload and process documents, URLs, and other content
- **AI Artifacts** - Generate summaries, quizzes, flashcards, and more from your sources
- **AI Podcasts** - Create two-host "deep dive" podcasts from your sources with text-to-speech
- **Conversations** - Chat with AI about your workspace content with memory

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Background Jobs**: Inngest
- **AI**: OpenAI (GPT-4o, embeddings, TTS)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key
- Inngest account (for background jobs)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chaibook-next-final

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sovyniq"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Inngest
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."

# Stripe (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/       # Authenticated routes
│   │   └── workspace/     # Workspace pages
│   └── api/               # API routes
├── components/            # Shared UI components
├── features/              # Feature-specific code
│   ├── artifacts/         # Learning artifacts (summaries, quizzes, etc.)
│   ├── auth/              # Authentication
│   ├── podcast/           # Podcast generation
│   ├── sources/           # Source management
│   └── workspaces/        # Workspace management
├── lib/                   # Shared utilities
├── server/                # Server-side code
│   ├── inngest/           # Background job functions
│   ├── repositories/      # Database repositories
│   └── services/          # Business logic services
└── generated/             # Generated Prisma types
```

## Key Features Implementation

### Podcast Generation

Podcasts are generated asynchronously via Inngest background jobs:

1. **Script Generation** - GPT-4o creates a two-host conversation script from source content
2. **Voice Synthesis** - Each segment is synthesized to audio using OpenAI TTS (parallelized)
3. **Assembly** - Segments are combined into a complete podcast with metadata

The workflow handles retries, timeouts, and partial failures gracefully.

### Source Processing

Sources go through a pipeline:
1. **Content Extraction** - Text extracted from PDFs, URLs, etc.
2. **Chunking** - Content split into semantic chunks
3. **Embedding** - Chunks embedded with OpenAI embeddings
4. **Indexing** - Stored in vector database for retrieval

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run inngest:dev  # Start Inngest dev server
```

## License

MIT