# 🛡️ Project Hyperion

<div align="center">

![Hyperion Banner](https://img.shields.io/badge/Cardano-Hackathon-blue?style=for-the-badge&logo=cardano)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**AI-Powered Parametric Insurance Protocol on Cardano**

*Revolutionizing decentralized insurance through intelligent risk assessment and automated claims processing*

[Documentation](#-documentation) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**Project Hyperion** is a cutting-edge parametric insurance protocol built on the Cardano blockchain. By combining AI-powered risk assessment with smart contract automation, Hyperion delivers instant, trustless insurance payouts based on verifiable real-world data triggers.

### Key Features

- 🤖 **AI-Driven Risk Assessment** - Multi-agent system powered by CrewAI for intelligent underwriting
- ⚡ **Instant Parametric Payouts** - Automated claims based on oracle-verified data
- 🔗 **Cardano Native** - Built with Aiken smart contracts for maximum security and efficiency
- 🌊 **Hydra-Ready** - Designed for L2 scaling with Hydra Head protocol
- 🎨 **Modern DApp Interface** - Beautiful, responsive UI with real-time blockchain integration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROJECT HYPERION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
│  │                 │    │                 │    │                         │ │
│  │    FRONTEND     │◄──►│   AI BACKEND    │◄──►│      BLOCKCHAIN         │ │
│  │    (Next.js)    │    │   (FastAPI)     │    │    (Aiken/Hydra)        │ │
│  │                 │    │                 │    │                         │ │
│  └────────┬────────┘    └────────┬────────┘    └────────────┬────────────┘ │
│           │                      │                          │              │
│           │                      │                          │              │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────────▼────────────┐ │
│  │  • App Router   │    │  • CrewAI       │    │  • Policy Contracts     │ │
│  │  • Mesh SDK     │    │  • Risk Agents  │    │  • Oracle Integration   │ │
│  │  • Charts/UI    │    │  • Gemini AI    │    │  • Hydra Channels       │ │
│  │  • Animations   │    │  • API Routes   │    │  • Payout Logic         │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘ │
│                                                                             │
│  /app                   /swarm                 /contracts    /hydra        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** (`/app`) | Next.js 14, Mesh SDK, Framer Motion | User interface, wallet connection, policy management |
| **AI Backend** (`/swarm`) | FastAPI, CrewAI, Google Gemini | Risk assessment, claim verification, agent orchestration |
| **Smart Contracts** (`/contracts`) | Aiken | On-chain policy logic, parametric triggers, payouts |
| **Scaling Layer** (`/hydra`) | Hydra Head Protocol | High-throughput micro-transactions, instant settlements |

---

## 📁 Project Structure

```
hyperion/
├── app/                          # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   ├── components/           # React components
│   │   └── lib/                  # Utilities & helpers
│   ├── public/                   # Static assets
│   ├── package.json              # Node dependencies
│   └── .env.example              # Environment template
│
├── contracts/                    # Aiken Smart Contracts
│   ├── validators/               # Contract validators
│   ├── lib/                      # Shared contract libraries
│   ├── aiken.toml                # Aiken configuration
│   └── .env.example              # Environment template
│
├── swarm/                        # Python AI Backend
│   ├── app/
│   │   ├── api/                  # FastAPI routes
│   │   ├── agents/               # CrewAI agent definitions
│   │   └── core/                 # Core business logic
│   ├── tests/                    # Test suite
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment template
│
├── hydra/                        # Hydra L2 Scaling (Future)
│   └── README.md                 # Hydra integration docs
│
├── .gitignore                    # Composite ignore file
├── LICENSE                       # MIT License
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **Aiken** >= 1.0.0
- **Cardano Node** (for contract deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/vikas200267/Hyperion.git
cd Hyperion

# Frontend setup
cd app
npm install
cp .env.example .env.local
npm run dev

# Backend setup (new terminal)
cd ../swarm
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# Smart contracts (new terminal)
cd ../contracts
aiken build
aiken check
```

---

## 🔧 Configuration

Each component uses environment variables for configuration. Copy the `.env.example` files and configure:

### Frontend (`/app/.env.example`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CARDANO_NETWORK=preprod
```

### Backend (`/swarm/.env.example`)
```env
GOOGLE_API_KEY=your_gemini_api_key
CARDANO_NODE_URL=http://localhost:1337
```

### Contracts (`/contracts/.env.example`)
```env
CARDANO_NETWORK=preprod
BLOCKFROST_API_KEY=your_blockfrost_key
```

---

## 📖 Documentation

- **[Frontend Guide](./app/README.md)** - UI components and wallet integration
- **[API Documentation](./swarm/README.md)** - Backend endpoints and AI agents
- **[Smart Contract Spec](./contracts/README.md)** - On-chain logic and deployment
- **[Hydra Integration](./hydra/README.md)** - L2 scaling strategy

---

## 🛣️ Roadmap

- [x] **Phase 1**: Repository scaffold and architecture design
- [ ] **Phase 2**: Core smart contract development
- [ ] **Phase 3**: AI agent implementation
- [ ] **Phase 4**: Frontend DApp development
- [ ] **Phase 5**: Hydra integration
- [ ] **Phase 6**: Mainnet deployment

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🚀 Phase 3: Oracle Integration (NEW!)

**Phase 3: "The Truth Validator"** - Cryptographically proving real-world events on-chain.

### ✅ What's New

- **Oracle Validator** (`phase3_oracle.ak`) - Ed25519 signature verification
- **Insurance Integration** - Updated `insurance.ak` with oracle triggers
- **Python Oracle Client** - Real-time weather monitoring (< 60s response)
- **FastAPI Endpoints** - Complete REST API for oracle management
- **Production Ready** - Fully tested and deployment scripts included

### 📚 Phase 3 Documentation

- **[🚀 Quick Start Guide](QUICKSTART_PHASE3.md)** - Get started in 5 minutes
- **[📖 Integration Guide](docs/PHASE3_INTEGRATION.md)** - Full deployment instructions
- **[🏗️ Architecture](docs/PHASE3_ARCHITECTURE.md)** - System design and data flow
- **[📝 Summary](PHASE3_SUMMARY.md)** - Complete feature list and checklist

### 🎯 Key Features

```bash
# Validate Phase 3 integration
./scripts/validate_phase3.sh
# Expected: ✅ ALL CHECKS PASSED (9/9)

# Deploy Phase 3
./scripts/deploy_phase3.sh
```

**Code is Law:** Parametric thresholds enforced on-chain, not hidden in backends.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cardano Foundation** - For the robust blockchain infrastructure
- **Aiken Team** - For the elegant smart contract language
- **IOG** - For Hydra scaling research
- **CrewAI** - For the multi-agent framework

---

<div align="center">

**Built with ❤️ for the Cardano Ecosystem**

[⬆ Back to Top](#-project-hyperion)

</div>
