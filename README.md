# Project Hyperion

**Cardano AI Parametric Insurance Platform**

A decentralized parametric insurance solution leveraging Cardano blockchain, AI-powered risk assessment, and Hydra for scalable payment channels.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PROJECT HYPERION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────────────────┐ │
│  │             │      │             │      │                         │ │
│  │   UI (app)  │◄────►│  AI (swarm) │◄────►│  Chain (contracts)      │ │
│  │             │      │             │      │                         │ │
│  │  Next.js 14 │      │  FastAPI    │      │  Aiken Smart Contracts  │ │
│  │  React 18   │      │  CrewAI     │      │  Cardano Validators     │ │
│  │  Mesh SDK   │      │  Gemini AI  │      │                         │ │
│  │             │      │             │      │                         │ │
│  └──────┬──────┘      └──────┬──────┘      └────────────┬────────────┘ │
│         │                    │                          │              │
│         │                    │                          │              │
│         └────────────────────┼──────────────────────────┘              │
│                              │                                         │
│                    ┌─────────▼─────────┐                               │
│                    │                   │                               │
│                    │   Hydra (hydra)   │                               │
│                    │   Payment Layer   │                               │
│                    │                   │                               │
│                    └───────────────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **UI ↔ AI**: User interactions trigger AI risk assessments via REST API
2. **AI ↔ Chain**: AI agents evaluate claims and interact with smart contracts
3. **Chain ↔ Hydra**: Fast micro-payments and settlements via Hydra payment channels

## 📁 Folder Structure

```
hyperion/
├── app/                    # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and helpers
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── .env.example       # Environment variables template
│
├── contracts/             # Aiken Smart Contracts
│   ├── validators/        # Plutus validators
│   ├── lib/               # Reusable contract libraries
│   └── aiken.toml         # Aiken project configuration
│
├── swarm/                 # AI Agent Swarm (FastAPI)
│   ├── agents/            # CrewAI agent definitions
│   ├── api/               # FastAPI routes
│   ├── core/              # Core business logic
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment variables template
│
├── hydra/                 # Hydra Payment Channel
│   ├── node/              # Hydra node configuration
│   └── scripts/           # Deployment and management scripts
│
├── .gitignore             # Composite ignore rules
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Aiken CLI
- Cardano Node (optional, for local development)

### Frontend (app)

```bash
cd app
npm install
cp .env.example .env.local
npm run dev
```

### AI Swarm (swarm)

```bash
cd swarm
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn api.main:app --reload
```

### Smart Contracts (contracts)

```bash
cd contracts
aiken build
aiken check
```

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React 18 | Web application |
| **UI Components** | lucide-react, framer-motion | Icons and animations |
| **Charts** | recharts | Data visualization |
| **Blockchain SDK** | @meshsdk/core | Cardano wallet integration |
| **AI Framework** | CrewAI, Google Gemini | Risk assessment agents |
| **API** | FastAPI | Backend services |
| **Smart Contracts** | Aiken | Plutus validators |
| **Scaling** | Hydra | Payment channels |

## 🔐 Environment Variables

See `.env.example` files in `app/` and `swarm/` directories for required configuration.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

This is a modular monorepo designed for multi-IDE collaboration:

- **Frontend devs**: Focus on `/app` directory
- **AI/ML engineers**: Focus on `/swarm` directory
- **Blockchain devs**: Focus on `/contracts` and `/hydra` directories

Each module can be opened independently in your preferred IDE.
